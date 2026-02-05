use soroban_sdk::contracterror;

/// Error codes for the KindFi NFT contract.
/// Uses error codes starting at 300 to avoid conflicts with OpenZeppelin NFT errors (200-214).
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Contract has already been initialized
    AlreadyInitialized = 300,
    /// Token ID counter overflow
    TokenIdOverflow = 301,
    /// Metadata not found for the specified token
    MetadataNotFound = 302,
    /// Token does not exist
    TokenNotFound = 303,
    /// Caller does not have required role
    Unauthorized = 304,
    /// Invalid metadata provided
    InvalidMetadata = 305,
}
