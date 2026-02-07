<<<<<<< HEAD

=======
//! Shared domain models, repository traits, and error types.
//!
//! This crate defines the application's stable core with no dependencies on
//! HTTP, databases, or external systems. All other crates depend on this one.
//!
//! ## Contents
//!
//! - **Models** - Business entity structs
//! - **Repository traits** - Database interface contracts
//! - **DBError** - Unified error type for all repository operations
pub mod errors;
pub mod models;
pub mod repos;

// Re-export common types
pub use errors::DBError;
pub use models::*;
pub use repos::*;
>>>>>>> 64af84e65373887657c6f2b62e0b42f4ea4ea587
