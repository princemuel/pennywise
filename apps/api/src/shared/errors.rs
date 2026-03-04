#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Not found")]
    NotFound,

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Conflict")]
    Conflict,

    #[error("Unauthorized")]
    Unauthorized,

    #[error("Database error")]
    Database,

    #[error("Unexpected error")]
    Unexpected,
}
