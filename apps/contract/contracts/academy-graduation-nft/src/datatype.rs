use soroban_sdk::{Address, String, Vec, contracterror, contracttype};

/// Storage keys for the contract
#[contracttype]
#[derive(Clone)]
pub enum DataKeys {
    ProgressTracker,        // Address of the progress tracker contract
    BadgeTracker,           // Address of the badge tracker contract
    GraduationNFT(Address), // Graduation NFT for a specific user
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
    pub badges: Vec<String>, // String of badges
}

/// NFT-related error codes
#[contracterror]
#[derive(Debug, Clone, PartialEq)]
pub enum NFTError {
    AlreadyMinted = 1,
    NotCompleted = 2,
    Uninitialized = 3,
    TokenCannotBeTransferred = 4,
}
