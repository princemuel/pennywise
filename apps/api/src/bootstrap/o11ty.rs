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

/// Creates a new tracing subscriber with the default configuration.
pub fn init_telemetry(settings: &Settings) {
    let filter = if settings.debug { "debug" } else { "info" };
    let listener = subscriber("pennapi".into(), filter.into(), io::stdout);
    subscribe(listener);
}

/// Compose multiple layers into a `tracing`'s subscriber.
pub(crate) fn subscriber<T>(
    name: String,
    filter: String,
    sink: T,
) -> impl Subscriber + Sync + Send
where
    T: for<'a> MakeWriter<'a> + Send + Sync + 'static,
{
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new(filter));
    let formatting_layer = BunyanFormattingLayer::new(name, sink);
    Registry::default()
        .with(filter)
        .with(JsonStorageLayer)
        .with(formatting_layer)
}

/// Register a subscriber as global default to process span data.
///
/// NOTE: It should only be called once!
pub(crate) fn subscribe(listener: impl Subscriber + Sync + Send) {
    LogTracer::init().expect("Failed to set logger");
    set_global_default(listener).expect("Failed to set subscriber");
}

pub fn spawn_blocking_w_tracing<F, R>(f: F) -> JoinHandle<R>
where
    F: FnOnce() -> R + Send + 'static,
    R: Send + 'static,
{
    let span = tracing::Span::current();
    tokio::task::spawn_blocking(move || span.in_scope(f))
}
