use uuid::Uuid;

use crate::errors::DBError;
use crate::models::{User, UserCreateParams, UserFilterArgs, UserUpdateParams};

#[async_trait::async_trait]
pub trait UserRepository: Send + Sync {
    async fn find_many(&self, args: UserFilterArgs) -> Result<Vec<User>, DBError>;

    async fn find_unique(&self, args: UserFilterArgs) -> Result<Option<User>, DBError>;

    async fn create(&self, params: &UserCreateParams) -> Result<User, DBError>;

    async fn update(&self, id: Uuid, params: &UserUpdateParams) -> Result<User, DBError>;

    async fn delete(&self, id: Uuid) -> Result<bool, DBError>;
}
