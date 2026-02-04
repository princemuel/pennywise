//! Database connection pooling, migrations, and repository implementations.
//!
//! ## Usage
//!
//! - `init_pool()` - Creates connection pool from database URL
//! - `migrate()` - Applies pending SQL migrations
//! - Implements all `pennapi_core::repositories` traits for the active backend
//!
//! ## Backend Selection
//!
//! Enable exactly one backend feature in your `Cargo.toml`:
//! ```toml
//! pennapi-db = { workspace = true, default-features = false, features = ["postgres"] }
//! ```

#[cfg(feature = "postgres")] pub mod pqsl;
// #[cfg(feature = "mysql")]
// pub mod mysql;
// #[cfg(feature = "sqlite")]
// pub mod sqlite;

use std::path::Path;

use pennapi_core::errors::DBError;
use sqlx::PgPool;
use sqlx::migrate::{MigrateError, Migrator};
use sqlx::pool::PoolOptions;

/// Creates a PostgreSQL connection pool with the specified maximum connections.
///
/// # Errors
///
/// Returns an error if the database URL is invalid or connection fails.
pub async fn init_pool(database_url: &str, max_connections: u8) -> Result<PgPool, sqlx::Error> {
    PoolOptions::new()
        .max_connections(max_connections.into())
        .connect(database_url)
        .await
}

/// Runs all pending database migrations from the specified directory.
///
/// Accepts a filesystem path to avoid SQLx macro path restrictions (which
/// require paths relative to the calling crate). Use this when migrations need
/// to be run from anywhere in the workspace.
///
/// # Errors
///
/// Returns an error if the migrations directory is invalid, migrations contain
/// invalid SQL, or database execution fails.
pub async fn migrate<P: AsRef<str>>(pool: &PgPool, path: P) -> Result<(), MigrateError> {
    Migrator::new(Path::new(path.as_ref()))
        .await?
        .run(pool)
        .await?;
    Ok(())
}

pub trait SqlxErrorExt {
    fn into_db_error(self) -> DBError;
}

impl SqlxErrorExt for sqlx::Error {
    fn into_db_error(self) -> DBError {
        match self {
            Self::RowNotFound => DBError::NotFound,
            Self::Database(db_err) => {
                let message = db_err.message();
                match db_err.code().as_deref() {
                    Some("23505") => {
                        let field = extract_constraint_field(message)
                            .unwrap_or_else(|| "unknown".to_string());
                        DBError::UniqueConstraintViolation { field }
                    }
                    Some("23503") => {
                        let field = extract_constraint_field(message)
                            .unwrap_or_else(|| "unknown".to_string());
                        DBError::ForeignKeyConstraintViolation { field }
                    }
                    Some("23502") => {
                        let field = extract_null_column(message)
                            .unwrap_or_else(|| "unknown".to_string());
                        DBError::NullConstraintViolation { field }
                    }
                    Some("23514") => {
                        let constraint = message.to_string();
                        DBError::CheckConstraintViolation { constraint }
                    }
                    _ => DBError::Internal {
                        message: message.to_string(),
                    },
                }
            }
            Self::PoolTimedOut => DBError::Timeout,
            Self::PoolClosed | Self::Io(_) => DBError::ConnectionError {
                message: self.to_string(),
            },
            _ => DBError::Internal {
                message: self.to_string(),
            },
        }
    }
}

fn extract_constraint_field(msg: &str) -> Option<String> {
    msg.split('"')
        .nth(1)
        .and_then(|constraint| constraint.split('_').rev().nth(1).map(String::from))
}
fn extract_null_column(msg: &str) -> Option<String> { msg.split('"').nth(1).map(String::from) }
