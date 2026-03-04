use tokio::task::JoinHandle;
use tower_sessions_redis_store::fred::prelude::*;

use crate::config::RedisSettings;

/// Creates and connects a Redis connection pool.
///
/// Mirrors the structure of `bootstrap::database::create_pool` — call this
/// during app startup and pass the resulting pool into `AppState`.
pub async fn create_pool(
    settings: &RedisSettings,
) -> anyhow::Result<(JoinHandle<Result<(), Error>>, Pool)> {
    let config = Config::from_url(&settings.uri())?;
    let pool = Pool::new(config, None, None, None, 6)?;

    // `connect()` is non-blocking — it spawns the connection task.
    // `wait_for_connect()` is what actually blocks until ready.
    let conn = pool.connect();
    pool.wait_for_connect().await?;

    let RedisSettings { host, port } = &settings;

    tracing::info!("Redis connection established ({host}:{port})",);

    Ok((conn, pool))
}
