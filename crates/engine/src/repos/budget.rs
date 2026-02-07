use uuid::Uuid;

use crate::errors::DBError;
use crate::models::{Budget, BudgetCreateParams, BudgetFilterArgs, BudgetUpdateParams};

#[async_trait::async_trait]
pub trait BudgetRepository: Send + Sync {
    async fn find_many(&self, args: BudgetFilterArgs) -> Result<Vec<Budget>, DBError>;

    async fn find_unique(&self, args: BudgetFilterArgs) -> Result<Option<Budget>, DBError>;

    async fn create(&self, params: &BudgetCreateParams) -> Result<Budget, DBError>;

    async fn update(&self, id: Uuid, params: &BudgetUpdateParams) -> Result<Budget, DBError>;

    async fn delete(&self, id: Uuid) -> Result<bool, DBError>;
}
