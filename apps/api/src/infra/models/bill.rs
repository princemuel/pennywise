use chrono::{DateTime, NaiveDate, Utc};
use rust_decimal::Decimal;
use uuid::Uuid;

#[derive(Clone, Debug, sqlx::FromRow)]
pub struct RecurringBill {
    pub id:          Uuid,
    pub user_id:     Uuid,
    pub avatar_id:   Uuid,
    pub category_id: Uuid,
    pub amount:      Decimal,
    pub billday:     i16,
    pub is_active:   bool,
    pub deleted_at:  Option<DateTime<Utc>>,
    pub created_at:  DateTime<Utc>,
    pub updated_at:  DateTime<Utc>,
}

#[derive(Clone, Debug, sqlx::FromRow)]
pub struct RecurringBillPayment {
    pub id:             Uuid,
    pub bill_id:        Uuid,
    /// DATE in Postgres → NaiveDate in Rust (no timezone — it's just a calendar
    /// date).
    pub deadline:       NaiveDate,
    /// None = unpaid/upcoming, Some = paid at this timestamp.
    pub paid_at:        Option<DateTime<Utc>>,
    /// None if the linked transaction was deleted (ON DELETE SET NULL).
    pub transaction_id: Option<Uuid>,
    pub created_at:     DateTime<Utc>,
}
