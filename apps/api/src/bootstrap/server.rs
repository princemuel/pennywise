use core::net::{Ipv4Addr, SocketAddr};
use std::sync::Arc;

use axum::Router;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};

use super::database::create_pool;
use crate::config;

pub async fn run() -> anyhow::Result<()> {
    let settings = config::load()?;

    super::o11ty::init_telemetry(&settings);

    tracing::info!(
        env   = %std::env::var("APP_ENVIRONMENT").unwrap_or("local".into()),
        addr  = %settings.application.addr(),
        db    = %settings.database.host,
        debug = %settings.debug,
        "Starting the Pennywise API"
    );

    let _db_pool = create_pool(&settings).await;

    let router = Router::new();

    let address = SocketAddr::from((Ipv4Addr::UNSPECIFIED, settings.application.port));
    let listener = TcpListener::bind(address).await?;

    axum::serve(listener, router.into_make_service())
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

async fn shutdown_signal() {
    use tokio::signal;

    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install Terminate handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }
}
