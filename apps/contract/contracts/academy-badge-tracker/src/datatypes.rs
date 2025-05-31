use soroban_sdk::{contracttype, Address, String};

#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
#[contracttype]
pub enum BadgeType {
    Chapter,
    Quest,
    Streak,
    EarlyParticipation,
}

#[derive(Clone, Debug, PartialEq, Eq)]
#[contracttype]
pub struct Badge {
    pub badge_id: u32,
    pub badge_type: BadgeType,
    pub user: Address,
    pub timestamp: u64,
    pub metadata: String,
}
