use core::net::{Ipv4Addr, SocketAddr};
use std::io;
use std::sync::Arc;

use api::config::{DatabaseSettings, Settings, get_config};
use api::http::router::build_router;
use api::telemetry::{subscribe, subscriber};
use secrecy::ExposeSecret;
use sqlx::postgres::PgPoolOptions;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let listener = subscriber("pennywise".into(), "info".into(), io::stdout);
    subscribe(listener);

    let settings = get_config()?;

    let settings = Arc::new(settings);

    // Create database connection pool
    let pool = PgPoolOptions::new().max_connections(5).connect("").await?;

    // Build and run the router
    let router = build_router(pool, Arc::clone(&settings));
    let address = SocketAddr::from((Ipv4Addr::UNSPECIFIED, settings.application.port));
    let listener = tokio::net::TcpListener::bind(address).await?;

    tracing::info!("Server listening on {}", address);

    axum::serve(listener, router).await?;

    Ok(())
}
