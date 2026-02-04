//! Shared error types for domain and repository layers.

use thiserror::Error;

/// Repository method error type.
///
/// Database backends in `pennapi-db` map driver-specific errors (sqlx, diesel)
/// to these variants. Application and HTTP layers only handle `DbError`, never
/// raw database errors.
///
/// Defined in `pennapi-core` (not `pennapi-db`) to avoid circular dependencies,
/// since repository traits live here and return this type.
#[derive(Debug, Error)]
pub enum DBError {
    /// Expected row does not exist.
    #[error("Record not found")]
    NotFound,

    /// Unique constraint violation.
    #[error("Unique constraint failed on field: {field}")]
    UniqueConstraintViolation { field: String },

    /// Foreign key constraint violation.
    #[error("Foreign key constraint failed on field: {field}")]
    ForeignKeyConstraintViolation { field: String },

    /// Null constraint violation (NOT NULL).
    #[error("Null constraint violation on field: {field}")]
    NullConstraintViolation { field: String },

    /// Check constraint violation.
    #[error("Check constraint failed: {constraint}")]
    CheckConstraintViolation { constraint: String },

    /// Database connection failed or was lost.
    #[error("Connection error: {message}")]
    ConnectionError { message: String },

    /// Query timed out.
    #[error("Query timeout")]
    Timeout,

    /// Transaction failed or was aborted.
    #[error("Transaction error: {message}")]
    TransactionError { message: String },

    /// Invalid input or malformed query.
    #[error("Invalid query: {message}")]
    InvalidQuery { message: String },

    /// Any other database error.
    #[error("Database error: {message}")]
    Internal { message: String },
}
