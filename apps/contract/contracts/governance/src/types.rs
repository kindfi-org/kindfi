use soroban_sdk::{contracttype, Address, String};

// ============================================================================
// Enums
// ============================================================================

/// Status of a governance round.
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum RoundStatus {
    /// Round created but start ledger not yet reached
    Upcoming = 0,
    /// Round is open for voting
    Active = 1,
    /// Round is closed; winner determined
    Ended = 2,
}

/// Direction of a vote.
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum VoteType {
    /// Positive vote for this option
    Up = 0,
    /// Negative vote against this option
    Down = 1,
}

/// NFT tier mapped from the Reputation contract level (0–4).
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum NftTier {
    /// Level 0 — not eligible to vote
    Rookie = 0,
    /// Level 1 — 1 vote weight
    Bronze = 1,
    /// Level 2 — 3 vote weight
    Silver = 2,
    /// Level 3 — 5 vote weight
    Gold = 3,
    /// Level 4 — 10 vote weight
    Diamond = 4,
}

impl NftTier {
    /// Convert a Reputation contract level (u32) to an NftTier.
    pub fn from_level(level: u32) -> NftTier {
        match level {
            1 => NftTier::Bronze,
            2 => NftTier::Silver,
            3 => NftTier::Gold,
            4 => NftTier::Diamond,
            _ => NftTier::Rookie,
        }
    }

    /// Returns the vote weight assigned to this tier.
    pub fn vote_weight(self) -> u32 {
        match self {
            NftTier::Rookie => 0,
            NftTier::Bronze => 1,
            NftTier::Silver => 3,
            NftTier::Gold => 5,
            NftTier::Diamond => 10,
        }
    }
}

// ============================================================================
// Structs
// ============================================================================

/// An on-chain governance voting round.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct GovernanceRound {
    /// Unique sequential ID
    pub round_id: u32,
    /// Human-readable title
    pub title: String,
    /// Current status
    pub status: RoundStatus,
    /// Ledger sequence number when voting opens
    pub start_ledger: u32,
    /// Ledger sequence number when voting closes
    pub end_ledger: u32,
    /// Total community fund amount at stake (in stroops)
    pub fund_amount: i128,
    /// Winning option ID (None until round ends)
    pub winner_option_id: Option<u32>,
    /// Number of options registered for this round
    pub option_count: u32,
    /// Ledger timestamp when the round was created
    pub created_at: u64,
}

/// A redistribution option within a governance round.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct GovernanceOption {
    /// Unique ID within the round (sequential from 0)
    pub option_id: u32,
    /// Round this option belongs to
    pub round_id: u32,
    /// Human-readable title (e.g., campaign name)
    pub title: String,
    /// Cumulative weight of all upvotes
    pub upvote_weight: u32,
    /// Cumulative weight of all downvotes
    pub downvote_weight: u32,
    /// Number of individual votes cast (up + down)
    pub vote_count: u32,
}

/// Record of a single user's vote in a round.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UserVote {
    /// Option the user voted for
    pub option_id: u32,
    /// Up or Down
    pub vote_type: VoteType,
    /// Tier-based weight applied
    pub weight: u32,
    /// Voter's NFT tier at time of vote
    pub tier: NftTier,
    /// Ledger timestamp of the vote
    pub voted_at: u64,
}

// ============================================================================
// Storage Keys
// ============================================================================

#[contracttype]
#[derive(Clone)]
pub enum StorageKey {
    /// Initialized flag
    Initialized,
    /// Reputation contract address (for tier lookup)
    ReputationContract,
    /// Auto-increment counter for round IDs
    NextRoundId,
    /// Round data: Round(round_id) → GovernanceRound
    Round(u32),
    /// Option data: Option(round_id, option_id) → GovernanceOption
    Option(u32, u32),
    /// Auto-increment counter per round: NextOptionId(round_id) → u32
    NextOptionId(u32),
    /// User vote record: UserVote(voter_address, round_id) → UserVote
    UserVote(Address, u32),
    /// Total voter count per round: VoterCount(round_id) → u32
    VoterCount(u32),
}

// ============================================================================
// Default vote weight constants (matches frontend TIERS config)
// ============================================================================

pub const WEIGHT_BRONZE: u32 = 1;
pub const WEIGHT_SILVER: u32 = 3;
pub const WEIGHT_GOLD: u32 = 5;
pub const WEIGHT_DIAMOND: u32 = 10;
