use pennapi_core::errors::DBError;
use pennapi_core::models::*;
use pennapi_core::repos::{GoalAllocationRepository, GoalRepository};
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct GoalRepo(PgPool);

impl GoalRepo {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}

#[async_trait::async_trait]
impl GoalRepository for GoalRepo {
    async fn find_many(&self, args: GoalFilterArgs) -> Result<Vec<Goal>, DBError> {
        // TODO: Implement
        Ok(vec![])
    }

    async fn find_unique(&self, args: GoalFilterArgs) -> Result<Option<Goal>, DBError> {
        // TODO: Implement
        Ok(None)
    }

    async fn create(&self, params: &GoalCreateParams) -> Result<Goal, DBError> {
        // TODO: Implement
        Err(DBError::Internal {
            message: "Not implemented".to_string(),
        })
    }

    async fn update(&self, id: Uuid, params: &GoalUpdateParams) -> Result<Goal, DBError> {
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

#[derive(Debug, Clone)]
pub struct GoalAllocationRepo(PgPool);

impl GoalAllocationRepo {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}

#[async_trait::async_trait]
impl GoalAllocationRepository for GoalAllocationRepo {
    async fn find_many(
        &self,
        args: GoalAllocationFilterArgs,
    ) -> Result<Vec<GoalAllocation>, DBError> {
        // TODO: Implement
        Ok(vec![])
    }

    async fn find_unique(
        &self,
        args: GoalAllocationFilterArgs,
    ) -> Result<Option<GoalAllocation>, DBError> {
        // TODO: Implement
        Ok(None)
    }

    async fn create(
        &self,
        params: &GoalAllocationCreateParams,
    ) -> Result<GoalAllocation, DBError> {
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
