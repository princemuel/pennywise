use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use uuid::Uuid;

#[derive(Clone, Debug, sqlx::FromRow)]
pub struct Budget {
    pub id:          Uuid,
    pub user_id:     Uuid,
    pub category_id: Uuid,
    pub maximum:     Decimal,
    pub theme:       String,
    pub deleted_at:  Option<DateTime<Utc>>,
    pub created_at:  DateTime<Utc>,
    pub updated_at:  DateTime<Utc>,
}
