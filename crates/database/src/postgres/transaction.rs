use sqlx::PgPool;

#[derive(Debug, Clone)]
pub struct TransactionRepo(PgPool);
impl TransactionRepo {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}
