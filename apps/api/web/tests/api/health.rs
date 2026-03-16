use std::collections::HashMap;

use api_macros::test;
use api_web::test_helpers::{BodyExt, DbTestContext, RouterExt};
use axum::body::Body;
use axum::http::Method;
use googletest::prelude::*;
use hyper::StatusCode;

#[ignore = "not yet implemented"]
#[db_test]
async fn test_action(context: &DbTestContext) {
    // Example:
    // let response = context
    // .app
    // .request("/health/action")
    // .send()
    // .await;
    //
    // assert_that!(response.status(), eq(StatusCode::OK));
}
