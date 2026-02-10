use thiserror::Error;

#[derive(Debug, Error)]
pub(crate) enum Error {
    #[error("Invalid email address")]
    InvalidEmail,
}
