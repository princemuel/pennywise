use core::str::FromStr;
use core::time::Duration;
use std::fmt;

use config::{Config, ConfigError, Environment, File};
use secrecy::{ExposeSecret, SecretString};
use serde::Deserialize;
use sqlx::postgres::{PgConnectOptions, PgPoolOptions, PgSslMode};

pub fn load() -> Result<Settings, ConfigError> {
    dotenvy::dotenv().ok();
    dotenvy::from_filename(".env.local").ok();

    let env: AppEnvironment = std::env::var("APP_ENVIRONMENT")
        .unwrap_or_else(|_| "local".into())
        .parse()
        .expect("Invalid APP_ENVIRONMENT");

    // Config dir relative to the binary's workspace location
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

#[derive(Debug, Clone, Deserialize)]
pub struct Settings {
    pub debug:       bool,
    pub application: ApplicationSettings,
    pub database:    DatabaseSettings,
    pub redis:       RedisSettings,
    pub auth:        AuthSettings,
    pub oauth:       OAuthSettings,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ApplicationSettings {
    pub host:     String,
    pub port:     u16,
    pub base_url: String,
    pub timeout:  u64,
}

impl ApplicationSettings {
    pub fn addr(&self) -> String { format!("{}:{}", self.host, self.port) }
}

#[derive(Debug, Clone, Deserialize)]
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
    pub fn pool_options(&self) -> PgPoolOptions {
        PgPoolOptions::new()
            .min_connections(self.pool_min_connections)
            .max_connections(self.pool_max_connections)
            .acquire_timeout(Duration::from_millis(self.pool_acquire_timeout_ms))
            .idle_timeout(Duration::from_millis(self.pool_idle_timeout_ms))
            .max_lifetime(Duration::from_millis(self.pool_max_lifetime_ms))
    }

    pub fn connect_options(&self) -> PgConnectOptions {
        PgConnectOptions::new()
            .host(&self.host)
            .port(self.port)
            .username(&self.username)
            .password(self.password.expose_secret())
            .ssl_mode(if self.require_ssl { PgSslMode::Require } else { PgSslMode::Prefer })
            .database(&self.name)
    }

    // Without DB name - useful for admin ops like CREATE DATABASE
    pub fn connect_options_without_db(&self) -> PgConnectOptions {
        PgConnectOptions::new()
            .host(&self.host)
            .port(self.port)
            .username(&self.username)
            .password(self.password.expose_secret())
            .ssl_mode(if self.require_ssl { PgSslMode::Require } else { PgSslMode::Prefer })
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct RedisSettings {
    pub host: String,
    pub port: u16,
}

impl RedisSettings {
    pub fn uri(&self) -> String { format!("redis://{}:{}", self.host, self.port) }
}

#[derive(Debug, Clone, Deserialize)]
pub struct AuthSettings {
    pub jwt_secret:      SecretString, // APP_AUTH__JWT_SECRET
    pub hmac_secret:     SecretString, // APP_AUTH__HMAC_SECRET
    pub jwt_expiry_secs: u64,
}

#[derive(Debug, Clone, Deserialize)]
pub struct OAuthSettings {
    pub google: OAuthProviderSettings,
    pub github: OAuthProviderSettings,
}

#[derive(Debug, Clone, Deserialize)]
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

#[derive(Debug, Clone, PartialEq)]
pub enum AppEnvironment {
    Local,
    Production,
}

impl AppEnvironment {
    pub fn as_str(&self) -> &'static str {
        match self {
            AppEnvironment::Local => "local",
            AppEnvironment::Production => "production",
        }
    }
}

impl FromStr for AppEnvironment {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "local" => Ok(Self::Local),
            "production" => Ok(Self::Production),
            e => Err(format!(
                "Unknown environment: `{e}`. Use either `local` or `production`"
            )),
        }
    }
}

impl fmt::Display for AppEnvironment {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result { write!(f, "{}", self.as_str()) }
}
