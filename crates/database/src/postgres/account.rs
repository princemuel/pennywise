use pennapi_core::errors::DBError;
use pennapi_core::models::*;
use pennapi_core::repos::AccountRepository;
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct AccountRepo(PgPool);
impl AccountRepo {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}

#[async_trait::async_trait]
impl AccountRepository for AccountRepo {
    async fn find_many(&self, args: AccountFilterArgs) -> Result<Vec<Account>, DBError> {
        // TODO: Implement
        Ok(vec![])
    }

    async fn find_unique(&self, args: AccountFilterArgs) -> Result<Option<Account>, DBError> {
        // TODO: Implement
        Ok(None)
    }

    async fn create(&self, params: &AccountCreateParams) -> Result<Account, DBError> {
        // TODO: Implement
        Err(DBError::Internal {
            message: "Not implemented".to_string(),
        })
    }

    async fn update(&self, id: Uuid, params: &AccountUpdateParams) -> Result<Account, DBError> {
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
