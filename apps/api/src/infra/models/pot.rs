use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use uuid::Uuid;

#[derive(Clone, Debug, sqlx::FromRow)]
pub struct Pot {
    pub id:         Uuid,
    pub user_id:    Uuid,
    pub name:       String,
    pub target:     Decimal,
    pub theme:      String,
    pub total:      Decimal,
    pub deleted_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Clone, Debug, sqlx::FromRow)]
pub struct PotTransaction {
    pub id:         Uuid,
    pub pot_id:     Uuid,
    /// Signed: positive = deposit, negative = withdrawal.
    /// Unlike `transactions.amount` which is always positive + direction enum,
    /// pot_transactions uses sign because movements are internal with no
    /// external counterparty — there's no "direction" concept to name.
    pub amount:     Decimal,
    pub note:       Option<String>,
    pub created_at: DateTime<Utc>,
}
