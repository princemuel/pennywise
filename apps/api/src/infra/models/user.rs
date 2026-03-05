use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Clone, Debug, sqlx::FromRow)]
pub struct User {
    pub id:         Uuid,
    pub email:      String,
    pub name:       String,
    pub password:   String,
    pub deleted_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
