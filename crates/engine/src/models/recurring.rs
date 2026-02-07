use chrono::NaiveDate;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum RecurrenceCadence {
    Daily,
    Weekly,
    BiWeekly,
    Monthly,
    Quarterly,
    Yearly,
}

impl RecurrenceCadence {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Daily => "daily",
            Self::Weekly => "weekly",
            Self::BiWeekly => "biweekly",
            Self::Monthly => "monthly",
            Self::Quarterly => "quarterly",
            Self::Yearly => "yearly",
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RecurringRule {
    pub id: Uuid,
    pub user_id: Uuid,
    pub cadence: RecurrenceCadence,
    pub amount: Decimal,
    pub account_id: Uuid,
    pub category_id: Option<Uuid>,
    pub description: String,
    pub next_run_at: NaiveDate,
    pub end_at: Option<NaiveDate>,
    pub active: bool,
    pub auto_create: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Clone, Debug, Deserialize)]
pub struct CreateRecurringRuleRequest {
    pub cadence: RecurrenceCadence,
    pub amount: Decimal,
    pub account_id: Uuid,
    pub category_id: Option<Uuid>,
    pub description: String,
    pub start_date: NaiveDate,
    pub end_at: Option<NaiveDate>,
    pub auto_create: bool,
}

// =============================================================================
// Repository Parameters
// =============================================================================

#[derive(Clone, Debug, Default)]
pub struct RecurringRuleFilterArgs {
    pub id: Option<Uuid>,
    pub user_id: Option<Uuid>,
    pub active: Option<bool>,
}

#[derive(Clone, Debug)]
pub struct RecurringRuleCreateParams {
    pub user_id: Uuid,
    pub cadence: RecurrenceCadence,
    pub amount: Decimal,
    pub account_id: Uuid,
    pub category_id: Option<Uuid>,
    pub description: String,
    pub next_run_at: NaiveDate,
    pub end_at: Option<NaiveDate>,
    pub auto_create: bool,
}

#[derive(Clone, Debug, Default)]
pub struct RecurringRuleUpdateParams {
    pub cadence: Option<RecurrenceCadence>,
    pub amount: Option<Decimal>,
    pub next_run_at: Option<NaiveDate>,
    pub end_at: Option<Option<NaiveDate>>,
    pub active: Option<bool>,
}
