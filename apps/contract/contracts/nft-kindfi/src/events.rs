use soroban_sdk::{contracttype, symbol_short, Address, Symbol};

use crate::types::NFTMetadata;

// Event topic symbols
pub const NFT: Symbol = symbol_short!("NFT");
pub const MINTED: Symbol = symbol_short!("MINTED");
pub const BURNED: Symbol = symbol_short!("BURNED");
pub const METADATA: Symbol = symbol_short!("METADATA");
pub const UPDATED: Symbol = symbol_short!("UPDATED");

/// Event data emitted when an NFT is minted with metadata.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MintedEventData {
    pub token_id: u32,
    pub to: Address,
    pub metadata: NFTMetadata,
}

/// Event data emitted when an NFT is burned.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BurnedEventData {
    pub token_id: u32,
    pub from: Address,
}

/// Event data emitted when NFT metadata is updated.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MetadataUpdatedEventData {
    pub token_id: u32,
    pub metadata: NFTMetadata,
}
