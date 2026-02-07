use pennapi_core::errors::DBError;
use pennapi_core::models::*;
use pennapi_core::repos::RecurringRuleRepository;
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct RecurringRuleRepo(PgPool);
impl RecurringRuleRepo {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}

#[async_trait::async_trait]
impl RecurringRuleRepository for RecurringRuleRepo {
    async fn find_many(
        &self,
        args: RecurringRuleFilterArgs,
    ) -> Result<Vec<RecurringRule>, DBError> {
        // TODO: Implement
        Ok(vec![])
    }

    async fn find_unique(
        &self,
        args: RecurringRuleFilterArgs,
    ) -> Result<Option<RecurringRule>, DBError> {
        // TODO: Implement
        Ok(None)
    }

    async fn create(
        &self,
        params: &RecurringRuleCreateParams,
    ) -> Result<RecurringRule, DBError> {
        // TODO: Implement
        Err(DBError::Internal {
            message: "Not implemented".to_string(),
        })
    }

    async fn update(
        &self,
        id: Uuid,
        params: &RecurringRuleUpdateParams,
    ) -> Result<RecurringRule, DBError> {
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
