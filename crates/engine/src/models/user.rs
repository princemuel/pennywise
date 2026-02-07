use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct User {
    pub id:                Uuid,
    pub email:             String,
    pub email_verified_at: Option<DateTime<Utc>>,
    pub display_name:      String,
    pub timezone:          String,
    pub currency:          String,
    pub locale:            String,
    pub created_at:        DateTime<Utc>,
    pub disabled_at:       Option<DateTime<Utc>>,
}

#[derive(Clone, Debug, Deserialize)]
pub struct CreateUserRequest {
    pub email:    String,
    /// Plain-text password — hashed by the auth layer before persistence.
    pub password: String,
    pub name:     String,
}

// =============================================================================
// Repository Parameters
// =============================================================================

#[derive(Clone, Debug, Default)]
pub struct UserFilterArgs {
    pub id: Option<Uuid>,
    pub email: Option<String>,
}

#[derive(Clone, Debug)]
pub struct UserCreateParams {
    pub email: String,
    pub display_name: String,
    pub timezone: String,
    pub currency: String,
    pub locale: String,
}

#[derive(Clone, Debug, Default)]
pub struct UserUpdateParams {
    pub display_name: Option<String>,
    pub timezone: Option<String>,
    pub currency: Option<String>,
    pub locale: Option<String>,
    pub disabled_at: Option<Option<DateTime<Utc>>>,
}
