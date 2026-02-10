use sqlx::PgPool;

use crate::config::Settings;

pub async fn create_pool(settings: &Settings) -> PgPool {
    settings
        .database
        .pool_options()
        .connect_with(settings.database.connect_options())
        .await
        .expect("Failed to connect to database")
}
