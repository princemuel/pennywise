use pennapi_core::errors::DBError;
use pennapi_core::models::*;
use pennapi_core::repos::CategoryRepository;
use sqlx::PgPool;

#[derive(Debug, Clone)]
pub struct CategoryRepo(PgPool);

impl CategoryRepo {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}

#[async_trait::async_trait]
impl CategoryRepository for CategoryRepo {
    async fn find_many(&self, args: CategoryFilterArgs) -> Result<Vec<Category>, DBError> {
        // TODO: Implement
        Ok(vec![])
    }

    async fn find_unique(&self, args: CategoryFilterArgs) -> Result<Option<Category>, DBError> {
        // TODO: Implement
        Ok(None)
    }

    async fn create(&self, params: &CategoryCreateParams) -> Result<Category, DBError> {
        // TODO: Implement
        Err(DBError::Internal {
            message: "Not implemented".to_string(),
        })
    }

    async fn update(
        &self,
        id: uuid::Uuid,
        params: &CategoryUpdateParams,
    ) -> Result<Category, DBError> {
        // TODO: Implement
        Err(DBError::Internal {
            message: "Not implemented".to_string(),
        })
    }

    async fn delete(&self, id: uuid::Uuid) -> Result<bool, DBError> {
        // TODO: Implement
        Ok(false)
    }
}
