//! Observability (o11ty)
//! This module configures tracing for the application.
use std::io;

use tokio::task::JoinHandle;
use tracing::Subscriber;
use tracing::subscriber::set_global_default;
use tracing_bunyan_formatter::{BunyanFormattingLayer, JsonStorageLayer};
use tracing_log::LogTracer;
use tracing_subscriber::fmt::MakeWriter;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::{EnvFilter, Registry};

use crate::config::Settings;

/// Initialize global tracing subscriber. Should only be called once at startup.
pub fn init(settings: &Settings) {
    let level = if settings.debug { "debug" } else { "info" };
    let subscriber = build_subscriber("pennapi", level, io::stdout);
    register(subscriber);
}

/// Compose multiple layers into a structured `tracing` subscriber.
pub(crate) fn build_subscriber<T>(
    service_name: &str,
    default_filter: &str,
    sink: T,
) -> impl Subscriber + Sync + Send
where
    T: for<'a> MakeWriter<'a> + Send + Sync + 'static,
{
    // Prefer RUST_LOG if provided otherwise fall back to sane production defaults
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| {
        EnvFilter::new(format!(
            "{default_filter},tower_http=info,hyper=warn,sqlx=warn"
        ))
    });

    let formatting_layer = BunyanFormattingLayer::new(service_name.to_string(), sink);
    Registry::default()
        .with(filter)
        .with(JsonStorageLayer)
        .with(formatting_layer)
}

/// Register a subscriber as global default to process span data.
///
/// # Safety
/// Panics if called more than once!
pub(crate) fn register(subscriber: impl Subscriber + Send + Sync) {
    LogTracer::init().expect("Failed to initialize LogTracer");
    set_global_default(subscriber).expect("Failed to set global subscriber");
}

/// Spawn blocking task while preserving tracing span context.
/// Extremely important for DB work or CPU heavy tasks.
#[allow(dead_code)]
pub fn spawn_blocking_w_tracing<F, R>(f: F) -> JoinHandle<R>
where
    F: FnOnce() -> R + Send + 'static,
    R: Send + 'static,
{
    let span = tracing::Span::current();
    tokio::task::spawn_blocking(move || span.in_scope(f))
}
