// NOTE: Soroban SDK generic types without explicit environment parameter
// String and Vec in soroban_sdk are actually String<Env> and Vec<T, Env>, but within
// smart contracts they work as type aliases that automatically bind to the contract's
// environment. This can be confusing for newcomers who might expect explicit generics.
// Alternative: use soroban_sdk::{Address, contracterror, contracttype} and then
// soroban_sdk::String, soroban_sdk::Vec where needed for more explicit typing.
use soroban_sdk::{Address, String, Vec, contracterror, contracttype};

/// Storage keys for the contract
#[contracttype]
#[derive(Clone)]
pub enum DataKeys {
    Admin,                  // Address of the contract admin
    Paused,                // Contract pause status
    ProgressTracker,       // Address of the progress tracker contract
    BadgeTracker,          // Address of the badge tracker contract
    GraduationNFT(Address), // Graduation NFT for a specific user
    MaxBadges,             // Maximum number of badges allowed
}

/// Structure representing a soulbound graduation NFT
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct GraduationNFT {
    pub owner: Address,        // Address of the user who earned the NFT
    pub metadata: NFTMetadata, // Metadata containing graduation details
}

/// Metadata structure for graduation NFTs
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NFTMetadata {
    pub issued_at: u64,      // Timestamp of NFT issuance
    pub version: String,     // Academy version (e.g., "v1.0")
    pub badges: Vec<String>, // List of earned badges
    pub achievement_score: u32, // Overall achievement score
    pub completion_date: u64,  // Date of course completion
}

/// NFT-related error codes
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum NFTError {
    AlreadyMinted = 1,
    NotCompleted = 2,
    AlreadyInitialized = 3,
    Soulbound = 4,
    Uninitialized = 5,
    NoAdmin = 6,
    InvalidAdmin = 7,
    Paused = 8,
    TooManyBadges = 9,
    InvalidInput = 10,
    Unauthorized = 11,
}
