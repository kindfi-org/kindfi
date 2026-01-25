use soroban_sdk::contracterror;

/// Error codes for the KindFi Reputation contract.
/// Uses error codes starting at 400 to avoid conflicts with other contracts.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Contract has already been initialized
    AlreadyInitialized = 400,
    /// Caller does not have required role
    Unauthorized = 401,
    /// User not found in the reputation system
    UserNotFound = 402,
    /// Invalid event type provided
    InvalidEventType = 403,
    /// Invalid points value (must be positive)
    InvalidPoints = 404,
    /// Points calculation would overflow
    PointsOverflow = 405,
    /// Invalid level threshold configuration
    InvalidLevelThreshold = 406,
    /// NFT contract address not configured
    NFTContractNotSet = 407,
    /// NFT upgrade cross-contract call failed
    NFTUpgradeFailed = 408,
    /// User does not have an NFT registered
    UserHasNoNFT = 409,
}
