//! Domain models for the financial application.
//!
//! Models are organized by domain entity and re-exported here for convenience.

mod account;
mod bills;
mod budget;
mod category;
mod goal;
mod pots;
mod recurring;
mod transaction;
mod user;

// Re-export all submodule types
pub use account::*;
pub use bills::*;
pub use budget::*;
pub use category::*;
use chrono::{DateTime, Utc};
pub use goal::*;
pub use pots::*;
pub use recurring::*;
use serde::{Deserialize, Serialize};
pub use transaction::*;
pub use user::*;
use uuid::Uuid;

// =============================================================================
// AUTH LAYER (session-based, not JWT)
// =============================================================================

/// Verified identity from auth provider (Clerk, NextAuth, Auth0)
/// This is what your auth middleware produces.
/// NOT serialized - only used internally for route authorization.
#[derive(Clone, Debug)]
pub struct VerifiedIdentity {
    pub provider:         String, // "google", "github", "email"
    pub provider_user_id: String, // External ID from provider
    pub email:            String,
    pub session_id:       String,
}

/// Maps external identity to internal user
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AuthCredential {
    pub id:               Uuid,
    pub user_id:          Uuid,
    pub provider:         String, // "google", "github", "email"
    pub provider_user_id: Option<String>, // NULL for email/password
    #[serde(skip_serializing)]
    pub passhash:         Option<String>, // NULL for OAuth
    pub created_at:       DateTime<Utc>,
    pub last_used_at:     Option<DateTime<Utc>>,
}

/// Optional: if using NextAuth DB sessions
#[derive(Clone, Debug)]
pub struct Session {
    pub id:               Uuid,
    pub user_id:          Uuid,
    pub expires_at:       DateTime<Utc>,
    pub session_token:    String,
    pub created_at:       DateTime<Utc>,
    pub last_activity_at: DateTime<Utc>,
}

// =============================================================================
// REQUEST CONTEXT
// =============================================================================

/// Authenticated request context passed through request extensions.
/// Your handlers receive this, never raw auth data.
#[derive(Clone, Debug)]
pub struct AuthContext {
    pub user_id:    Uuid,   // Internal user ID
    pub session_id: String, // For logging/audit
}

// =============================================================================
// API RESPONSES
// =============================================================================

#[derive(Clone, Debug, Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data:    Option<T>,
    pub error:   Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data:    Some(data),
            error:   None,
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data:    None,
            error:   Some(message),
        }
    }
}

#[derive(Clone, Debug, Serialize)]
pub struct PaginatedResponse<T> {
    pub items:    Vec<T>,
    pub total:    i64,
    pub page:     i32,
    pub per_page: i32,
    pub has_more: bool,
}

// =============================================================================
// DASHBOARD / ANALYTICS
// =============================================================================

#[derive(Clone, Debug, Serialize)]
pub struct DashboardSummary {
    pub total_balance:       rust_decimal::Decimal,
    pub accounts:            Vec<AccountWithBalance>,
    pub recent_transactions: Vec<TransactionWithEntries>,
    pub budget_progress:     Vec<BudgetWithProgress>,
    pub active_goals:        Vec<GoalWithProgress>,
    pub upcoming_recurring:  Vec<RecurringRule>,
}

#[derive(Clone, Debug, Serialize)]
pub struct MonthlySpending {
    pub month:          chrono::NaiveDate,
    pub total_income:   rust_decimal::Decimal,
    pub total_expenses: rust_decimal::Decimal,
    pub net:            rust_decimal::Decimal,
    pub by_category:    Vec<CategorySpending>,
}

#[derive(Clone, Debug, Serialize)]
pub struct CategorySpending {
    pub category_id:       Uuid,
    pub category_name:     String,
    pub amount:            rust_decimal::Decimal,
    pub transaction_count: i32,
}

// =============================================================================
// HELPER TRAITS
// =============================================================================

/// Trait for entities that are user-owned
pub trait UserOwned {
    fn user_id(&self) -> Uuid;
}

// impl UserOwned for Goal {
//     fn user_id(&self) -> Uuid { self.user_id }
// }

// impl UserOwned for RecurringRule {
//     fn user_id(&self) -> Uuid { self.user_id }
// }

// impl UserOwned for Category {
//     fn user_id(&self) -> Uuid { self.user_id.unwrap_or_else(Uuid::now_v7) }
// }

// =============================================================================
// EXAMPLE: Transaction Creation
// =============================================================================

//  Example: Simple expense
//  User buys coffee for $5.50
//
//  let request = CreateTransactionRequest {
//      occurred_at: Some(Utc::now()),
//      description: Some("Coffee at Starbucks".to_string()),
//      entries: vec![
//          CreateEntryRequest {
//              account_id: checking_account_id,
//              category_id: Some(dining_out_category_id),
//              amount: Decimal::from_str("-5.50").unwrap(),
//              notes: None,
//          }
//      ]
//  };

//  Example: Transfer between accounts
//  User moves $100 from checking to savings
//
//  let request = CreateTransactionRequest {
//      occurred_at: Some(Utc::now()),
//      description: Some("Transfer to savings".to_string()),
//      entries: vec![
//          CreateEntryRequest {
//              account_id: checking_account_id,
//              category_id: Some(transfer_category_id),
//              amount: Decimal::from_str("-100.00").unwrap(),
//              notes: None,
//          },
//          CreateEntryRequest {
//              account_id: savings_account_id,
//              category_id: Some(transfer_category_id),
//              amount: Decimal::from_str("100.00").unwrap(),
//              notes: None,
//          }
//      ]
//  };

// Example: Split transaction
// User pays $100 restaurant bill split across categories
//
// let request = CreateTransactionRequest {
//     occurred_at: Some(Utc::now()),
//     description: Some("Dinner with clients".to_string()),
//     entries: vec![
//         CreateEntryRequest {
//             account_id: checking_account_id,
//             category_id: Some(dining_out_category_id),
//             amount: Decimal::from_str("-60.00").unwrap(),
//             notes: Some("Personal portion".to_string()),
//         },
//         CreateEntryRequest {
//             account_id: checking_account_id,
//             category_id: Some(business_meals_category_id),
//             amount: Decimal::from_str("-40.00").unwrap(),
//             notes: Some("Business expense".to_string()),
//         }
//     ]
// };
//
