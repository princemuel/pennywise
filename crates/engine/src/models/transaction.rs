use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::UserOwned;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum TransactionSource {
    Manual,
    Import,
    Api,
    Recurring,
}

impl TransactionSource {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Manual => "manual",
            Self::Import => "import",
            Self::Api => "api",
            Self::Recurring => "recurring",
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Transaction {
    pub id:          Uuid,
    pub user_id:     Uuid,
    pub occurred_at: chrono::DateTime<chrono::Utc>,
    pub description: Option<String>,
    pub source:      TransactionSource,
    pub created_at:  chrono::DateTime<chrono::Utc>,
}

impl UserOwned for Transaction {
    fn user_id(&self) -> Uuid { self.user_id }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TransactionEntry {
    pub id:             Uuid,
    pub transaction_id: Uuid,
    pub account_id:     Uuid,
    pub category_id:    Option<Uuid>,
    pub amount:         Decimal,
    pub notes:          Option<String>,
    pub created_at:     chrono::DateTime<chrono::Utc>,
}

#[derive(Clone, Debug, Serialize)]
pub struct TransactionWithEntries {
    #[serde(flatten)]
    pub transaction: Transaction,
    pub entries:     Vec<TransactionEntry>,
}

#[derive(Clone, Debug, Deserialize)]
pub struct CreateTransactionRequest {
    pub occurred_at: Option<chrono::DateTime<chrono::Utc>>,
    pub description: Option<String>,
    pub entries:     Vec<CreateEntryRequest>,
}

#[derive(Clone, Debug, Deserialize)]
pub struct CreateEntryRequest {
    pub account_id:  Uuid,
    pub category_id: Option<Uuid>,
    pub amount:      Decimal,
    pub notes:       Option<String>,
}

impl CreateTransactionRequest {
    pub fn validate(&self) -> Result<(), String> {
        if self.entries.is_empty() {
            return Err("Transaction must have at least one entry".to_string());
        }
        for entry in &self.entries {
            if entry.amount == Decimal::ZERO {
                return Err("Entry amount cannot be zero".to_string());
            }
        }
        Ok(())
    }
}

// =============================================================================
// Repository Parameters - Transactions
// =============================================================================

#[derive(Clone, Debug, Default)]
pub struct TransactionFilterArgs {
    pub id:      Option<Uuid>,
    pub user_id: Option<Uuid>,
}

#[derive(Clone, Debug)]
pub struct TransactionCreateParams {
    pub user_id:     Uuid,
    pub occurred_at: Option<chrono::DateTime<chrono::Utc>>,
    pub description: Option<String>,
    pub source:      TransactionSource,
}

#[derive(Clone, Debug, Default)]
pub struct TransactionUpdateParams {
    pub description: Option<String>,
}

// =============================================================================
// Repository Parameters - Transaction Entries
// =============================================================================

#[derive(Clone, Debug, Default)]
pub struct TransactionEntryFilterArgs {
    pub id:             Option<Uuid>,
    pub transaction_id: Option<Uuid>,
    pub account_id:     Option<Uuid>,
    pub category_id:    Option<Uuid>,
}

#[derive(Clone, Debug)]
pub struct TransactionEntryCreateParams {
    pub transaction_id: Uuid,
    pub account_id:     Uuid,
    pub category_id:    Option<Uuid>,
    pub amount:         Decimal,
    pub notes:          Option<String>,
}

#[derive(Clone, Debug, Default)]
pub struct TransactionEntryUpdateParams {
    pub category_id: Option<Uuid>,
    pub amount:      Option<Decimal>,
    pub notes:       Option<String>,
}
