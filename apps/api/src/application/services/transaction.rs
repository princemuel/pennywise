use std::sync::Arc;

use crate::application::repos::TransactionRepo;

pub(crate) struct TransactionService(Arc<dyn TransactionRepo>);

impl TransactionService {
    pub fn new(repo: Arc<dyn TransactionRepo>) -> Self { Self(repo) }
}
