mod account;
mod budget;
mod category;
mod goal;
mod recurring;
mod transaction;
mod user;

use std::sync::Arc;

pub use account::*;
pub use budget::*;
pub use category::*;
pub use goal::*;
pub use recurring::*;
pub use transaction::*;
pub use user::*;

/// Central Database struct, like Prisma's `db`
/// Provides access to all repository implementations
#[derive(Clone)]
pub struct Database {
    pub user:            Arc<UserRepo>,
    pub account:         Arc<AccountRepo>,
    pub category:        Arc<CategoryRepo>,
    pub transaction:     Arc<TransactionRepo>,
    pub entry:           Arc<TransactionEntryRepo>,
    pub budget:          Arc<BudgetRepo>,
    pub goal:            Arc<GoalRepo>,
    pub goal_allocation: Arc<GoalAllocationRepo>,
    pub recurring:       Arc<RecurringRuleRepo>,
}

impl Database {
    pub fn new(pool: sqlx::PgPool) -> Self {
        Self {
            user:            Arc::new(UserRepo::new(pool.clone())),
            account:         Arc::new(AccountRepo::new(pool.clone())),
            category:        Arc::new(CategoryRepo::new(pool.clone())),
            transaction:     Arc::new(TransactionRepo::new(pool.clone())),
            entry:           Arc::new(TransactionEntryRepo::new(pool.clone())),
            budget:          Arc::new(BudgetRepo::new(pool.clone())),
            goal:            Arc::new(GoalRepo::new(pool.clone())),
            goal_allocation: Arc::new(GoalAllocationRepo::new(pool.clone())),
            recurring:       Arc::new(RecurringRuleRepo::new(pool.clone())),
        }
    }
}
