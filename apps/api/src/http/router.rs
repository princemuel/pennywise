use std::sync::Arc;

use axum::routing::get;
use axum::{Router, middleware as axum_middleware};
use sqlx::PgPool;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;

use super::handlers::health;
use crate::config::Settings;

#[derive(Clone)]
pub struct State;

pub fn build_router(pool: PgPool, settings: &Settings) -> Router {
    let public = Router::new().route("/health", get(health::get));
    let protected = Router::new();

    let state = Arc::new(State);

    Router::new()
        .merge(public)
        .merge(protected)
        .with_state(state)
        .layer(TraceLayer::new_for_http())
        .layer(CorsLayer::permissive())
}
