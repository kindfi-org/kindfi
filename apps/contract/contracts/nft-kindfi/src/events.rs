use soroban_sdk::{contractevent, Address};

use crate::types::NFTMetadata;

/// Event data emitted when an NFT is minted with metadata.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MintedEventData {
    #[topic]
    pub token_id: u32,
    pub to: Address,
    pub metadata: NFTMetadata,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BurnedEventData {
    #[topic]
    pub token_id: u32,
    pub from: Address,
}

/// Event data emitted when NFT metadata is updated.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MetadataUpdatedEventData {
    #[topic]
    pub token_id: u32,
    pub metadata: NFTMetadata,
}
