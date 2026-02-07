use uuid::Uuid;

use crate::errors::DBError;
use crate::models::{
    RecurringRule,
    RecurringRuleCreateParams,
    RecurringRuleFilterArgs,
    RecurringRuleUpdateParams,
};

#[async_trait::async_trait]
pub trait RecurringRuleRepository: Send + Sync {
    async fn find_many(
        &self,
        args: RecurringRuleFilterArgs,
    ) -> Result<Vec<RecurringRule>, DBError>;

    async fn find_unique(
        &self,
        args: RecurringRuleFilterArgs,
    ) -> Result<Option<RecurringRule>, DBError>;

    async fn create(
        &self,
        params: &RecurringRuleCreateParams,
    ) -> Result<RecurringRule, DBError>;

    async fn update(
        &self,
        id: Uuid,
        params: &RecurringRuleUpdateParams,
    ) -> Result<RecurringRule, DBError>;

    async fn delete(&self, id: Uuid) -> Result<bool, DBError>;
}
