mod account;
mod bill;
mod budget;
mod pot;
mod transaction;
mod user;

use std::sync::Arc;

pub use account::*;
pub use bill::*;
pub use budget::*;
pub use pot::*;
pub use transaction::*;
pub use user::*;

/// Central Database struct, like Prisma's `db`
#[derive(Clone)]
pub struct Database {
    pub account:     Arc<AccountRepo>,
    pub user:        Arc<UserRepo>,
    pub budget:      Arc<BudgetRepo>,
    pub pot:         Arc<PotRepo>,
    pub transaction: Arc<TransactionRepo>,
    pub bill:        Arc<BillRepo>,
}
impl Database {
    pub fn new(pool: sqlx::PgPool) -> Self {
        Self {
            account:     Arc::new(AccountRepo::new(pool.clone())),
            user:        Arc::new(UserRepo::new(pool.clone())),
            budget:      Arc::new(BudgetRepo::new(pool.clone())),
            bill:        Arc::new(BillRepo::new(pool.clone())),
            transaction: Arc::new(TransactionRepo::new(pool.clone())),
            pot:         Arc::new(PotRepo::new(pool.clone())),
        }
    }
}
