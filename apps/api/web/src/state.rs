use std::sync::Arc;

use api_config::Config;
use api_db::{DbPool, connect_pool};

/// The application's state that is available in [`crate::controllers`] and
/// [`crate::middlewares`].
pub struct AppState {
    /// The database pool that's used to get a connection to the application's
    /// database (see [`api_db::DbPool`]).
    pub db_pool: DbPool,
}

/// The application's state as it is shared across the application, e.g. in
/// controllers and middlewares.
///
/// This is the [`AppState`] struct wrappend in an [`std::sync::Arc`].
pub type SharedAppState = Arc<AppState>;

/// Initializes the application state.
///
/// This function creates an [`AppState`] based on the current
/// [`api_config::Config`].
pub async fn init_app_state(config: &Config) -> AppState {
    let db_pool = connect_pool(&config.database)
        .await
        .expect("Could not connect to database!");

    AppState { db_pool }
}
