use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use uuid::Uuid;

#[derive(Clone, Debug, sqlx::Type)]
#[sqlx(type_name = "transaction_direction", rename_all = "lowercase")]
pub enum Direction {
    Credit,
    Debit,
}

#[derive(Clone, Debug, sqlx::FromRow)]
pub struct Transaction {
    pub id:          Uuid,
    pub user_id:     Uuid,
    pub avatar_id:   Uuid,
    pub category_id: Uuid,
    pub amount:      Decimal,
    pub direction:   Direction,
    pub date:        DateTime<Utc>,
    pub recurring:   bool,
    pub created_at:  DateTime<Utc>,
}
