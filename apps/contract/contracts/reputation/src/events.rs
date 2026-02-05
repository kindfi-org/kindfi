use soroban_sdk::{contractevent, Address};

use crate::types::{EventType, Level};

/// Event data emitted when a reputation event is recorded.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReputationEventData {
    /// User who received the points
    #[topic]
    pub user: Address,
    /// Type of event
    pub event_type: EventType,
    /// Points awarded
    pub points: u32,
    /// New total points after this event
    pub new_total_points: u32,
}

/// Event data emitted when a user levels up.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LevelUpEventData {
    /// User who leveled up
    #[topic]
    pub user: Address,
    /// Previous level
    pub old_level: Level,
    /// New level achieved
    pub new_level: Level,
    /// Total points at time of level up
    pub total_points: u32,
}

/// Event data emitted when a user's NFT is upgraded.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NFTUpgradedEventData {
    /// User whose NFT was upgraded
    #[topic]
    pub user: Address,
    /// Token ID that was upgraded
    pub token_id: u32,
    /// New level reflected in the NFT
    pub new_level: Level,
}

/// Event data emitted when level thresholds are updated.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ThresholdsUpdatedData {
    /// Admin who made the update
    #[topic]
    pub admin: Address,
    /// Timestamp of the update
    pub timestamp: u64,
}

/// Event data emitted when event point values are updated.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PointValuesUpdatedData {
    /// Admin who made the update
    #[topic]
    pub admin: Address,
    /// Timestamp of the update
    pub timestamp: u64,
}

/// Event data emitted when an NFT contract is set or updated.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NFTContractSetEventData {
    /// Admin who made the update
    #[topic]
    pub admin: Address,
    /// NFT contract address
    pub nft_contract: Address,
}

/// Event data emitted when a user's NFT token ID is registered.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UserNFTRegisteredData {
    /// User whose NFT was registered
    #[topic]
    pub user: Address,
    /// Token ID registered
    pub token_id: u32,
}
