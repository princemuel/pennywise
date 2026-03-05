use axum::Router;
use axum::routing::{get, post};

use crate::bootstrap::AppState;

async fn handler() {}

pub fn routes() -> Router<AppState> { Router::new().route("/users", get(handler)) }
