use soroban_sdk::{contracttype, Address, String};

#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
#[contracttype]
pub enum BadgeType {
    Chapter,
    Quest,
    Streak,
    EarlyParticipation,
}

/// Represents a non-transferable badge earned by a user
#[derive(Clone, Debug, PartialEq, Eq)]
#[contracttype]
pub struct Badge {
    /// Unique identifier for the badge (matches reference_id)
    pub badge_id: u32,
    /// Type of achievement this badge represents
    pub badge_type: BadgeType,
    /// Address of the user who earned this badge
    pub user: Address,
    /// Timestamp when the badge was minted
    pub timestamp: u64,
    /// JSON metadata describing the badge achievement
    pub metadata: String,
}
