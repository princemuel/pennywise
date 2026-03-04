use axum::Router;
use tower_http::trace::TraceLayer;

pub(crate) fn build() -> Router { Router::new().layer(TraceLayer::new_for_http()) }
