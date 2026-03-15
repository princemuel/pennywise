use std::sync::Arc;

use axum::routing::get;
use axum::{Router, middleware};

use crate::controllers::health;
use crate::middlewares::auth::auth;
use crate::state::AppState;

/// Initializes the application's routes.
///
/// This function maps paths (e.g. "/greet") and HTTP methods (e.g. "GET") to
/// functions in [`crate::controllers`] as well as includes middlewares defined
/// in [`crate::middlewares`] into the routing layer (see [`axum::Router`]).
pub fn init_routes(app_state: AppState) -> Router {
    let shared_app_state = Arc::new(app_state);
    Router::new()
        .route("/alive", get(health::alive))
        .route("/ready", get(health::ready))
        .nest(
            "/v1",
            Router::new()
            .route("/health", get(health::index))
            .route("/version", get(health::version))
        // .route("/tasks", post(tasks::create).put(tasks::create_batch))
        // .route("/tasks/{id}", put(tasks::update).delete(tasks::delete))
        .route_layer(middleware::from_fn_with_state(
            shared_app_state.clone(),
            auth,
        )), /* .route("/tasks", get(tasks::read_all))
                         * .route("/tasks/{id}", get(tasks::read_one)) */
        )
        .with_state(shared_app_state)
}
