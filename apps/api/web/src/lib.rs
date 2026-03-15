//! The api_web crate contains the application's web interface which mainly are
//! controllers implementing HTTP endpoints. It also includes the application
//! tests that are black-box tests, interfacing with the application like any
//! other HTTP client.
#![warn(clippy::pedantic)]
#![warn(clippy::ptr_arg)]
#![warn(clippy::use_self)]
#![warn(clippy::suspicious)]
#![warn(clippy::perf)]

use anyhow::Context;
use api_config::{Config, get_env, load_config};
use axum::serve;
use tokio::net::TcpListener;
use tracing::info;
use tracing_panic::panic_hook;
use tracing_subscriber::filter::EnvFilter;
use tracing_subscriber::fmt;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;

/// The application's controllers that implement request handlers.
pub mod controllers;
/// Contains the application's error type and related conversion implementation.
pub mod error;
/// Middlewares that incoming requests are passed through before being passed to
/// [`controllers`].
pub mod middlewares;
/// Contains the application's route definitions.
pub mod routes;
/// Contains the application state definition and functionality to initialize
/// it.
pub mod state;

/// Runs the application.
///
/// This function does all the work to initiatilize and run the application:
///
/// 1. Determine the environment the application is running in (see
///    [`api_config::get_env`])
/// 2. Load the configuration (see [`api_config::load_config`])
/// 3. Initialize the application state (see [`state::init_app_state`])
/// 4. Initialize the application's router (see [`routes::init_routes`])
/// 5. Boot the application and start listening for requests on the configured
///    interface and port
pub async fn run() -> anyhow::Result<()> {
    let env = get_env().context("Cannot get environment!")?;
    let config: Config = load_config(&env).context("Cannot load config!")?;

    let app_state = state::init_app_state(&config).await;
    let app = routes::init_routes(app_state);

    let [v4, v6] = config.server.addrs();

    let (l4, l6) = tokio::try_join!(TcpListener::bind(v4), TcpListener::bind(v6),)
        .context("Cannot bind to the socket address!")?;

    info!("Listening on {v4} (IPv4) and {v6} (IPv6)",);

    tokio::try_join!(
        axum::serve(l4, app.clone().into_make_service())
            .with_graceful_shutdown(shutdown_signal()),
        axum::serve(l6, app.into_make_service()).with_graceful_shutdown(shutdown_signal()),
    )
}

/// Initializes tracing.
///
/// This function
///
/// * registers a [`tracing_subscriber::fmt::Subscriber`]
/// * registers a [`tracing_panic::panic_hook`]
///
/// The function respects the `RUST_LOG` if set or defaults to filtering spans
/// and events with level [`tracing_subscriber::filter::LevelFilter::INFO`] and
/// higher.
pub fn init_tracing() {
    let filter = EnvFilter::try_from_default_env()
        .or_else(|_| EnvFilter::try_new("info"))
        .unwrap();
    tracing_subscriber::registry()
        .with(fmt::layer())
        .with(filter)
        .init();

    std::panic::set_hook(Box::new(panic_hook));
}

/// Waits for a shutdown signal, then allows a brief grace period before
/// returning.
///
/// This function completes on whichever of the following arrives first:
///
/// - **`Ctrl+C`** (`SIGINT`) — supported on all platforms
/// - **`SIGTERM`** — supported on Unix only; on other platforms this branch
///   waits forever (i.e. only `Ctrl+C` can trigger shutdown)
///
/// Once a signal is received, the function logs the event and sleeps for
/// **5 seconds** before returning. This grace period gives a load balancer
/// time to stop routing new requests to this instance before the server
/// actually stops accepting connections.
///
/// # Usage
///
/// Pass this to [`axum::serve`] via
/// [`.with_graceful_shutdown()`](axum::serve::Serve::with_graceful_shutdown):
///
/// ```rust
/// axum::serve(listener, app.into_make_service())
///     .with_graceful_shutdown(shutdown_signal())
///     .await?;
/// ```
///
/// # Panics
///
/// Panics if the OS refuses to install the signal handler — this should only
/// occur if the process has already registered the maximum number of signal
/// handlers, which is exceptionally rare in practice.
async fn shutdown_signal() {
    use tokio::{signal, time};

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

    tracing::info!("Shutdown signal received, starting graceful shutdown...");

    // Allow time for load balancer to detect
    time::sleep(time::Duration::from_secs(5)).await;
}

/// Helpers that simplify writing application tests.
#[cfg(feature = "test-helpers")]
pub mod test_helpers;
