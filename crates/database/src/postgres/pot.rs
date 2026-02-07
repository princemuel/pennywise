use sqlx::PgPool;

#[derive(Debug, Clone)]
pub struct PotRepo(PgPool);
impl PotRepo {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}
