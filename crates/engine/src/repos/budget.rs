use uuid::Uuid;

use crate::errors::DBError;
use crate::models::*;

#[async_trait::async_trait]
pub trait BudgetRepository: Send + Sync {
    async fn create(
        &self,
        user_id: Uuid,
        input: &CreateBudgetRequest,
    ) -> Result<Budget, DBError>;

    async fn find_by_id(&self, id: Uuid) -> Result<Option<Budget>, DBError>;

    /// All budgets for a given user + month.
    async fn find_by_user_and_month(
        &self,
        user_id: Uuid,
        month: chrono::NaiveDate,
    ) -> Result<Vec<Budget>, DBError>;

    async fn delete(&self, id: Uuid) -> Result<bool, DBError>;
}
