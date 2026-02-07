use uuid::Uuid;

use crate::errors::DBError;
use crate::models::*;

#[async_trait::async_trait]
pub trait UserRepository: Send + Sync {
    async fn create(&self, data: &CreateUserRequest, passhash: &str) -> Result<User, DBError>;

    /// Lookup by id
    async fn find_by_id(&self, id: Uuid) -> Result<Option<User>, DBError>;

    /// Lookup by email
    async fn find_by_email(&self, email: &str) -> Result<Option<User>, DBError>;
}
