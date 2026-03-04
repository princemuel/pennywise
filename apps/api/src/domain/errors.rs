#[derive(Debug, thiserror::Error)]
pub(crate) enum Error {
    #[error("Invalid email address")]
    InvalidEmail,
}
