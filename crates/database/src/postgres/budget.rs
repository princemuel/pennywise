use sqlx::PgPool;

#[derive(Debug, Clone)]
pub struct BudgetRepo(PgPool);
impl BudgetRepo {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}
