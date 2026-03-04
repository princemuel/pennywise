use sqlx::PgPool;

pub fn build(pool: &PgPool) -> Services { Services {} }

#[derive(Clone, Debug)]
pub(crate) struct Services {}
