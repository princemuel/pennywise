/// src/bin/seed.rs
///
/// Reads db.json (relative to this file's source location, i.e.
/// src/bin/db.json) and seeds the database in FK-safe order:
///   categories → avatars → transactions → budgets → pots → recurring_bills
///
/// Run with:
///     cargo run --bin seed
use std::collections::HashMap;
use std::path::Path;

use anyhow::{Context, Result};
use bigdecimal::BigDecimal;
use chrono::{DateTime, Datelike, Utc};
use serde::Deserialize;
use sqlx::PgPool;
use sqlx::postgres::PgPoolOptions;
use uuid::Uuid;

// ---------------------------------------------------------------------------
// Rust mirror of the Postgres `transaction_direction` ENUM.
// The derive gives sqlx the type mapping it needs for query! macros.
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
    name:      String, // sender / recipient display name
    avatar:    String, // filename e.g. "emma-richardson.jpg"
    category:  String,
    date:      DateTime<Utc>, // chrono parses ISO 8601 / RFC 3339 natively
    amount:    f64,           // negative = debit, positive = credit
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

    // db.json lives next to this source file: src/bin/db.json
    let json_path = Path::new(env!("CARGO_MANIFEST_DIR")).join("src/bin/db.json");

    let raw = std::fs::read_to_string(&json_path)
        .with_context(|| format!("Could not read {}", json_path.display()))?;

    let db: Db = serde_json::from_str(&raw).context("Failed to parse db.json")?;

    println!("⏳ Seeding database...");

    let category_ids = seed_categories(&pool, &db).await?;
    let avatar_ids = seed_avatars(&pool, &db).await?;
    seed_transactions(&pool, &db, &category_ids, &avatar_ids).await?;
    seed_budgets(&pool, &db, &category_ids).await?;
    seed_pots(&pool, &db).await?;
    seed_recurring_bills(&pool, &db, &category_ids, &avatar_ids).await?;

    println!("✅ Done.");
    Ok(())
}

// ---------------------------------------------------------------------------
// categories
// ---------------------------------------------------------------------------

async fn seed_categories(pool: &PgPool, db: &Db) -> Result<HashMap<String, Uuid>> {
    let mut names: Vec<String> = db
        .transactions
        .iter()
        .map(|t| t.category.clone())
        .chain(db.budgets.iter().map(|b| b.category.clone()))
        .collect();

    names.sort();
    names.dedup();

    let mut map = HashMap::new();

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
    let mut seen: HashMap<String, String> = HashMap::new();
    for t in &db.transactions {
        seen.entry(t.name.clone())
            .or_insert_with(|| t.avatar.clone());
    }

    let mut map = HashMap::new();

    for (name, filename) in &seen {
        let avatar_url = format!("./assets/images/avatars/{filename}");

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

        // chrono's DateTime<Utc> maps directly to TIMESTAMPTZ — no wrapper needed.
        sqlx::query!(
            r#"
            INSERT INTO transactions (avatar_id, category_id, amount, direction, date, recurring)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT DO NOTHING
            "#,
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
            .get(t.category.as_str())
            .with_context(|| format!("No category id for '{}'", t.category))?;

        // billday = day-of-month in UTC, clamped to 28.
        // chrono's Datelike trait provides .day() directly on DateTime<Utc>.
        let billday = (t.date.day0() as i16).min(28);

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
// Helpers
// ---------------------------------------------------------------------------

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

fn to_decimal(value: f64) -> Result<BigDecimal> {
    BigDecimal::try_from(value).context("Failed to convert f64 to BigDecimal")
}
