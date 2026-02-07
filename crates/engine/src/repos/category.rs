use uuid::Uuid;

use crate::errors::DBError;
use crate::models::{Category, CategoryCreateParams, CategoryFilterArgs, CategoryUpdateParams};

#[async_trait::async_trait]
pub trait CategoryRepository: Send + Sync {
    async fn find_many(&self, args: CategoryFilterArgs) -> Result<Vec<Category>, DBError>;

    async fn find_unique(&self, args: CategoryFilterArgs) -> Result<Option<Category>, DBError>;

    async fn create(&self, params: &CategoryCreateParams) -> Result<Category, DBError>;

    async fn update(
        &self,
        id: Uuid,
        params: &CategoryUpdateParams,
    ) -> Result<Category, DBError>;

    async fn delete(&self, id: Uuid) -> Result<bool, DBError>;
}
