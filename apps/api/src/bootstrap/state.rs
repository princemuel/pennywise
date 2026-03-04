use core::sync::atomic::{AtomicBool, AtomicUsize};
use std::sync::Arc;

use sqlx::PgPool;

use super::services::Services;
use crate::config::Settings;

pub(crate) fn build(pool: &PgPool, config: &Settings, services: &Services) -> AppState {
    AppState {
        pool:     pool.clone(),
        config:   config.clone(),
        ready:    Arc::new(AtomicBool::new(true)),
        services: services.clone(),
        requests: Arc::new(AtomicUsize::new(0)),
    }
}

#[derive(Clone, Debug)]
pub(crate) struct AppState {
    pub(crate) pool:     PgPool,
    pub(crate) services: Services,
    pub(crate) config:   Settings,
    pub(crate) ready:    Arc<AtomicBool>,
    pub(crate) requests: Arc<AtomicUsize>,
}
