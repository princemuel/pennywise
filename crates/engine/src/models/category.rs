use serde::{Deserialize, Serialize};
use uuid::Uuid;

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
    pub user_id: Option<Uuid>,
    pub parent_id: Option<Uuid>,
    pub name: String,
    pub kind: CategoryKind,
    pub archived_at: Option<chrono::DateTime<chrono::Utc>>,
    pub created_at: chrono::DateTime<chrono::Utc>,
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
}

// =============================================================================
// Repository Parameters
// =============================================================================

#[derive(Clone, Debug, Default)]
pub struct CategoryFilterArgs {
    pub id: Option<Uuid>,
    pub user_id: Option<Uuid>,
    pub kind: Option<CategoryKind>,
    pub archived_at: Option<bool>, // true = archived, false = active
}

#[derive(Clone, Debug)]
pub struct CategoryCreateParams {
    pub user_id: Option<Uuid>,
    pub parent_id: Option<Uuid>,
    pub name: String,
    pub kind: CategoryKind,
}

#[derive(Clone, Debug, Default)]
pub struct CategoryUpdateParams {
    pub name: Option<String>,
    pub parent_id: Option<Uuid>,
}
