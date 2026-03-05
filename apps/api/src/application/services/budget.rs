use std::sync::Arc;

use crate::application::repos::BudgetRepo;

pub(crate) struct BudgetService(Arc<dyn BudgetRepo>);

impl BudgetService {
    pub fn new(repo: Arc<dyn BudgetRepo>) -> Self { Self(repo) }
}
