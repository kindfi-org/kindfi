use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum NFTError {
    AlreadyInitialized = 1,
    NotAuthorized = 2,
    TokenNotFound = 3,
    NotTokenOwner = 4,
    TokenAlreadyExists = 5,
}
