use chrono::NaiveDate;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

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
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub completed_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GoalAllocation {
    pub id: Uuid,
    pub goal_id: Uuid,
    pub transaction_entry_id: Uuid,
    pub amount: Decimal,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Clone, Debug, Deserialize)]
pub struct CreateGoalRequest {
    pub name: String,
    pub target_amount: Decimal,
    pub currency_code: Option<String>,
    pub target_date: Option<NaiveDate>,
}

#[derive(Clone, Debug, Serialize)]
pub struct GoalWithProgress {
    #[serde(flatten)]
    pub goal: Goal,
    pub current_amount: Decimal,
    pub remaining: Decimal,
    pub percentage_complete: Decimal,
}

// =============================================================================
// Repository Parameters - Goals
// =============================================================================

#[derive(Clone, Debug, Default)]
pub struct GoalFilterArgs {
    pub id: Option<Uuid>,
    pub user_id: Option<Uuid>,
    pub status: Option<GoalStatus>,
}

#[derive(Clone, Debug)]
pub struct GoalCreateParams {
    pub user_id: Uuid,
    pub name: String,
    pub target_amount: Decimal,
    pub currency_code: String,
    pub target_date: Option<NaiveDate>,
}

#[derive(Clone, Debug, Default)]
pub struct GoalUpdateParams {
    pub name: Option<String>,
    pub status: Option<GoalStatus>,
}

// =============================================================================
// Repository Parameters - Goal Allocations
// =============================================================================

#[derive(Clone, Debug, Default)]
pub struct GoalAllocationFilterArgs {
    pub id: Option<Uuid>,
    pub goal_id: Option<Uuid>,
    pub transaction_entry_id: Option<Uuid>,
}

#[derive(Clone, Debug)]
pub struct GoalAllocationCreateParams {
    pub goal_id: Uuid,
    pub transaction_entry_id: Uuid,
    pub amount: Decimal,
}
