use core::sync::atomic::Ordering;

use axum::Json;
use axum::extract::State;
use axum::http::StatusCode;
use axum::response::IntoResponse;

use crate::bootstrap::AppState;

pub(crate) fn health() -> &'static str { "OK" }

pub(crate) fn ready(State(state): State<AppState>) -> impl IntoResponse {
    if state.ready.load(Ordering::SeqCst) {
        Ok((StatusCode::OK, "the api is ready for requests"))
    } else {
        Err((
            StatusCode::SERVICE_UNAVAILABLE,
            "the api is not ready for requests",
        ))
    }
}

pub(crate) fn metrics(State(state): State<AppState>) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "requests": state.requests.load(Ordering::SeqCst),
        "ready": state.ready.load(Ordering::SeqCst)
    }))
}

pub(crate) fn index(State(state): State<AppState>) -> &'static str {
    state.requests.fetch_add(1, Ordering::SeqCst);
    "Hello from production-ready Axum!"
}
