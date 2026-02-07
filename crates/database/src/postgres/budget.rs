use pennapi_core::errors::DBError;
use pennapi_core::models::*;
use pennapi_core::repos::BudgetRepository;
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct BudgetRepo(PgPool);
impl BudgetRepo {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}

#[async_trait::async_trait]
impl BudgetRepository for BudgetRepo {
    async fn find_many(&self, args: BudgetFilterArgs) -> Result<Vec<Budget>, DBError> {
        // TODO: Implement
        Ok(vec![])
    }

    async fn find_unique(&self, args: BudgetFilterArgs) -> Result<Option<Budget>, DBError> {
        // TODO: Implement
        Ok(None)
    }

    async fn create(&self, params: &BudgetCreateParams) -> Result<Budget, DBError> {
        // TODO: Implement
        Err(DBError::Internal {
            message: "Not implemented".to_string(),
        })
    }

    async fn update(&self, id: Uuid, params: &BudgetUpdateParams) -> Result<Budget, DBError> {
        // TODO: Implement
        Err(DBError::Internal {
            message: "Not implemented".to_string(),
        })
    }

    async fn delete(&self, id: Uuid) -> Result<bool, DBError> {
        // TODO: Implement
        Ok(false)
    }
}
