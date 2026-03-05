use std::sync::Arc;

use crate::application::repos::UserRepo;

pub(crate) struct UserService(Arc<dyn UserRepo>);

impl UserService {
    pub fn new(repo: Arc<dyn UserRepo>) -> Self { Self(repo) }
}
