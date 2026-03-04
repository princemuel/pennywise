use core::net::{Ipv4Addr, SocketAddr};
use core::str::FromStr;
use core::time::Duration;

use config::{Config, ConfigError, Environment, File};
use secrecy::{ExposeSecret, SecretString};
use serde::Deserialize;
use sqlx::postgres::{PgConnectOptions, PgPoolOptions, PgSslMode};

pub fn load() -> Result<Settings, ConfigError> {
    dotenvy::dotenv().ok();
    dotenvy::from_filename(".env.local").ok();

    let env: AppEnvironment = std::env::var("APP_ENVIRONMENT")
        .unwrap_or_else(|_| "local".into())
        .parse()?;

    let config_dir = std::path::PathBuf::from(
        std::env::var("CARGO_MANIFEST_DIR").unwrap_or_else(|_| ".".to_string()),
    )
    .join("config");

    Config::builder()
        .add_source(File::from(config_dir.join("default")).required(true))
        .add_source(File::from(config_dir.join(env.as_str())).required(true))
        .add_source(
            Environment::with_prefix("APP")
                .prefix_separator("_")
                .separator("__"),
        )
        .build()?
        .try_deserialize()
}

#[derive(Clone, Debug, Deserialize)]
pub struct Settings {
    pub debug:       bool,
    pub application: ApplicationSettings,
    pub database:    DatabaseSettings,
    pub redis:       RedisSettings,
    pub auth:        AuthSettings,
    pub oauth:       OAuthSettings,
}

#[derive(Clone, Debug, Deserialize)]
pub struct ApplicationSettings {
    pub host:     String,
    pub port:     u16,
    pub base_url: String,
    pub timeout:  u64,
}

impl ApplicationSettings {
    pub fn addr(&self) -> String { format!("{}:{}", self.host, self.port) }

    pub fn socket_addr(&self) -> SocketAddr {
        SocketAddr::from((Ipv4Addr::UNSPECIFIED, self.port))
    }
}

#[derive(Clone, Debug, Deserialize)]
pub struct DatabaseSettings {
    pub host:        String,
    pub port:        u16,
    pub name:        String,
    pub username:    String,
    pub require_ssl: bool,
    pub password:    SecretString,

    pub pool_min_connections:    u32,
    pub pool_max_connections:    u32,
    pub pool_acquire_timeout_ms: u64,
    pub pool_idle_timeout_ms:    u64,
    pub pool_max_lifetime_ms:    u64,
}

impl DatabaseSettings {
    pub(crate) fn pool_options(&self) -> PgPoolOptions {
        PgPoolOptions::new()
            .min_connections(self.pool_min_connections)
            .max_connections(self.pool_max_connections)
            .acquire_timeout(Duration::from_millis(self.pool_acquire_timeout_ms))
            .idle_timeout(Duration::from_millis(self.pool_idle_timeout_ms))
            .max_lifetime(Duration::from_millis(self.pool_max_lifetime_ms))
    }

    pub(crate) fn connect_options(&self) -> PgConnectOptions {
        self.connect_options_without_db().database(&self.name)
    }

    // Without DB name - useful for admin ops like CREATE DATABASE
    pub(crate) fn connect_options_without_db(&self) -> PgConnectOptions {
        PgConnectOptions::new()
            .host(&self.host)
            .port(self.port)
            .username(&self.username)
            .password(self.password.expose_secret())
            .ssl_mode(if self.require_ssl { PgSslMode::Require } else { PgSslMode::Prefer })
    }
}

#[cfg(test)]
impl DatabaseSettings {
    pub fn test_with_pg_port(port: u16) -> Self {
        use secrecy::SecretString;

        Self {
            host: "127.0.0.1".into(),
            port,
            name: "postgres".into(),
            username: "postgres".into(),
            password: SecretString::from("postgres"),
            require_ssl: false,

            // Tight but realistic values for tests - fast acquire timeout
            // so failures surface quickly rather than hanging the suite.
            pool_min_connections: 1,
            pool_max_connections: 2,
            pool_acquire_timeout_ms: 2_000,
            pool_idle_timeout_ms: 10_000,
            pool_max_lifetime_ms: 30_000,
        }
        // If Settings has other fields (e.g. RedisSettings), fill them
        // with sensible stubs or use `..Settings::default()` if it's
        // derived/implemented.
    }
}

#[derive(Clone, Debug, Deserialize)]
pub struct RedisSettings {
    pub host: String,
    pub port: u16,
}

impl RedisSettings {
    pub fn uri(&self) -> String { format!("redis://{}:{}", self.host, self.port) }
}

#[derive(Clone, Debug, Deserialize)]
pub struct AuthSettings {
    pub jwt_secret:      SecretString, // APP_AUTH__JWT_SECRET
    pub hmac_secret:     SecretString, // APP_AUTH__HMAC_SECRET
    pub jwt_expiry_secs: u64,
}

#[derive(Clone, Debug, Deserialize)]
pub struct OAuthSettings {
    pub google: OAuthProviderSettings,
    pub github: OAuthProviderSettings,
}

#[derive(Clone, Debug, Deserialize)]
pub struct OAuthProviderSettings {
    pub client_id:     String, // APP_OAUTH__GOOGLE__CLIENT_ID
    pub client_secret: String, // APP_OAUTH__GOOGLE__CLIENT_SECRET
    pub redirect_path: String,
}

impl OAuthProviderSettings {
    pub fn redirect_uri(&self, base_url: &str) -> String {
        format!("{}{}", base_url, self.redirect_path)
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum AppEnvironment {
    Local,
    Production,
}

impl AppEnvironment {
    pub const fn as_str(&self) -> &'static str {
        match self {
            Self::Local => "local",
            Self::Production => "production",
        }
    }
}

impl FromStr for AppEnvironment {
    type Err = ConfigError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().trim() {
            "local" => Ok(Self::Local),
            "production" => Ok(Self::Production),
            e => Err(ConfigError::Message(format!(
                "Unknown environment: `{e}`. Use either `local` or `production`"
            ))),
        }
    }
}

impl core::fmt::Display for AppEnvironment {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}
