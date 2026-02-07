use std::sync::Arc;

use axum::routing::get;
use axum::Router;
use sqlx::PgPool;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;

use super::handlers::health;
use crate::config::Settings;
use pennapi_db::Database;

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<Database>,
    pub config: Arc<Settings>,
}

pub fn build_router(pool: PgPool, settings: Arc<Settings>) -> Router {
    let db = Arc::new(Database::new(pool));
    let app_state = AppState {
        db,
        config: settings,
    };

    let public = Router::new().route("/health", get(health::get));
    let protected = Router::new();

    Router::new()
        .merge(public)
        .merge(protected)
        .with_state(app_state)
        .layer(TraceLayer::new_for_http())
        .layer(CorsLayer::permissive())
}
