use sqlx::PgPool;

#[derive(Debug, Clone)]
pub struct UserRepo(PgPool);
impl UserRepo {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}
