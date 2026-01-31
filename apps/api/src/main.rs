use std::error::Error;

use axum::{Router, routing::get};
use dotenvx_rs::dotenvx;
use tokio::net::TcpListener;

use api::address;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    dotenvx::dotenv().ok();

    let service = Router::new().route("/", get(|| async { "Hello, There!" }));
    let listener = TcpListener::bind(address()).await?;

    axum::serve(listener, service).await?;

    Ok(())
}
