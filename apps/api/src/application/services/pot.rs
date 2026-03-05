use std::sync::Arc;

use crate::application::repos::PotRepo;

pub(crate) struct PotService(Arc<dyn PotRepo>);

impl PotService {
    pub fn new(repo: Arc<dyn PotRepo>) -> Self { Self(repo) }
}
