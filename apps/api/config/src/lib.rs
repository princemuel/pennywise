//! The api-config crate contains functionality for parsing as well as accessing
//! the project's documentation.
#![warn(clippy::pedantic)]
#![warn(clippy::ptr_arg)]
#![warn(clippy::use_self)]
#![warn(clippy::suspicious)]
#![warn(clippy::perf)]

use core::fmt::{Display, Formatter};
use core::net::{IpAddr, Ipv4Addr, SocketAddr};
use core::str::FromStr;
use core::time::Duration;
use std::env;
use std::path::PathBuf;

use anyhow::{anyhow, Context};
use dotenvy::dotenv;
use figment::providers::{Env, Format, Serialized, Toml};
use figment::Figment;
use secrecy::{ExposeSecret, SecretString};
use serde::{Deserialize, Serialize};
use sqlx::postgres::{PgConnectOptions, PgPoolOptions, PgSslMode};
use tracing::info;
/// The application configuration.
///
/// This struct is the central point for the entire application configuration.
/// It holds the [`ServerConfig`] as well as [`DatabaseConfig`]and can be
/// extended with any application-specific configuration settings that will be
/// read from the main `Config.toml` and the environment-specific configuration
/// files.
///
/// For any setting that appears in both the `Config.toml` and the
/// environment-specific file, the latter will override the former so that
/// default settings can be kept in `Config.toml` that are overridden per
/// environment if necessary.
#[derive(Clone, Debug, Deserialize)]
pub struct Config {
    /// whether to run the application in debug mode, which typically means more
    pub debug:    bool,
    /// the server configuration: [`ServerConfig`]
    pub server:   ServerConfig,
    /// the database configuration: [`DatabaseConfig`]
    pub database: DatabaseConfig,
    /// the redis configuration: [`RedisConfig`]
    pub redis:    RedisConfig,
    /// the authentication configuration: [`AuthConfig`]
    pub auth:     AuthConfig,
    /// the OAuth configuration: [`OAuthConfig`]
    pub oauth:    OAuthConfig,
}

/// The server configuration.
///
/// This struct keeps all settings specific to the server – currently that is
/// the interface the server binds to but more might be added in the future. The
/// struct is provided pre-defined by this project and cannot be changed. It
/// **must** be used for the `server` field in the application-specific
/// [`Config`] struct:
///
/// ```rust
/// #[derive(Clone, Debug, Deserialize)]
/// pub struct Config {
///     #[serde(default)]
///     pub server:   ServerConfig,
///     pub database: DatabaseConfig,
///     // add your config settings here…
/// }
/// ```
#[derive(Clone, Debug, Deserialize, Serialize)]
#[cfg_attr(test, derive(PartialEq))]
pub struct ServerConfig {
    /// The ip address to bind to, e.g. `127.0.0.1` or `::1`
    pub host:     IpAddr,
    /// The port to bind to, e.g. 8080
    pub port:     u16,
    /// The base URL of the application, e.g. "<http://localhost:8080>"
    pub base_url: String,
    /// The timeout for requests in seconds
    pub timeout:  u64,
}

impl Default for ServerConfig {
    fn default() -> Self {
        Self {
            port:     8080,
            host:     IpAddr::V4(Ipv4Addr::UNSPECIFIED),
            base_url: String::with_capacity(0),
            timeout:  10,
        }
    }
}

impl ServerConfig {
    /// Returns the full address the server binds to, including both the ip and
    /// port.
    ///
    /// This can be used when creating a TCP Listener:
    ///
    /// ```rust
    /// let config: Config = load_config(Environment::Development);
    /// let listener = TcpListener::bind(&config.server.addr).await?;
    /// serve(listener, app.into_make_service()).await?;
    ///  ```
    #[must_use]
    pub fn addr(&self) -> SocketAddr { SocketAddr::new(self.host, self.port) }
}

/// The database configuration.
///
/// This struct keeps all settings specific to the database – currently that is
/// the database URL to use to connect to the database but more might be added
/// in the future. The struct is provided pre-defined by this project and cannot
/// be changed. It **must** be used for the `database` field in the
/// application-specific [`Config`] struct:
///
/// ```rust
/// #[derive(Deserialize, Clone, Debug)]
/// pub struct Config {
///     #[serde(default)]
///     pub server:   ServerConfig,
///     pub database: DatabaseConfig,
///     // add your config settings here…
/// }
/// ```
#[derive(Deserialize, Clone, Debug)]
// #[cfg_attr(test, derive(PartialEq))]
pub struct DatabaseConfig {
    /// The host to connect to the database on, e.g. "localhost"
    pub host:        String,
    /// The port to connect to the database on, e.g. 5432
    pub port:        u16,
    /// The name of the database to connect to
    pub name:        String,
    /// The username to use to connect to the database
    pub username:    String,
    /// Whether to require SSL when connecting to the database
    pub require_ssl: bool,
    /// The password to use to connect to the database. This is a secret string
    pub password:    SecretString,

    /// The minimum number of connections in the connection pool.
    pub pool_min_connections:    u32,
    /// The maximum number of connections in the connection pool.
    pub pool_max_connections:    u32,
    /// The maximum time to wait for acquiring a connection from the pool in
    /// milliseconds
    pub pool_acquire_timeout_ms: u64,
    /// The maximum time a connection can be idle in the pool before it is
    /// closed in milliseconds
    pub pool_idle_timeout_ms:    u64,
    /// The maximum lifetime of a connection in the pool before it is closed in
    /// milliseconds
    pub pool_max_lifetime_ms:    u64,
}

// password:                SecretString::from("p£AwJj6)e*]A13j0"),
impl Default for DatabaseConfig {
    fn default() -> Self {
        Self {
            host:                    "localhost".to_string(),
            port:                    5432,
            name:                    "pennies".to_string(),
            username:                "kalel".to_string(),
            require_ssl:             false,
            password:                SecretString::from("kalel"),
            pool_min_connections:    1,
            pool_max_connections:    5,
            pool_acquire_timeout_ms: 5000,
            pool_idle_timeout_ms:    300_000,   // 5 minutes
            pool_max_lifetime_ms:    1_800_000, // 30 minutes
        }
    }
}

impl DatabaseConfig {
    /// Returns the URL to use to connect to the database, e.g.
    /// "<postgresql://user:password@localhost:5432/database>"
    /// This is constructed from the individual fields of the struct and can be
    /// used to connect to the database:
    /// ```rust
    /// let config: Config = load_config(Environment::Development);
    /// let pool = PgPoolOptions::new()
    ///     .connect(config.database.url().as_str())
    ///     .await?;
    /// ```
    #[must_use]
    pub fn url(&self) -> String {
        let Self {
            host,
            port,
            name,
            username,
            password,
            ..
        } = self;

        let ssl_mode = if self.require_ssl { "require" } else { "prefer" };
        format!(
            "postgresql://{username}:{password}@{host}:{port}/{name}?sslmode={ssl_mode}",
            password = password.expose_secret(),
        )
    }

    /// Returns the pool options to use when creating a connection pool with
    /// `sqlx::postgres::PgPoolOptions`. This includes settings like the minimum
    /// and maximum number of connections in the pool, the acquire timeout, etc.
    /// This can be used like this:
    /// ```rust
    /// let config: Config = load_config(Environment::Development);
    /// let pool = config
    ///     .database
    ///     .pool_opts()
    ///     .connect_with(config.database.connect_opts())
    ///     .await?;
    /// ```
    #[must_use]
    pub fn pool_opts(&self) -> PgPoolOptions {
        PgPoolOptions::new()
            .min_connections(self.pool_min_connections)
            .max_connections(self.pool_max_connections)
            .acquire_timeout(Duration::from_millis(self.pool_acquire_timeout_ms))
            .idle_timeout(Duration::from_millis(self.pool_idle_timeout_ms))
            .max_lifetime(Duration::from_millis(self.pool_max_lifetime_ms))
    }

    /// Returns the connection options to connect to the database, including the
    /// database name. This can be used to create a connection pool:
    /// ```rust
    /// let config: Config = load_config(Environment::Development);
    /// let pool = PgPoolOptions::new()
    ///     .connect_with(config.database.connect_opts_with_db())
    ///     .await?;
    /// ```
    #[must_use]
    pub fn connect_opts_with_db(&self) -> PgConnectOptions {
        self.connect_opts().database(&self.name)
    }

    /// Returns the connection options to connect to the database, without the
    /// database name. This can be useful for admin operations like creating a
    /// database:
    /// ```rust
    /// let config: Config = load_config(Environment::Development);
    /// let conn = PgConnection::connect_with(config.database.connect_opts()).await?;
    ///
    /// sqlx::query("CREATE DATABASE my_database")
    ///     .execute(&conn)
    ///     .await?;
    /// ```
    #[must_use]
    pub fn connect_opts(&self) -> PgConnectOptions {
        PgConnectOptions::new()
            .host(&self.host)
            .port(self.port)
            .username(&self.username)
            .password(self.password.expose_secret())
            .ssl_mode(if self.require_ssl { PgSslMode::Require } else { PgSslMode::Prefer })
    }
}

#[derive(Clone, Debug, Deserialize)]
pub struct RedisConfig {
    pub host: String,
    pub port: u16,
}

impl RedisConfig {
    #[must_use]
    pub fn uri(&self) -> String { format!("redis://{}:{}", self.host, self.port) }
}

#[derive(Clone, Debug, Deserialize)]
pub struct AuthConfig {
    pub jwt_secret:      SecretString, // APP_AUTH__JWT_SECRET
    pub hmac_secret:     SecretString, // APP_AUTH__HMAC_SECRET
    pub jwt_expiry_secs: u64,
}

#[derive(Clone, Debug, Deserialize)]
pub struct OAuthConfig {
    pub google: OAuthProviderConfig,
    pub github: OAuthProviderConfig,
}

#[derive(Clone, Debug, Deserialize)]
pub struct OAuthProviderConfig {
    pub client_id:     String, // APP_OAUTH__GOOGLE__CLIENT_ID
    pub client_secret: String, // APP_OAUTH__GOOGLE__CLIENT_SECRET
    pub redirect_path: String,
}

impl OAuthProviderConfig {
    #[must_use]
    pub fn redirect_uri(&self, base_url: &str) -> String {
        format!("{}{}", base_url, self.redirect_path)
    }
}

/// Loads the application configuration for a particular environment.
///
/// Depending on the environment, this function will behave differently:
/// * for [`Environment::Development`], the function will load env vars from a
///   `.env` file at the project root if that is present
/// * for [`Environment::Test`], the function will load env vars from a
///   `.env.test` file at the project root if that is present
/// * for [`Environment::Production`], the function will only use the process
///   env vars, and not load a `.env` file
///
/// In case the .env or .env.test files live in another directory,
/// you can set that location using the `APP_DOTENV_CONFIG_DIR` environment
/// variable. This is useful when they are mounted at separate locations in a
/// Docker container, for example.
///
/// Configuration settings are loaded from these sources (in that order so that
/// latter sources override former):
/// * the `config/Config.toml` file
/// * the `config/environments/<development|production|test>.toml` files
///   depending on the environment
/// * environment variables
///
/// # Errors
///
/// Returns an error if:
/// * the `.env` or `.env.test` file cannot be read or parsed
/// * any of the configuration TOML files cannot be read or parsed
/// * environment variables cannot be parsed into the expected types
/// * deserialization into the type `T` fails
pub fn load_config<'a, T>(env: &Environment) -> Result<T, anyhow::Error>
where
    T: Deserialize<'a>,
{
    let dotenv_config_dir = env::var("APP_DOTENV_CONFIG_DIR").ok().map(PathBuf::from);

    match (env, dotenv_config_dir) {
        (Environment::Development, None) => {
            dotenv().ok();
        }
        (Environment::Test, None) => {
            dotenvy::from_filename(".env.test").ok();
        }
        (Environment::Development, Some(mut dotenv_config_dir)) => {
            dotenv_config_dir.push(".env");
            dotenvy::from_filename(dotenv_config_dir).ok();
        }
        (Environment::Test, Some(mut dotenv_config_dir)) => {
            dotenv_config_dir.push(".env.test");
            dotenvy::from_filename(dotenv_config_dir).ok();
        }
        _ => { /* don't use any .env file for production */ }
    }

    let env_config_file = format!("{}.toml", env.as_str());

    let config: T = Figment::new()
        .merge(Serialized::defaults(ServerConfig::default()).key("server"))
        .merge(Toml::file("config/Config.toml"))
        .merge(Toml::file(format!("config/environments/{env_config_file}")))
        .merge(Env::prefixed("APP_").split("__"))
        .extract()
        .context("Could not read configuration!")?;

    Ok(config)
}

/// The environment the application runs in.
///
/// The application can run in 3 different environments: development,
/// production, and test. Depending on the environment, the configuration might
/// be different (e.g. different databases) or the application might behave
/// differently.
#[derive(Copy, Clone, PartialEq, Debug)]
pub enum Environment {
    /// The development environment is what developers would use locally.
    Development,
    /// The production environment would typically be used in the released,
    /// user-facing deployment of the app.
    Production,
    /// The test environment is using when running e.g. `cargo test`
    Test,
}

impl Environment {
    #[must_use]
    pub const fn as_str(&self) -> &'static str {
        match self {
            Self::Development => "development",
            Self::Production => "production",
            Self::Test => "test",
        }
    }
}

/// Parses an [`Environment`] from a string.
///
/// The environment can be passed in different forms, e.g. "dev", "development",
/// "prod", etc.
/// # Errors
///
/// If an invalid environment is passed, an error is returned.
impl FromStr for Environment {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().trim() {
            "dev" | "development" | "local" => Ok(Self::Development),
            "prod" | "production" => Ok(Self::Production),
            "test" => Ok(Self::Test),
            unknown => Err(anyhow!(r#"Unknown environment: "{unknown}"!"#)),
        }
    }
}

impl Display for Environment {
    fn fmt(&self, f: &mut Formatter) -> std::fmt::Result { write!(f, "{}", self.as_str()) }
}

/// Returns the currently active environment.
///
/// If the `APP_ENVIRONMENT` env var is set, the application environment is
/// parsed from that (which might fail if an invalid environment is set).
/// # Errors
///
/// If the `APP_ENVIRONMENT` env var is set but contains an invalid environment,
/// an error is returned. If the env var is not set, no error is returned and
/// the environment defaults to [`Environment::Development`].
pub fn get_env() -> Result<Environment, anyhow::Error> {
    if let Ok(env) = env::var("APP_ENVIRONMENT") {
        info!(r"Setting environment from APP_ENVIRONMENT: '{env}'",);
        env.parse()
    } else {
        info!("Defaulting to environment: development");
        Ok(Environment::Development)
    }
}

/// Parses an [`Environment`] from a string.
///
/// The environment can be passed in different forms, e.g. "dev", "development",
/// "prod", etc.
/// # Errors
///
/// If an invalid environment is passed, an error is returned.
pub fn parse_env(s: &str) -> anyhow::Result<Environment> { s.parse() }

// #[cfg(test)]
// mod tests {
//     use std::net::{IpAddr, Ipv4Addr};

//     use googletest::prelude::*;

//     use super::*;

//     #[derive(Deserialize, PartialEq, Debug)]
//     pub struct Config {
//         pub server:   ServerConfig,
//         pub database: DatabaseConfig,

//         pub app_setting: String,
//     }

//     #[test]
//     #[allow(clippy::result_large_err)]
//     fn test_load_config_development() {
//         figment::Jail::expect_with(|jail| {
//             let config_dir = jail.create_dir("config")?;
//             jail.create_file(
//                 config_dir.join("Config.toml"),
//                 r#"
//                 app_setting = "Just a TOML App!"
//             "#,
//             )?;
//             let environments_dir = jail.create_dir("config/environments")?;
//             jail.create_file(
//                 environments_dir.join("development.toml"),
//                 r#"
//                 app_setting = "override!"
//             "#,
//             )?;

//             jail.set_env("APP_SERVER__HOST", "127.0.0.1");
//             jail.set_env("APP_SERVER__PORT", "8080");
//             jail.set_env(
//                 "APP_DATABASE__URL",
//                 "postgresql://user:pass@localhost:5432/my_app",
//             );
//             let config =
// load_config::<Config>(&Environment::Development).unwrap();

//             assert_that!(
//                 config,
//                 eq(&Config {
//                     server:      ServerConfig {
//                         host: IpAddr::V4(Ipv4Addr::LOCALHOST),
//                         port: 8080,
//                         ..Default::default()
//                     },
//                     database:    DatabaseConfig {
//                         url:
// String::from("postgresql://user:pass@localhost:5432/my_app"),
// },                     app_setting: String::from("override!"),
//                 })
//             );

//             Ok(())
//         });
//     }

//     #[test]
//     #[allow(clippy::result_large_err)]
//     fn test_load_config_test() {
//         figment::Jail::expect_with(|jail| {
//             let config_dir = jail.create_dir("config")?;
//             jail.create_file(
//                 config_dir.join("Config.toml"),
//                 r#"
//                 app_setting = "Just a TOML App!"
//             "#,
//             )?;
//             let environments_dir = jail.create_dir("config/environments")?;
//             jail.create_file(
//                 environments_dir.join("test.toml"),
//                 r#"
//                 app_setting = "override!"
//             "#,
//             )?;

//             jail.set_env("APP_SERVER__HOST", "127.0.0.1");
//             jail.set_env("APP_SERVER__PORT", "8080");
//             jail.set_env(
//                 "APP_DATABASE__URL",
//                 "postgresql://user:pass@localhost:5432/my_app",
//             );
//             let config = load_config::<Config>(&Environment::Test).unwrap();

//             assert_that!(
//                 config,
//                 eq(&Config {
//                     server:      ServerConfig {
//                         host: IpAddr::V4(Ipv4Addr::LOCALHOST),
//                         port: 8080,
//                         ..Default::default()
//                     },
//                     database:    DatabaseConfig {
//                         url:
// String::from("postgresql://user:pass@localhost:5432/my_app"),
// },                     app_setting: String::from("override!"),
//                 })
//             );

//             Ok(())
//         });
//     }

//     #[test]
//     #[allow(clippy::result_large_err)]
//     fn test_load_config_production() {
//         figment::Jail::expect_with(|jail| {
//             let config_dir = jail.create_dir("config")?;
//             jail.create_file(
//                 config_dir.join("Config.toml"),
//                 r#"
//                 app_setting = "Just a TOML App!"
//             "#,
//             )?;
//             let environments_dir = jail.create_dir("config/environments")?;
//             jail.create_file(
//                 environments_dir.join("production.toml"),
//                 r#"
//                 app_setting = "override!"
//             "#,
//             )?;

//             jail.set_env("APP_SERVER__HOST", "127.0.0.1");
//             jail.set_env("APP_SERVER__PORT", "8080");
//             jail.set_env(
//                 "APP_DATABASE__URL",
//                 "postgresql://user:pass@localhost:5432/my_app",
//             );
//             let config =
// load_config::<Config>(&Environment::Production).unwrap();

//             assert_that!(
//                 config,
//                 eq(&Config {
//                     server:      ServerConfig {
//                         host: IpAddr::V4(Ipv4Addr::LOCALHOST),
//                         port: 8080,
//                         ..Default::default()
//                     },
//                     database:    DatabaseConfig {
//                         url:
// String::from("postgresql://user:pass@localhost:5432/my_app"),
// },                     app_setting: String::from("override!"),
//                 })
//             );

//             Ok(())
//         });
//     }
// }
