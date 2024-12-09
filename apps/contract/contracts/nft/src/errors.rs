#[derive(Debug)]
pub enum NFTError {
  AlreadyInitialized,
  NotAuthorized,
  TokenAlreadyExists,
  TokenNotFound,
  NotTokenOwner,
}