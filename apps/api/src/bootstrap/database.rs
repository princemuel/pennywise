// Cargo.toml [dev-dependencies]
// testcontainers-modules = { version = "0.14", features = ["postgres"] }
// tokio = { version = "1", features = ["full"] }
//
// No need for a separate `testcontainers` entry — it's re-exported by the
// modules crate and guaranteed to be version-aligned.

use sqlx::PgPool;

use crate::config::DatabaseSettings;

static MIGRATOR: sqlx::migrate::Migrator = sqlx::migrate!();

/// Configuration for database connection retry behavior
#[derive(Clone, Copy, Debug)]
pub struct RetryConfig {
    /// Initial delay between retries in seconds
    pub initial_delay: u64,
    /// Maximum delay between retries in seconds
    pub max_delay:     u64,
    /// Total number of retry attempts
    pub max_retries:   u8,
}

impl Default for RetryConfig {
    fn default() -> Self {
        Self {
            initial_delay: 1,
            max_delay:     12,
            max_retries:   12,
        }
    }
}

/// Creates a `PostgreSQL` connection pool with automatic retries and migrations
///
/// # Arguments
/// * `config` - Database configuration config
/// * `retry_config` - Retry behavior configuration (uses defaults if not
///   customized)
///
/// # Returns
/// * `Ok(PgPool)` - Successfully connected pool with migrations applied
/// * `Err` - Connection failed after all retries exhausted
pub async fn create_pool(
    config: &DatabaseSettings,
    retry_config: Option<RetryConfig>,
) -> anyhow::Result<PgPool> {
    let retry_config = retry_config.unwrap_or_default();
    let connect_options = config.connect_options();

    tracing::info!("{:?}", &config);

    let mut delay = retry_config.initial_delay;
    let mut attempts = 0;

    loop {
        attempts += 1;

        match config
            .pool_options()
            .connect_with(connect_options.clone())
            .await
        {
            Ok(pool) => {
                tracing::info!("Database connection established on attempt {}", attempts);
                match MIGRATOR.run(&pool).await {
                    Ok(()) => {
                        tracing::info!("Database migrations completed successfully");
                        return Ok(pool);
                    }
                    Err(err) => {
                        tracing::error!("Failed to run migrations: {err}");
                        return Err(err.into());
                    }
                }
            }
            Err(err) if attempts <= retry_config.max_retries => {
                tracing::warn!(
                    attempts = attempts,
                    max_retries = retry_config.max_retries,
                    next_retry_secs = delay,
                    error = %err,
                    "Database connection failed, will retry"
                );

                tokio::time::sleep(core::time::Duration::from_secs(delay)).await;

                // Exponential backoff with cap
                delay = (delay * 2).min(retry_config.max_delay);
            }
            Err(err) => {
                tracing::error!(
                    total_attempts = attempts,
                    "Failed to connect to database after {} attempts: {err}",
                    attempts
                );
                return Err(err.into());
            }
        }
    }
}

/// Convenience function that creates a pool with default retry behavior
pub async fn create_pool_with_defaults(config: &DatabaseSettings) -> anyhow::Result<PgPool> {
    create_pool(config, None).await
}

#[cfg(test)]
mod tests {
    use testcontainers_modules::postgres::Postgres;
    use testcontainers_modules::testcontainers::runners::AsyncRunner;
    use testcontainers_modules::testcontainers::{ContainerAsync, ImageExt};

    use super::*;

    const PG_IMAGE_TAG: &str = "18-trixie";

    #[test]
    fn test_retry_config_defaults() {
        let config = RetryConfig::default();
        assert_eq!(config.initial_delay, 1);
        assert_eq!(config.max_delay, 12);
        assert_eq!(config.max_retries, 12);
    }

    #[test]
    fn test_retry_config_custom() {
        let config = RetryConfig {
            initial_delay: 2,
            max_delay:     30,
            max_retries:   5,
        };
        assert_eq!(config.initial_delay, 2);
        assert_eq!(config.max_delay, 30);
        assert_eq!(config.max_retries, 5);
    }

    /// Starts a `postgres:18-trixie` container and returns it alongside a
    /// `Settings` pointed at its ephemeral host port.
    ///
    /// The caller **must** hold onto the `ContainerAsync` for the duration of
    /// the test. Dropping it stops the container immediately (RAII).
    async fn start_pg() -> (ContainerAsync<Postgres>, DatabaseSettings) {
        let container = Postgres::default()
            .with_tag(PG_IMAGE_TAG)   // override the module's default tag
            .start()
            .await
            .expect("Failed to start postgres container");

        let port = container
            .get_host_port_ipv4(5432)
            .await
            .expect("Failed to resolve host port");

        let config = DatabaseSettings::test_with_pg_port(port);
        (container, config)
    }

    /// Happy path: `create_pool` should connect, run migrations, and hand back
    /// a working pool.
    #[tokio::test]
    async fn test_create_pool_connects_and_migrates() {
        let (_container, config) = start_pg().await;

        let pool = create_pool(&config, None)
            .await
            .expect("create_pool should succeed against a live database");

        let row: (i32,) = sqlx::query_as("SELECT 1")
            .fetch_one(&pool)
            .await
            .expect("Pool should be usable after migrations");

        assert_eq!(row.0, 1);
    }

    #[tokio::test]
    async fn test_create_pool_with_defaults() {
        let (_container, config) = start_pg().await;

        let pool = create_pool_with_defaults(&config)
            .await
            .expect("create_pool_with_defaults should succeed");

        let row: (i32,) = sqlx::query_as("SELECT 1").fetch_one(&pool).await.unwrap();

        assert_eq!(row.0, 1);
    }

    #[tokio::test]
    async fn test_migrations_are_idempotent() {
        let (_container, config) = start_pg().await;

        create_pool(&config, None).await.expect("first run");
        create_pool(&config, None)
            .await
            .expect("second run should be a no-op");
    }

    #[tokio::test]
    async fn test_create_pool_fails_after_retries_exhausted() {
        // Port 1 is reserved on every OS — connections fail immediately with
        // ECONNREFUSED, so no real sleeping occurs even with multiple retries.
        let config = DatabaseSettings::test_with_pg_port(1);

        let retry_config = RetryConfig {
            // 0 * 2 == 0 (integer backoff), so retries are instantaneous.
            initial_delay: 0,
            max_delay:     0,
            max_retries:   2,
        };

        let result = create_pool(&config, Some(retry_config)).await;
        assert!(
            result.is_err(),
            "Should fail when the database is unreachable"
        );
    }
}
