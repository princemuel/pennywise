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
pub mod structs;
