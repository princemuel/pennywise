use chrono::NaiveDate;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::UserOwned;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum BudgetPeriod {
    Weekly,
    Monthly,
    Quarterly,
    Yearly,
}

impl BudgetPeriod {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Weekly => "weekly",
            Self::Monthly => "monthly",
            Self::Quarterly => "quarterly",
            Self::Yearly => "yearly",
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum BudgetScopeType {
    Category,
    Account,
}

impl BudgetScopeType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Category => "category",
            Self::Account => "account",
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Budget {
    pub id:              Uuid,
    pub user_id:         Uuid,
    pub scope_type:      BudgetScopeType,
    pub scope_id:        Uuid,
    pub period:          BudgetPeriod,
    pub limit_amount:    Decimal,
    pub currency_code:   String,
    pub starts_on:       NaiveDate,
    pub ends_on:         Option<NaiveDate>,
    pub rollover:        bool,
    pub alert_threshold: Option<Decimal>,
    pub created_at:      chrono::DateTime<chrono::Utc>,
}
impl UserOwned for Budget {
    fn user_id(&self) -> Uuid { self.user_id }
}

#[derive(Clone, Debug, Deserialize)]
pub struct CreateBudgetRequest {
    pub scope_type:      BudgetScopeType,
    pub scope_id:        Uuid,
    pub period:          BudgetPeriod,
    pub limit_amount:    Decimal,
    pub currency_code:   Option<String>,
    pub starts_on:       NaiveDate,
    pub ends_on:         Option<NaiveDate>,
    pub rollover:        Option<bool>,
    pub alert_threshold: Option<Decimal>,
}

#[derive(Clone, Debug, Serialize)]
pub struct BudgetWithProgress {
    #[serde(flatten)]
    pub budget:           Budget,
    pub amount_spent:     Decimal,
    pub amount_remaining: Decimal,
    pub percentage_used:  Decimal,
    pub is_exceeded:      bool,
}

// =============================================================================
// Repository Parameters
// =============================================================================

#[derive(Clone, Debug, Default)]
pub struct BudgetFilterArgs {
    pub id:         Option<Uuid>,
    pub user_id:    Option<Uuid>,
    pub scope_type: Option<BudgetScopeType>,
}

#[derive(Clone, Debug)]
pub struct BudgetCreateParams {
    pub user_id:         Uuid,
    pub scope_type:      BudgetScopeType,
    pub scope_id:        Uuid,
    pub period:          BudgetPeriod,
    pub limit_amount:    Decimal,
    pub currency_code:   String,
    pub starts_on:       NaiveDate,
    pub ends_on:         Option<NaiveDate>,
    pub rollover:        bool,
    pub alert_threshold: Option<Decimal>,
}

#[derive(Clone, Debug, Default)]
pub struct BudgetUpdateParams {
    pub limit_amount:    Option<Decimal>,
    pub rollover:        Option<bool>,
    pub alert_threshold: Option<Option<Decimal>>,
}
