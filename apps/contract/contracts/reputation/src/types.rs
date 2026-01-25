use soroban_sdk::{contracttype, Address};

/// Event types that can award reputation points.
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum EventType {
    /// User made a donation
    Donation = 0,
    /// User maintained a donation streak
    StreakDonation = 1,
    /// User successfully referred someone
    SuccessfulReferral = 2,
    /// User donated to a new category for the first time
    NewCategoryDonation = 3,
    /// User donated to a new campaign for the first time
    NewCampaignDonation = 4,
    /// User completed a quest
    QuestCompletion = 5,
    /// User boosted a project
    BoostedProject = 6,
    /// User is an outstanding booster
    OutstandingBooster = 7,
}

/// Threshold types for permission-based access.
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ThresholdType {
    /// Voting rights threshold
    Voting = 0,
    /// Early access to features threshold
    EarlyAccess = 1,
    /// Access to exclusive funding rounds
    ExclusiveRounds = 2,
    /// Special rewards eligibility
    SpecialRewards = 3,
}

/// Reputation levels with their point thresholds.
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Level {
    /// Starting level (0 points)
    Rookie = 0,
    /// Bronze level (200 points)
    Bronze = 1,
    /// Silver level (500 points)
    Silver = 2,
    /// Gold level (1000 points)
    Gold = 3,
    /// Diamond level (5000 points)
    Diamond = 4,
}

impl Level {
    /// Convert level to u32 representation
    pub fn as_u32(&self) -> u32 {
        match self {
            Level::Rookie => 0,
            Level::Bronze => 1,
            Level::Silver => 2,
            Level::Gold => 3,
            Level::Diamond => 4,
        }
    }

    /// Create level from u32
    pub fn from_u32(value: u32) -> Option<Level> {
        match value {
            0 => Some(Level::Rookie),
            1 => Some(Level::Bronze),
            2 => Some(Level::Silver),
            3 => Some(Level::Gold),
            4 => Some(Level::Diamond),
            _ => None,
        }
    }
}

/// Record of a reputation event for a user.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReputationEventRecord {
    /// Type of event that occurred
    pub event_type: EventType,
    /// Points awarded for this event
    pub points: u32,
    /// Timestamp when the event was recorded
    pub timestamp: u64,
}

/// Storage keys for the Reputation contract.
#[contracttype]
#[derive(Clone)]
pub enum StorageKey {
    /// Admin address
    Admin,
    /// NFT contract address for integration
    NFTContract,
    /// User's total points: UserPoints(Address) -> u32
    UserPoints(Address),
    /// User's current level: UserLevel(Address) -> Level
    UserLevel(Address),
    /// User's NFT token ID: UserNFTTokenId(Address) -> u32
    UserNFTTokenId(Address),
    /// User's event history: UserEvents(Address) -> Vec<ReputationEventRecord>
    UserEvents(Address),
    /// Level threshold configuration: LevelThreshold(Level) -> u32
    LevelThreshold(Level),
    /// Event point values: EventPointValue(EventType) -> u32
    EventPointValue(EventType),
    /// Permission thresholds: PermissionThreshold(ThresholdType) -> Level
    PermissionThreshold(ThresholdType),
    /// Contract initialized flag
    Initialized,
}

/// Default point values for each event type
pub const DEFAULT_DONATION_POINTS: u32 = 10;
pub const DEFAULT_STREAK_DONATION_POINTS: u32 = 25;
pub const DEFAULT_REFERRAL_POINTS: u32 = 50;
pub const DEFAULT_NEW_CATEGORY_POINTS: u32 = 15;
pub const DEFAULT_NEW_CAMPAIGN_POINTS: u32 = 5;
pub const DEFAULT_QUEST_COMPLETION_POINTS: u32 = 30;
pub const DEFAULT_BOOSTED_PROJECT_POINTS: u32 = 20;
pub const DEFAULT_OUTSTANDING_BOOSTER_POINTS: u32 = 100;

/// Default level thresholds
pub const ROOKIE_THRESHOLD: u32 = 0;
pub const BRONZE_THRESHOLD: u32 = 200;
pub const SILVER_THRESHOLD: u32 = 500;
pub const GOLD_THRESHOLD: u32 = 1000;
pub const DIAMOND_THRESHOLD: u32 = 5000;
