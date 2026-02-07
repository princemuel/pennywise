use chrono::NaiveDate;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::UserOwned;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum AccountType {
    Checking,
    Savings,
    Credit,
    Cash,
    Investment,
}

impl AccountType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Checking => "checking",
            Self::Savings => "savings",
            Self::Credit => "credit",
            Self::Cash => "cash",
            Self::Investment => "investment",
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Account {
    pub id:                   Uuid,
    pub user_id:              Uuid,
    pub name:                 String,
    pub account_type:         AccountType,
    pub currency_code:        String,
    pub institution_name:     Option<String>,
    pub account_number_last4: Option<String>,
    pub opened_at:            Option<NaiveDate>,
    pub closed_at:            Option<NaiveDate>,
    pub metadata:             Option<serde_json::Value>,
    pub created_at:           chrono::DateTime<chrono::Utc>,
}
impl UserOwned for Account {
    fn user_id(&self) -> Uuid { self.user_id }
}

/// Balance is derived, never stored
#[derive(Clone, Debug, Serialize)]
pub struct AccountWithBalance {
    #[serde(flatten)]
    pub account: Account,
    pub balance: Decimal,
}

#[derive(Clone, Debug, Deserialize)]
pub struct CreateAccountRequest {
    pub name:                 String,
    pub account_type:         AccountType,
    pub currency_code:        Option<String>,
    pub institution_name:     Option<String>,
    pub account_number_last4: Option<String>,
    pub opened_at:            Option<NaiveDate>,
}

// =============================================================================
// Repository Parameters
// =============================================================================

#[derive(Clone, Debug, Default)]
pub struct AccountFilterArgs {
    pub id:      Option<Uuid>,
    pub user_id: Option<Uuid>,
}

#[derive(Clone, Debug)]
pub struct AccountCreateParams {
    pub user_id:       Uuid,
    pub name:          String,
    pub account_type:  AccountType,
    pub currency_code: String,
}

#[derive(Clone, Debug, Default)]
pub struct AccountUpdateParams {
    pub id:        Uuid,
    pub name:      Option<String>,
    pub closed_at: Option<NaiveDate>,
}
