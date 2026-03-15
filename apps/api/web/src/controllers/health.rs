use axum::http::StatusCode;

#[axum::debug_handler]
pub async fn index() -> StatusCode { StatusCode::OK }
#[axum::debug_handler]
pub async fn alive() -> StatusCode { StatusCode::OK }
#[axum::debug_handler]
pub async fn ready() -> StatusCode { StatusCode::OK }
#[axum::debug_handler]
pub async fn version() -> StatusCode { StatusCode::OK }
