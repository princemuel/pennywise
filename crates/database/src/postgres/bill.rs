use sqlx::PgPool;

#[derive(Debug, Clone)]
pub struct BillRepo(PgPool);
impl BillRepo {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}
