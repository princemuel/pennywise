use uuid::Uuid;

use crate::errors::DBError;
use crate::models::{Account, AccountCreateParams, AccountFilterArgs, AccountUpdateParams};

#[async_trait::async_trait]
pub trait AccountRepository: Send + Sync {
    async fn find_many(&self, args: AccountFilterArgs) -> Result<Vec<Account>, DBError>;

    async fn find_unique(&self, args: AccountFilterArgs) -> Result<Option<Account>, DBError>;

    async fn create(&self, params: &AccountCreateParams) -> Result<Account, DBError>;

    async fn update(&self, id: Uuid, params: &AccountUpdateParams) -> Result<Account, DBError>;

    async fn delete(&self, id: Uuid) -> Result<bool, DBError>;
}
