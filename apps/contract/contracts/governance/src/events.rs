use soroban_sdk::{contractevent, Address, String};

use crate::types::{NftTier, VoteType};

/// Emitted when a new governance round is created.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RoundCreatedEvent {
    /// Admin who created the round
    #[topic]
    pub creator: Address,
    /// Unique round ID assigned
    pub round_id: u32,
    /// Round title
    pub title: String,
    /// Ledger sequence when voting opens
    pub start_ledger: u32,
    /// Ledger sequence when voting closes
    pub end_ledger: u32,
    /// Fund amount in stroops
    pub fund_amount: i128,
}

/// Emitted when a redistribution option is added to a round.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct OptionAddedEvent {
    /// Round the option was added to
    #[topic]
    pub round_id: u32,
    /// New option ID
    pub option_id: u32,
    /// Option title
    pub title: String,
}

/// Emitted when a vote is successfully cast.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VoteCastEvent {
    /// Round the vote belongs to
    #[topic]
    pub round_id: u32,
    /// Voter's address
    #[topic]
    pub voter: Address,
    /// Option the vote was cast for
    pub option_id: u32,
    /// Up or Down
    pub vote_type: VoteType,
    /// Tier-based weight applied
    pub weight: u32,
    /// Voter's NFT tier at the time of voting
    pub tier: NftTier,
}

/// Emitted when a round is closed and a winner is determined.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RoundClosedEvent {
    /// Round that was closed
    #[topic]
    pub round_id: u32,
    /// Winning option ID (None if no votes were cast)
    pub winner_option_id: Option<u32>,
    /// Total voters who participated
    pub total_voters: u32,
}
