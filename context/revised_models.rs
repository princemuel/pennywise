// =============================================================================
// FINANCIAL APP - LEDGER-FIRST RUST MODELS
// =============================================================================

use chrono::{DateTime, NaiveDate, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// =============================================================================
// AUTH LAYER (separate from user profile)
// =============================================================================

/// Verified identity from auth provider (Clerk, NextAuth, Auth0)
/// This is what your auth middleware produces
#[derive(Clone, Debug)]
pub struct VerifiedIdentity {
    pub provider: String,           // "google", "github", "email"
    pub provider_user_id: String,   // External ID from provider
    pub email: String,
    pub session_id: String,
}

/// Internal user (your source of truth)
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub email_verified_at: Option<DateTime<Utc>>,
    pub display_name: String,
    pub timezone: String,
    pub currency: String,
    pub locale: String,
    pub created_at: DateTime<Utc>,
    pub disabled_at: Option<DateTime<Utc>>,
}

/// Maps external identity to internal user
#[derive(Clone, Debug)]
pub struct AuthCredential {
    pub id: Uuid,
    pub user_id: Uuid,
    pub provider: String,                    // "google", "github", "email"
    pub provider_user_id: Option<String>,    // NULL for email/password
    #[serde(skip_serializing)]
    pub password_hash: Option<String>,       // NULL for OAuth
    pub created_at: DateTime<Utc>,
    pub last_used_at: Option<DateTime<Utc>>,
}

/// Optional: if using NextAuth DB sessions
#[derive(Clone, Debug)]
pub struct Session {
    pub id: Uuid,
    pub user_id: Uuid,
    pub expires_at: DateTime<Utc>,
    pub session_token: String,
    pub created_at: DateTime<Utc>,
    pub last_activity_at: DateTime<Utc>,
}

// =============================================================================
// REQUEST CONTEXT
// =============================================================================

/// Authenticated request context
/// Your handlers receive this, never raw auth data
#[derive(Clone, Debug)]
pub struct AuthContext {
    pub user_id: Uuid,              // Internal user ID
    pub session_id: String,         // For logging/audit
}

// =============================================================================
// ACCOUNTS (containers, not balances)
// =============================================================================

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
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub account_type: AccountType,
    pub currency_code: String,
    pub institution_name: Option<String>,
    pub account_number_last4: Option<String>,
    pub opened_at: Option<NaiveDate>,
    pub closed_at: Option<NaiveDate>,
    pub metadata: Option<serde_json::Value>,  // For bank sync
    pub created_at: DateTime<Utc>,
}

/// Balance is derived, never stored
#[derive(Clone, Debug, Serialize)]
pub struct AccountWithBalance {
    #[serde(flatten)]
    pub account: Account,
    pub balance: Decimal,                     // Computed from entries
}

#[derive(Clone, Debug, Deserialize)]
pub struct CreateAccountRequest {
    pub name: String,
    pub account_type: AccountType,
    pub currency_code: Option<String>,
    pub institution_name: Option<String>,
    pub account_number_last4: Option<String>,
    pub opened_at: Option<NaiveDate>,
}

// =============================================================================
// LEDGER (the heart)
// =============================================================================

/// Transaction represents a real-world event
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Transaction {
    pub id: Uuid,
    pub user_id: Uuid,
    pub occurred_at: DateTime<Utc>,
    pub description: Option<String>,
    pub source: TransactionSource,
    pub created_at: DateTime<Utc>,
}

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

/// TransactionEntry is the double-entry component
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TransactionEntry {
    pub id: Uuid,
    pub transaction_id: Uuid,
    pub account_id: Uuid,
    pub category_id: Option<Uuid>,
    pub amount: Decimal,                      // Signed (+ or -)
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
}

/// Full transaction with all entries
#[derive(Clone, Debug, Serialize)]
pub struct TransactionWithEntries {
    #[serde(flatten)]
    pub transaction: Transaction,
    pub entries: Vec<TransactionEntry>,
}

/// Create transaction request
#[derive(Clone, Debug, Deserialize)]
pub struct CreateTransactionRequest {
    pub occurred_at: Option<DateTime<Utc>>,   // Defaults to now
    pub description: Option<String>,
    pub entries: Vec<CreateEntryRequest>,     // At least 1 entry required
}

#[derive(Clone, Debug, Deserialize)]
pub struct CreateEntryRequest {
    pub account_id: Uuid,
    pub category_id: Option<Uuid>,
    pub amount: Decimal,
    pub notes: Option<String>,
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
// CATEGORIES (hierarchical)
// =============================================================================

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum CategoryKind {
    Income,
    Expense,
    Transfer,
}

impl CategoryKind {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Income => "income",
            Self::Expense => "expense",
            Self::Transfer => "transfer",
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Category {
    pub id: Uuid,
    pub user_id: Option<Uuid>,                // NULL = system category
    pub parent_id: Option<Uuid>,
    pub name: String,
    pub kind: CategoryKind,
    pub archived_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Deserialize)]
pub struct CreateCategoryRequest {
    pub name: String,
    pub parent_id: Option<Uuid>,
    pub kind: CategoryKind,
}

/// Category with UI metadata (added by frontend)
#[derive(Clone, Debug, Serialize)]
pub struct CategoryWithUI {
    #[serde(flatten)]
    pub category: Category,
    // Frontend adds: icon, color (not in DB)
}

// =============================================================================
// BUDGETS (rules, not containers)
// =============================================================================

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
    pub id: Uuid,
    pub user_id: Uuid,
    pub scope_type: BudgetScopeType,
    pub scope_id: Uuid,                       // category_id or account_id
    pub period: BudgetPeriod,
    pub limit_amount: Decimal,
    pub currency_code: String,
    pub starts_on: NaiveDate,
    pub ends_on: Option<NaiveDate>,
    pub rollover: bool,
    pub alert_threshold: Option<Decimal>,     // Alert at 80%, etc.
    pub created_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Deserialize)]
pub struct CreateBudgetRequest {
    pub scope_type: BudgetScopeType,
    pub scope_id: Uuid,
    pub period: BudgetPeriod,
    pub limit_amount: Decimal,
    pub currency_code: Option<String>,
    pub starts_on: NaiveDate,
    pub ends_on: Option<NaiveDate>,
    pub rollover: Option<bool>,
    pub alert_threshold: Option<Decimal>,
}

/// Budget with current spending (derived)
#[derive(Clone, Debug, Serialize)]
pub struct BudgetWithProgress {
    #[serde(flatten)]
    pub budget: Budget,
    pub amount_spent: Decimal,                // Computed from entries
    pub amount_remaining: Decimal,
    pub percentage_used: Decimal,
    pub is_exceeded: bool,
}

// =============================================================================
// GOALS (mental accounting)
// =============================================================================

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum GoalStatus {
    Active,
    Completed,
    Abandoned,
}

impl GoalStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Active => "active",
            Self::Completed => "completed",
            Self::Abandoned => "abandoned",
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Goal {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub target_amount: Decimal,
    pub currency_code: String,
    pub target_date: Option<NaiveDate>,
    pub status: GoalStatus,
    pub created_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
}

/// Link transaction entries to goals
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GoalAllocation {
    pub id: Uuid,
    pub goal_id: Uuid,
    pub transaction_entry_id: Uuid,
    pub amount: Decimal,
    pub created_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Deserialize)]
pub struct CreateGoalRequest {
    pub name: String,
    pub target_amount: Decimal,
    pub currency_code: Option<String>,
    pub target_date: Option<NaiveDate>,
}

/// Goal with progress (derived from allocations)
#[derive(Clone, Debug, Serialize)]
pub struct GoalWithProgress {
    #[serde(flatten)]
    pub goal: Goal,
    pub current_amount: Decimal,              // Sum of allocations
    pub remaining: Decimal,
    pub percentage_complete: Decimal,
}

// =============================================================================
// RECURRING RULES (not booleans)
// =============================================================================

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
    pub auto_create: bool,                    // Auto-post or just notify
    pub created_at: DateTime<Utc>,
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
// API RESPONSES
// =============================================================================

#[derive(Clone, Debug, Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(message),
        }
    }
}

#[derive(Clone, Debug, Serialize)]
pub struct PaginatedResponse<T> {
    pub items: Vec<T>,
    pub total: i64,
    pub page: i32,
    pub per_page: i32,
    pub has_more: bool,
}

// =============================================================================
// DASHBOARD / ANALYTICS
// =============================================================================

#[derive(Clone, Debug, Serialize)]
pub struct DashboardSummary {
    pub total_balance: Decimal,               // Sum of all account balances
    pub accounts: Vec<AccountWithBalance>,
    pub recent_transactions: Vec<TransactionWithEntries>,
    pub budget_progress: Vec<BudgetWithProgress>,
    pub active_goals: Vec<GoalWithProgress>,
    pub upcoming_recurring: Vec<RecurringRule>,
}

#[derive(Clone, Debug, Serialize)]
pub struct MonthlySpending {
    pub month: NaiveDate,
    pub total_income: Decimal,
    pub total_expenses: Decimal,
    pub net: Decimal,
    pub by_category: Vec<CategorySpending>,
}

#[derive(Clone, Debug, Serialize)]
pub struct CategorySpending {
    pub category_id: Uuid,
    pub category_name: String,
    pub amount: Decimal,
    pub transaction_count: i32,
}

// =============================================================================
// FRONTEND CONSTANTS (not in DB)
// =============================================================================

/// These live in your frontend code, never in the database
/// Example TypeScript:
///
/// const CATEGORY_ICONS = {
///   'Salary': 'briefcase',
///   'Groceries': 'shopping-cart',
///   'Dining Out': 'utensils',
/// }
///
/// const CATEGORY_COLORS = {
///   'Salary': '#277C78',
///   'Groceries': '#82C9D7',
///   'Dining Out': '#F2CDAC',
/// }

// =============================================================================
// HELPER TRAITS
// =============================================================================

/// Trait for entities that are user-owned
pub trait UserOwned {
    fn user_id(&self) -> Uuid;
}

impl UserOwned for Transaction {
    fn user_id(&self) -> Uuid {
        self.user_id
    }
}

impl UserOwned for Account {
    fn user_id(&self) -> Uuid {
        self.user_id
    }
}

impl UserOwned for Budget {
    fn user_id(&self) -> Uuid {
        self.user_id
    }
}

impl UserOwned for Goal {
    fn user_id(&self) -> Uuid {
        self.user_id
    }
}

// =============================================================================
// EXAMPLE: Transaction Creation
// =============================================================================

/// Example: Simple expense
/// User buys coffee for $5.50
///
/// let request = CreateTransactionRequest {
///     occurred_at: Some(Utc::now()),
///     description: Some("Coffee at Starbucks".to_string()),
///     entries: vec![
///         CreateEntryRequest {
///             account_id: checking_account_id,
///             category_id: Some(dining_out_category_id),
///             amount: Decimal::from_str("-5.50").unwrap(),
///             notes: None,
///         }
///     ]
/// };

/// Example: Transfer between accounts
/// User moves $100 from checking to savings
///
/// let request = CreateTransactionRequest {
///     occurred_at: Some(Utc::now()),
///     description: Some("Transfer to savings".to_string()),
///     entries: vec![
///         CreateEntryRequest {
///             account_id: checking_account_id,
///             category_id: Some(transfer_category_id),
///             amount: Decimal::from_str("-100.00").unwrap(),
///             notes: None,
///         },
///         CreateEntryRequest {
///             account_id: savings_account_id,
///             category_id: Some(transfer_category_id),
///             amount: Decimal::from_str("100.00").unwrap(),
///             notes: None,
///         }
///     ]
/// };

/// Example: Split transaction
/// User pays $100 restaurant bill split across categories
///
/// let request = CreateTransactionRequest {
///     occurred_at: Some(Utc::now()),
///     description: Some("Dinner with clients".to_string()),
///     entries: vec![
///         CreateEntryRequest {
///             account_id: checking_account_id,
///             category_id: Some(dining_out_category_id),
///             amount: Decimal::from_str("-60.00").unwrap(),
///             notes: Some("Personal portion".to_string()),
///         },
///         CreateEntryRequest {
///             account_id: checking_account_id,
///             category_id: Some(business_meals_category_id),
///             amount: Decimal::from_str("-40.00").unwrap(),
///             notes: Some("Business expense".to_string()),
///         }
///     ]
/// };
