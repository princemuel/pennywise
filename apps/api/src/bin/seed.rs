/// src/bin/seed.rs
///
/// Reads db.json (at compile time via include_str!) and seeds the database
/// in FK-safe order:
///   categories → avatars → transactions → budgets → pots
///   → recurring_bills → recurring_bill_payments
///
/// Run with:
///     cargo run --bin seed
use std::collections::{BTreeMap, BTreeSet, HashMap};

use anyhow::{Context, Result};
use chrono::{DateTime, Datelike, TimeZone, Utc};
use rust_decimal::Decimal;
use serde::Deserialize;
use sqlx::PgPool;
use sqlx::postgres::PgPoolOptions;
use uuid::Uuid;

// ---------------------------------------------------------------------------
// Rust mirror of the Postgres `transaction_direction` ENUM.
// ---------------------------------------------------------------------------

#[derive(Debug, sqlx::Type)]
#[sqlx(type_name = "transaction_direction", rename_all = "lowercase")]
enum Direction {
    Credit,
    Debit,
}

// ---------------------------------------------------------------------------
// JSON shape (mirrors db.json exactly)
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
struct Db {
    budgets:      Vec<BudgetJson>,
    pots:         Vec<PotJson>,
    transactions: Vec<TransactionJson>,
}

#[derive(Debug, Deserialize)]
struct BudgetJson {
    category: String,
    // Deserialize directly as Decimal — no f64 intermediate, no precision loss.
    maximum:  Decimal,
    theme:    String,
}

#[derive(Debug, Deserialize)]
struct PotJson {
    name:   String,
    target: Decimal,
    theme:  String,
    total:  Decimal,
}

#[derive(Debug, Deserialize)]
struct TransactionJson {
    name:      String, // sender / recipient display name
    avatar:    String, // filename e.g. "assets/emma-richardson.jpg"
    category:  String,
    date:      DateTime<Utc>, // chrono parses ISO 8601 / RFC 3339 natively
    // Decimal deserializes JSON numbers exactly — "-49.99" stays "-49.99".
    amount:    Decimal,
    recurring: bool,
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

#[tokio::main]
async fn main() -> Result<()> {
    dotenvy::dotenv().ok();

    let database_url = std::env::var("DATABASE_URL").context("DATABASE_URL must be set")?;

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .context("Failed to connect to database")?;

    // db.json lives next to this file: src/bin/db.json
    let raw = include_str!("db.json");
    let db: Db = serde_json::from_str(raw).context("Failed to parse db.json")?;

    println!("⏳ Seeding database...");

    let category_ids = seed_categories(&pool, &db).await?;
    let avatar_ids = seed_avatars(&pool, &db).await?;
    seed_transactions(&pool, &db, &category_ids, &avatar_ids).await?;
    seed_budgets(&pool, &db, &category_ids).await?;
    seed_pots(&pool, &db).await?;
    seed_recurring_bills(&pool, &db, &category_ids, &avatar_ids).await?;
    seed_recurring_bill_payments(&pool, &db, &category_ids, &avatar_ids).await?;

    println!("✅ Done.");
    Ok(())
}

// ---------------------------------------------------------------------------
// categories
// ---------------------------------------------------------------------------

async fn seed_categories(pool: &PgPool, db: &Db) -> Result<HashMap<String, Uuid>> {
    let names: BTreeSet<String> = db
        .transactions
        .iter()
        .map(|t| t.category.to_lowercase())
        .chain(db.budgets.iter().map(|b| b.category.to_lowercase()))
        .collect();

    let mut map = HashMap::with_capacity(names.len());

    for name in &names {
        let id = sqlx::query_scalar!(
            r#"
            INSERT INTO categories (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
            "#,
            name,
        )
        .fetch_one(pool)
        .await
        .with_context(|| format!("Failed to upsert category '{name}'"))?;

        map.insert(name.clone(), id);
    }

    println!("  ✓ categories ({})", map.len());
    Ok(map)
}

// ---------------------------------------------------------------------------
// avatars
// ---------------------------------------------------------------------------

async fn seed_avatars(pool: &PgPool, db: &Db) -> Result<HashMap<String, Uuid>> {
    let mut seen: BTreeMap<String, String> = BTreeMap::new();
    for t in &db.transactions {
        seen.entry(t.name.clone())
            .or_insert_with(|| t.avatar.clone());
    }

    let mut map = HashMap::with_capacity(seen.len());

    for (name, avatar_url) in &seen {
        let id = sqlx::query_scalar!(
            r#"
            INSERT INTO avatars (name, avatar_url)
            VALUES ($1, $2)
            ON CONFLICT (name) DO UPDATE SET avatar_url = EXCLUDED.avatar_url
            RETURNING id
            "#,
            name,
            avatar_url,
        )
        .fetch_one(pool)
        .await
        .with_context(|| format!("Failed to upsert avatar '{name}'"))?;

        map.insert(name.clone(), id);
    }

    println!("  ✓ avatars ({})", map.len());
    Ok(map)
}

// ---------------------------------------------------------------------------
// transactions
// ---------------------------------------------------------------------------

async fn seed_transactions(
    pool: &PgPool,
    db: &Db,
    category_ids: &HashMap<String, Uuid>,
    avatar_ids: &HashMap<String, Uuid>,
) -> Result<()> {
    let user_id = get_or_create_seed_user(pool).await?;

    for t in &db.transactions {
        let avatar_id = avatar_ids
            .get(&t.name)
            .with_context(|| format!("No avatar id found for '{}'", t.name))?;

        let category_id = category_ids
            .get(&t.category.to_lowercase())
            .with_context(|| format!("No category id found for '{}'", t.category))?;

        // Decimal is Copy and base-10, so abs() is exact with no precision loss.
        let (amount, direction) = if t.amount >= Decimal::ZERO {
            (t.amount, Direction::Credit)
        } else {
            (t.amount.abs(), Direction::Debit)
        };

        sqlx::query!(
            r#"
            INSERT INTO transactions (user_id, avatar_id, category_id, amount, direction, date, recurring)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT DO NOTHING
            "#,
            user_id,
            avatar_id,
            category_id,
            amount,
            direction as Direction,
            t.date,
            t.recurring,
        )
        .execute(pool)
        .await
        .with_context(|| format!("Failed to insert transaction for '{}'", t.name))?;
    }

    println!("  ✓ transactions ({})", db.transactions.len());
    Ok(())
}

// ---------------------------------------------------------------------------
// budgets
// ---------------------------------------------------------------------------

async fn seed_budgets(
    pool: &PgPool,
    db: &Db,
    category_ids: &HashMap<String, Uuid>,
) -> Result<()> {
    let user_id = get_or_create_seed_user(pool).await?;

    for b in &db.budgets {
        let category_id = category_ids
            .get(&b.category.to_lowercase())
            .with_context(|| format!("No category id found for '{}'", b.category))?;

        sqlx::query!(
            r#"
            INSERT INTO budgets (user_id, category_id, maximum, theme)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT DO NOTHING
            "#,
            user_id,
            category_id,
            b.maximum,
            b.theme,
        )
        .execute(pool)
        .await
        .with_context(|| format!("Failed to insert budget for '{}'", b.category))?;
    }

    println!("  ✓ budgets ({})", db.budgets.len());
    Ok(())
}

// ---------------------------------------------------------------------------
// pots
// ---------------------------------------------------------------------------

async fn seed_pots(pool: &PgPool, db: &Db) -> Result<()> {
    let user_id = get_or_create_seed_user(pool).await?;

    for p in &db.pots {
        let pot_id: Uuid = sqlx::query_scalar!(
            r#"
            INSERT INTO pots (user_id, name, target, theme, total)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING
            RETURNING id
            "#,
            user_id,
            p.name,
            p.target,
            p.theme,
            p.total,
        )
        .fetch_one(pool)
        .await
        .with_context(|| format!("Failed to insert pot '{}'", p.name))?;

        if p.total > Decimal::ZERO {
            sqlx::query!(
                r#"
                INSERT INTO pot_transactions (pot_id, amount, note)
                VALUES ($1, $2, 'initial seed deposit')
                "#,
                pot_id,
                p.total,
            )
            .execute(pool)
            .await
            .with_context(|| format!("Failed to insert pot_transaction for '{}'", p.name))?;
        }
    }

    println!("  ✓ pots ({})", db.pots.len());
    Ok(())
}

// ---------------------------------------------------------------------------
// recurring_bills
// ---------------------------------------------------------------------------

async fn seed_recurring_bills(
    pool: &PgPool,
    db: &Db,
    category_ids: &HashMap<String, Uuid>,
    avatar_ids: &HashMap<String, Uuid>,
) -> Result<()> {
    let user_id = get_or_create_seed_user(pool).await?;

    // Deduplicate by name, keeping the latest date.
    let mut latest: HashMap<&str, &TransactionJson> = HashMap::new();
    for t in &db.transactions {
        if !t.recurring {
            continue;
        }
        let entry = latest.entry(t.name.as_str()).or_insert(t);
        if t.date > entry.date {
            *entry = t;
        }
    }

    let mut count = 0;

    for t in latest.values() {
        let avatar_id = avatar_ids
            .get(t.name.as_str())
            .with_context(|| format!("No avatar id for '{}'", t.name))?;

        let category_id = category_ids
            .get(&t.category.to_lowercase())
            .with_context(|| format!("No category id for '{}'", t.category))?;

        // billday = day-of-month in UTC, clamped to 28.
        let billday = (t.date.day() as i16).min(28);
        let amount = t.amount.abs();

        sqlx::query!(
            r#"
            INSERT INTO recurring_bills (user_id, avatar_id, category_id, amount, billday)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING
            "#,
            user_id,
            avatar_id,
            category_id,
            amount,
            billday,
        )
        .execute(pool)
        .await
        .with_context(|| format!("Failed to insert recurring bill for '{}'", t.name))?;

        count += 1;
    }

    println!("  ✓ recurring_bills ({count})");
    Ok(())
}

// ---------------------------------------------------------------------------
// recurring_bill_payments
// ---------------------------------------------------------------------------

async fn seed_recurring_bill_payments(
    pool: &PgPool,
    db: &Db,
    category_ids: &HashMap<String, Uuid>,
    avatar_ids: &HashMap<String, Uuid>,
) -> Result<()> {
    let mut count = 0;

    for t in &db.transactions {
        if !t.recurring {
            continue;
        }

        let avatar_id = avatar_ids
            .get(t.name.as_str())
            .with_context(|| format!("No avatar id for '{}'", t.name))?;

        let category_id = category_ids
            .get(&t.category.to_lowercase())
            .with_context(|| format!("No category id for '{}'", t.category))?;

        // Look up the bill and its billday in one query.
        let (bill_id, billday): (Uuid, i16) = sqlx::query_as(
            r#"
            SELECT id, billday
            FROM recurring_bills
            WHERE avatar_id   = $1
              AND category_id = $2
              AND deleted_at IS NULL
            LIMIT 1
            "#,
        )
        .bind(avatar_id)
        .bind(category_id)
        .fetch_one(pool)
        .await
        .with_context(|| format!("No recurring_bill found for '{}'", t.name))?;

        // deadline = first of the transaction's month + (billday - 1) days.
        let month_start = Utc
            .with_ymd_and_hms(t.date.year(), t.date.month(), 1, 0, 0, 0)
            .single()
            .with_context(|| format!("Invalid month_start for '{}'", t.name))?;

        let deadline = (month_start + chrono::Duration::days(billday as i64 - 1)).date_naive();

        // Look up the transaction's DB id by exact match on the natural key.
        let transaction_id = sqlx::query_scalar!(
            r#"
            SELECT id FROM transactions
            WHERE avatar_id   = $1
              AND category_id = $2
              AND amount      = $3
              AND date        = $4
            LIMIT 1
            "#,
            avatar_id,
            category_id,
            t.amount.abs(),
            t.date,
        )
        .fetch_one(pool)
        .await
        .with_context(|| format!("No transaction row found for '{}'", t.name))?;

        sqlx::query!(
            r#"
            INSERT INTO recurring_bill_payments (bill_id, deadline, paid_at, transaction_id)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (bill_id, deadline) DO NOTHING
            "#,
            bill_id,
            deadline,
            t.date,
            transaction_id,
        )
        .execute(pool)
        .await
        .with_context(|| format!("Failed to insert payment for '{}'", t.name))?;

        count += 1;
    }

    println!("  ✓ recurring_bill_payments ({count})");
    Ok(())
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async fn get_or_create_seed_user(pool: &PgPool) -> Result<Uuid> {
    let id = sqlx::query_scalar!(
        r#"
        INSERT INTO users (email, name, password)
        VALUES ('kalel@pennies.dev', 'kalel', 'kryptonite')
        ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
        RETURNING id
        "#,
    )
    .fetch_one(pool)
    .await
    .context("Failed to upsert seed user")?;

    Ok(id)
}
