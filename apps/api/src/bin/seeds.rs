/// src/bin/seed.rs
///
/// Reads db.json (at compile time via include_str!) and seeds the database
/// in FK-safe order:
///   categories → avatars → transactions → budgets → pots
///   → recurring_bills → recurring_bill_payments
///
/// Run with:
///     cargo run --bin seed
use std::collections::{BTreeMap, HashMap, HashSet};

use anyhow::{Context, Result};
use bigdecimal::BigDecimal;
use chrono::{DateTime, Datelike, TimeZone, Utc};
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
    maximum:  f64,
    theme:    String,
}

#[derive(Debug, Deserialize)]
struct PotJson {
    name:   String,
    target: f64,
    theme:  String,
    total:  f64,
}

#[derive(Debug, Deserialize)]
struct TransactionJson {
    name:      String,          // sender / recipient display name
    avatar:    String,          // filename e.g. "emma-richardson.jpg"
    category:  String,
    date:      DateTime<Utc>,   // chrono parses ISO 8601 / RFC 3339 natively
    amount:    f64,             // negative = debit, positive = credit
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

    // Embedded at compile time — no runtime file path needed.
    let raw = include_str!("db.json");
    let db: Db = serde_json::from_str(raw).context("Failed to parse db.json")?;

    println!("⏳ Seeding database...");

    let category_ids = seed_categories(&pool, &db).await?;
    let avatar_ids   = seed_avatars(&pool, &db).await?;
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
//
// HashSet<String> for dedup — we only care about membership, not order.
// Sorted Vec for stable insert order into the DB.
// ---------------------------------------------------------------------------

async fn seed_categories(pool: &PgPool, db: &Db) -> Result<HashMap<String, Uuid>> {
    // HashSet is the right tool here: we want unique names, nothing else.
    let unique: HashSet<String> = db
        .transactions
        .iter()
        .map(|t| t.category.clone())
        .chain(db.budgets.iter().map(|b| b.category.clone()))
        .collect();

    // Sort for deterministic insert order.
    let mut names: Vec<String> = unique.into_iter().collect();
    names.sort();

    let mut map: HashMap<String, Uuid> = HashMap::with_capacity(names.len());

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
//
// BTreeMap<name, filename>: gives us dedup + stable alphabetical iteration
// for free — no sort step needed.
// ---------------------------------------------------------------------------

async fn seed_avatars(pool: &PgPool, db: &Db) -> Result<HashMap<String, Uuid>> {
    // BTreeMap: deduplicates by name (same as HashMap) AND iterates in sorted
    // order, so insert sequence is deterministic without a separate sort step.
    let mut seen: BTreeMap<String, String> = BTreeMap::new();
    for t in &db.transactions {
        seen.entry(t.name.clone()).or_insert_with(|| t.avatar.clone());
    }

    // Output map doesn't need ordering — HashMap is fine for lookups.
    let mut map: HashMap<String, Uuid> = HashMap::with_capacity(seen.len());

    for (name, filename) in &seen {
        let id = sqlx::query_scalar!(
            r#"
            INSERT INTO avatars (name, avatar_url)
            VALUES ($1, $2)
            ON CONFLICT (name) DO UPDATE SET avatar_url = EXCLUDED.avatar_url
            RETURNING id
            "#,
            name,
            filename,   // stored as-is; avatar_url is just the filename from the JSON
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
    pool:         &PgPool,
    db:           &Db,
    category_ids: &HashMap<String, Uuid>,
    avatar_ids:   &HashMap<String, Uuid>,
) -> Result<()> {
    let user_id = get_or_create_seed_user(pool).await?;

    for t in &db.transactions {
        let avatar_id = avatar_ids
            .get(&t.name)
            .with_context(|| format!("No avatar id found for '{}'", t.name))?;

        let category_id = category_ids
            .get(&t.category)
            .with_context(|| format!("No category id found for '{}'", t.category))?;

        let (amount, direction) = if t.amount >= 0.0 {
            (to_decimal(t.amount)?, Direction::Credit)
        } else {
            (to_decimal(t.amount.abs())?, Direction::Debit)
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
    pool:         &PgPool,
    db:           &Db,
    category_ids: &HashMap<String, Uuid>,
) -> Result<()> {
    let user_id = get_or_create_seed_user(pool).await?;

    for b in &db.budgets {
        let category_id = category_ids
            .get(&b.category)
            .with_context(|| format!("No category id found for '{}'", b.category))?;

        sqlx::query!(
            r#"
            INSERT INTO budgets (user_id, category_id, maximum, theme)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT DO NOTHING
            "#,
            user_id,
            category_id,
            to_decimal(b.maximum)?,
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
            to_decimal(p.target)?,
            p.theme,
            to_decimal(p.total)?,
        )
        .fetch_one(pool)
        .await
        .with_context(|| format!("Failed to insert pot '{}'", p.name))?;

        if p.total > 0.0 {
            sqlx::query!(
                r#"
                INSERT INTO pot_transactions (pot_id, amount, note)
                VALUES ($1, $2, 'initial seed deposit')
                "#,
                pot_id,
                to_decimal(p.total)?,
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
//
// HashMap<&str, &TransactionJson>: keyed by name for O(1) dedup lookups.
// We only need the latest transaction per bill — no ordering required.
// ---------------------------------------------------------------------------

async fn seed_recurring_bills(
    pool:         &PgPool,
    db:           &Db,
    category_ids: &HashMap<String, Uuid>,
    avatar_ids:   &HashMap<String, Uuid>,
) -> Result<()> {
    let user_id = get_or_create_seed_user(pool).await?;

    // HashMap is correct here: we deduplicate by name, keeping the latest date.
    // We don't need sorted iteration — inserts are independent of each other.
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
            .get(t.category.as_str())
            .with_context(|| format!("No category id for '{}'", t.category))?;

        // billday = day-of-month in UTC, clamped to 28.
        let billday = (t.date.day() as i16).min(28);

        let amount = to_decimal(t.amount.abs())?;

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
//
// For every recurring transaction in the JSON, find the recurring_bill row
// (by avatar + category), compute the due deadline for that billing cycle,
// then insert a payment record linking back to the transaction.
//
// Bills with one occurrence → one payment record.
// Bills with two occurrences (Jul + Aug) → two payment records.
// ---------------------------------------------------------------------------

async fn seed_recurring_bill_payments(
    pool:         &PgPool,
    db:           &Db,
    category_ids: &HashMap<String, Uuid>,
    avatar_ids:   &HashMap<String, Uuid>,
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
            .get(t.category.as_str())
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
        // e.g. billday=2, July transaction → deadline = 2024-07-02
        let month_start = Utc
            .with_ymd_and_hms(t.date.year(), t.date.month(), 1, 0, 0, 0)
            .single()
            .with_context(|| format!("Invalid month_start for '{}'", t.name))?;

        let deadline = (month_start + chrono::Duration::days(billday as i64 - 1))
            .date_naive();

        // Look up the transaction's DB id by exact match on the natural key.
        let transaction_id: Uuid = sqlx::query_scalar!(
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
            to_decimal(t.amount.abs())?,
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
            t.date,         // paid_at = when the transaction occurred
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

/// Upserts a seed user and returns their id. Called by any seeder that needs
/// a user_id FK. Uses a single round-trip per seeder via ON CONFLICT.
async fn get_or_create_seed_user(pool: &PgPool) -> Result<Uuid> {
    let id = sqlx::query_scalar!(
        r#"
        INSERT INTO users (email, name, password)
        VALUES ('seed@example.com', 'Seed User', 'not-a-real-hash')
        ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
        RETURNING id
        "#,
    )
    .fetch_one(pool)
    .await
    .context("Failed to upsert seed user")?;

    Ok(id)
}

/// Converts f64 → BigDecimal for NUMERIC columns.
/// Safe here since all values in db.json have at most 2 decimal places.
fn to_decimal(value: f64) -> Result<BigDecimal> {
    BigDecimal::try_from(value).context("Failed to convert f64 to BigDecimal")
}
