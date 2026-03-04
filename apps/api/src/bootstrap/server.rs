use tokio::net::TcpListener;

use super::{database, router, services, state, telemetry};
use crate::config;

/// .
///
/// # Errors
///
/// This function will return an error if .
pub async fn run() -> anyhow::Result<()> {
    let config = config::load()?;

    telemetry::init(&config);

    let pool = database::create_pool_with_defaults(&config.database).await?;
    let services = services::build(&pool);
    let state = state::build(&pool, &config, &services);
    let router = router::build();

    let address = config.application.socket_addr();
    let listener = TcpListener::bind(address).await?;

    tracing::info!(
        env   = %std::env::var("APP_ENVIRONMENT").unwrap_or("local".into()),
        bind  = %address,
        db    = %config.database.host,
        debug = %config.debug,
        "🚀 Pennywise API listening"
    );

    tracing::info!(
        "🚀 Pennywise API listening on http://{:?}",
        &listener.local_addr()?
    );

    axum::serve(listener, router.into_make_service())
        .with_graceful_shutdown(shutdown_signal(state))
        .await?;

    tracing::info!("Server shut down gracefully");

    Ok(())
}

async fn shutdown_signal(state: state::AppState) {
    use core::sync::atomic::Ordering;
    use core::time::Duration;

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
        () = ctrl_c => {},
        () = terminate => {},
    }

    tracing::info!("Shutdown signal received, starting graceful shutdown");

    // Mark as not ready for new connections
    state.ready.store(false, Ordering::SeqCst);

    // Allow time for load balancer to detect
    tokio::time::sleep(Duration::from_secs(5)).await;
}
