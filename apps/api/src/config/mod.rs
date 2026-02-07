use core::str::FromStr;

use config::{Config, Environment, File};
use secrecy::{ExposeSecret, SecretString};
use serde::Deserialize;
use sqlx::postgres::{PgConnectOptions, PgSslMode};

#[derive(Clone, Deserialize)]
pub struct Settings {
    pub database:    DatabaseSettings,
    pub application: ApplicationSettings,
}

pub fn get_config() -> Result<Settings, config::ConfigError> {
    let base_path = std::env::current_dir().expect("Failed to determine the current directory");
    println!("CWD: {}", &base_path.display());
    let config_dir = base_path.join("config");

    // Detect the running environment. Defaults to `local` if unspecified.
    let environment: Environ = std::env::var("APP_ENVIRONMENT")
        .unwrap_or_else(|_| "local".into())
        .parse()
        .expect("Failed to parse APP_ENVIRONMENT.");
    let envfile = format!("{}.toml", environment.as_str());
    let settings = Config::builder()
        .add_source(File::from(
            config_dir.join("default.toml"),
        ))
        .add_source(File::from(
            config_dir.join(envfile),
        ))
        // Add in settings from environment variables (with a prefix of APP and '__' as separator)
        // E.g. `APP_APPLICATION__PORT=5001 would set `Settings.application.port`
        .add_source(
            Environment::with_prefix("APP")
                .prefix_separator("_")
                .separator("__"),
        )
        .build()?;

    settings.try_deserialize()
}

#[derive(Clone, Deserialize)]
pub struct ApplicationSettings {
    pub port:               u16,
    pub host:               String,
    pub base_url:           String,
    /// Secret used to sign and verify JWTs.
    pub jwt_secret:         SecretString,
    /// How long (in seconds) a freshly issued JWT remains valid.
    pub jwt_expiry_seconds: u64,
}

#[derive(Clone, Deserialize)]
pub struct DatabaseSettings {
    pub username:        String,
    pub password:        SecretString,
    /// Maximum number of connections in the pool.
    pub max_connections: u16,
    pub port:            u16,
    pub host:            String,
    pub name:            String,
    pub require_ssl:     bool,
}

impl DatabaseSettings {
    pub fn options(&self) -> PgConnectOptions {
        let ssl_mode = if self.require_ssl { PgSslMode::Require } else { PgSslMode::Prefer };
        PgConnectOptions::new()
            .host(&self.host)
            .username(&self.username)
            .password(self.password.expose_secret())
            .port(self.port)
            .ssl_mode(ssl_mode)
            .database(&self.name)
    }
}

/// The possible runtime environment for our application.
pub enum Environ {
    Local,
    Production,
}
impl Environ {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Local => "local",
            Self::Production => "production",
        }
    }
}

impl FromStr for Environ {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "local" => Ok(Self::Local),
            "production" => Ok(Self::Production),
            s => Err(format!(
                "{s} is not a supported environ. Use either `local` or `production`.",
            )),
        }
    }
}
