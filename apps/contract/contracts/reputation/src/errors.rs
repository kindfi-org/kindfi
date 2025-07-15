use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum ReputationError {
    AlreadyInitialized = 1,
    NotAuthorized = 2,
    UserNotFound = 3,
    InvalidTier = 4,
    ContractNotInitialized = 5,
    NFTContractError = 6,
    InvalidAdminAddress = 7,
    InvalidNftContractId = 8,
    InvalidThresholdOrdering = 9,
}
