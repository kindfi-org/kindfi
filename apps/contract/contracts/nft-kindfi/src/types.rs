use soroban_sdk::{contracttype, String, Vec};

/// Custom metadata structure for KindFi NFTs.
/// Stores on-chain metadata per token for the reputation and incentivization system.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NFTMetadata {
    /// Display name for the NFT
    pub name: String,
    /// Description of the NFT
    pub description: String,
    /// URI pointing to the NFT image
    pub image_uri: String,
    /// External URL for more information
    pub external_url: String,
    /// List of attribute strings (e.g., "level:gold", "badge:early_supporter")
    pub attributes: Vec<String>,
}

/// Storage keys for the KindFi NFT contract.
#[contracttype]
#[derive(Clone)]
pub enum StorageKey {
    /// Counter for sequential token IDs
    TokenCounter,
    /// Custom metadata storage per token ID
    TokenMetadata(u32),
}
