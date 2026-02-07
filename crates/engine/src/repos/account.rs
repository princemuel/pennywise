use uuid::Uuid;

use crate::errors::DBError;
use crate::models::*;

#[derive(Debug, Default)]
pub struct AccountFilterArgs {
    pub id:      Option<Uuid>,
    pub user_id: Option<Uuid>,
    // add more filters as needed
}

pub struct CreateAccountRequest {
    pub name:    String,
    pub balance: i64,
}

pub struct UpdateAccountRequest {
    pub id:      Uuid,
    pub name:    Option<String>,
    pub balance: Option<i64>,
}

#[async_trait::async_trait]
pub trait AccountRepository: Send + Sync {
    async fn find_many(&self, args: AccountFilterArgs) -> Result<Vec<Account>, DBError>;
    async fn find_unique(&self, args: AccountFilterArgs) -> Result<Option<Account>, DBError>;
    async fn create(&self, input: &CreateAccountRequest) -> Result<Account, DBError>;
    async fn create_many(
        &self,
        input: &[CreateAccountRequest],
    ) -> Result<Vec<Account>, DBError>;
    async fn update(&self, input: &UpdateAccountRequest) -> Result<Account, DBError>;
    async fn delete(&self, id: Uuid) -> Result<bool, DBError>;
}
