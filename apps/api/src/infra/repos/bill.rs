#[async_trait::async_trait]
pub(crate) trait BillRepo: Send + Sync {
    async fn create(&self) -> anyhow::Result<String>;
    async fn find_unique(&self) -> anyhow::Result<String>;
    async fn find_one(&self) -> anyhow::Result<String>;
    async fn find_many(&self) -> anyhow::Result<Vec<String>>;
    async fn update(&self) -> anyhow::Result<String>;
    async fn delete(&self) -> anyhow::Result<String>;
}
