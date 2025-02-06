use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Eq, PartialEq, Debug)]
pub enum NFTError {
    AlreadyInitialized = 100,
    NotAuthorized = 101,
    TokenAlreadyExists = 102,
    TokenNotFound = 103,
    NotTokenOwner = 104,
}
