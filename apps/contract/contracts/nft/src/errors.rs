use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum NFTError {
    AlreadyInitialized = 1,
    NotAuthorized = 2,
    TokenNotFound = 3,
    NotTokenOwner = 4,
    TokenAlreadyExists = 5,
    RateLimitExceeded = 6,
    InvalidSignature = 7,
    InsufficientSignatures = 8,
    Paused = 9,
    UnknownError = 10,
    InvalidOperation = 9,
}
