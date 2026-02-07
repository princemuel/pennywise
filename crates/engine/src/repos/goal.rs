use uuid::Uuid;

use crate::errors::DBError;
use crate::models::{
    Goal,
    GoalAllocation,
    GoalAllocationCreateParams,
    GoalAllocationFilterArgs,
    GoalCreateParams,
    GoalFilterArgs,
    GoalUpdateParams,
};

#[async_trait::async_trait]
pub trait GoalRepository: Send + Sync {
    async fn find_many(&self, args: GoalFilterArgs) -> Result<Vec<Goal>, DBError>;

    async fn find_unique(&self, args: GoalFilterArgs) -> Result<Option<Goal>, DBError>;

    async fn create(&self, params: &GoalCreateParams) -> Result<Goal, DBError>;

    async fn update(&self, id: Uuid, params: &GoalUpdateParams) -> Result<Goal, DBError>;

    async fn delete(&self, id: Uuid) -> Result<bool, DBError>;
}

#[async_trait::async_trait]
pub trait GoalAllocationRepository: Send + Sync {
    async fn find_many(
        &self,
        args: GoalAllocationFilterArgs,
    ) -> Result<Vec<GoalAllocation>, DBError>;

    async fn find_unique(
        &self,
        args: GoalAllocationFilterArgs,
    ) -> Result<Option<GoalAllocation>, DBError>;

    async fn create(
        &self,
        params: &GoalAllocationCreateParams,
    ) -> Result<GoalAllocation, DBError>;

    async fn delete(&self, id: Uuid) -> Result<bool, DBError>;
}
