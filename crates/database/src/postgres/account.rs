use sqlx::PgPool;

#[derive(Debug, Clone)]
pub struct AccountRepo(PgPool);
impl AccountRepo {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}
