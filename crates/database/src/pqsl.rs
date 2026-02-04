use sqlx::PgPool;

#[derive(Debug, Clone)]
pub struct UserRepoPostgres(PgPool);
impl UserRepoPostgres {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}

#[derive(Debug, Clone)]
pub struct AccountRepoPostgres(PgPool);
impl AccountRepoPostgres {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}

#[derive(Debug, Clone)]
pub struct BudgetRepoPostgres(PgPool);
impl BudgetRepoPostgres {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}

#[derive(Debug, Clone)]
pub struct PotRepoPostgres(PgPool);
impl PotRepoPostgres {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}

#[derive(Debug, Clone)]
pub struct BillRepoPostgres(PgPool);
impl BillRepoPostgres {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}

#[derive(Debug, Clone)]
pub struct TransactionRepoPostgres(PgPool);
impl TransactionRepoPostgres {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}
