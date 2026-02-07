use pennapi_core::errors::DBError;
use pennapi_core::models::*;
use pennapi_core::repos::UserRepository;
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct UserRepo(PgPool);
impl UserRepo {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}

#[async_trait::async_trait]
impl UserRepository for UserRepo {
    async fn find_many(&self, args: UserFilterArgs) -> Result<Vec<User>, DBError> {
        // TODO: Implement
        Ok(vec![])
    }

    async fn find_unique(&self, args: UserFilterArgs) -> Result<Option<User>, DBError> {
        // TODO: Implement
        Ok(None)
    }

    async fn create(&self, params: &UserCreateParams) -> Result<User, DBError> {
        // TODO: Implement
        Err(DBError::Internal {
            message: "Not implemented".to_string(),
        })
    }

    async fn update(&self, id: Uuid, params: &UserUpdateParams) -> Result<User, DBError> {
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
