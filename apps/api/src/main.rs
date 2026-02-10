#[tokio::main]
async fn main() -> anyhow::Result<()> { api::bootstrap::run().await }
