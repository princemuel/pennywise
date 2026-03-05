use std::sync::Arc;

use crate::application::repos::BillRepo;

pub(crate) struct BillService(Arc<dyn BillRepo>);

impl BillService {
    pub fn new(repo: Arc<dyn BillRepo>) -> Self { Self(repo) }
}
