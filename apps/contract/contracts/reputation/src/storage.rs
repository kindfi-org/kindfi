use soroban_sdk::{Address, Env, Vec};

use crate::types::{
    EventType, Level, ReputationEventRecord, StorageKey, ThresholdType,
    BRONZE_THRESHOLD, DEFAULT_BOOSTED_PROJECT_POINTS, DEFAULT_DONATION_POINTS,
    DEFAULT_NEW_CAMPAIGN_POINTS, DEFAULT_NEW_CATEGORY_POINTS, DEFAULT_OUTSTANDING_BOOSTER_POINTS,
    DEFAULT_QUEST_COMPLETION_POINTS, DEFAULT_REFERRAL_POINTS, DEFAULT_STREAK_DONATION_POINTS,
    DIAMOND_THRESHOLD, GOLD_THRESHOLD, ROOKIE_THRESHOLD, SILVER_THRESHOLD,
};

/// TTL constants (30 days in ledgers, assuming ~5 second block time)
const DAY_IN_LEDGERS: u32 = 17280;
const PERSISTENT_TTL_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;
const PERSISTENT_TTL_THRESHOLD: u32 = PERSISTENT_TTL_AMOUNT - DAY_IN_LEDGERS;

// ============================================================================
// Points Storage
// ============================================================================

/// Get user's total points
pub fn get_points(e: &Env, user: &Address) -> u32 {
    let key = StorageKey::UserPoints(user.clone());
    let points = e.storage().persistent().get(&key).unwrap_or(0);
    if points > 0 {
        e.storage()
            .persistent()
            .extend_ttl(&key, PERSISTENT_TTL_THRESHOLD, PERSISTENT_TTL_AMOUNT);
    }
    points
}

/// Set user's total points
pub fn set_points(e: &Env, user: &Address, points: u32) {
    let key = StorageKey::UserPoints(user.clone());
    e.storage().persistent().set(&key, &points);
    e.storage()
        .persistent()
        .extend_ttl(&key, PERSISTENT_TTL_THRESHOLD, PERSISTENT_TTL_AMOUNT);
}

// ============================================================================
// Level Storage
// ============================================================================

/// Get user's current level
pub fn get_user_level(e: &Env, user: &Address) -> Level {
    let key = StorageKey::UserLevel(user.clone());
    let level = e.storage().persistent().get(&key).unwrap_or(Level::Rookie);
    if level != Level::Rookie {
        e.storage()
            .persistent()
            .extend_ttl(&key, PERSISTENT_TTL_THRESHOLD, PERSISTENT_TTL_AMOUNT);
    }
    level
}

/// Set user's current level
pub fn set_user_level(e: &Env, user: &Address, level: Level) {
    let key = StorageKey::UserLevel(user.clone());
    e.storage().persistent().set(&key, &level);
    e.storage()
        .persistent()
        .extend_ttl(&key, PERSISTENT_TTL_THRESHOLD, PERSISTENT_TTL_AMOUNT);
}

// ============================================================================
// Events History Storage
// ============================================================================

/// Get user's event history
pub fn get_user_events(e: &Env, user: &Address) -> Vec<ReputationEventRecord> {
    let key = StorageKey::UserEvents(user.clone());
    let events: Vec<ReputationEventRecord> = e
        .storage()
        .persistent()
        .get(&key)
        .unwrap_or(Vec::new(e));
    if !events.is_empty() {
        e.storage()
            .persistent()
            .extend_ttl(&key, PERSISTENT_TTL_THRESHOLD, PERSISTENT_TTL_AMOUNT);
    }
    events
}

/// Add an event to user's history
pub fn add_user_event(e: &Env, user: &Address, event: ReputationEventRecord) {
    let key = StorageKey::UserEvents(user.clone());
    let mut events = get_user_events(e, user);
    events.push_back(event);
    e.storage().persistent().set(&key, &events);
    e.storage()
        .persistent()
        .extend_ttl(&key, PERSISTENT_TTL_THRESHOLD, PERSISTENT_TTL_AMOUNT);
}

// ============================================================================
// NFT Token ID Storage
// ============================================================================

/// Get user's NFT token ID
pub fn get_user_nft_token_id(e: &Env, user: &Address) -> Option<u32> {
    let key = StorageKey::UserNFTTokenId(user.clone());
    let token_id: Option<u32> = e.storage().persistent().get(&key);
    if token_id.is_some() {
        e.storage()
            .persistent()
            .extend_ttl(&key, PERSISTENT_TTL_THRESHOLD, PERSISTENT_TTL_AMOUNT);
    }
    token_id
}

/// Set user's NFT token ID
pub fn set_user_nft_token_id(e: &Env, user: &Address, token_id: u32) {
    let key = StorageKey::UserNFTTokenId(user.clone());
    e.storage().persistent().set(&key, &token_id);
    e.storage()
        .persistent()
        .extend_ttl(&key, PERSISTENT_TTL_THRESHOLD, PERSISTENT_TTL_AMOUNT);
}

// ============================================================================
// Configuration Storage
// ============================================================================

/// Get NFT contract address
pub fn get_nft_contract(e: &Env) -> Option<Address> {
    let key = StorageKey::NFTContract;
    e.storage().instance().get(&key)
}

/// Set NFT contract address
pub fn set_nft_contract(e: &Env, address: &Address) {
    let key = StorageKey::NFTContract;
    e.storage().instance().set(&key, address);
}

/// Get level threshold (returns default if not set)
pub fn get_level_threshold(e: &Env, level: Level) -> u32 {
    let key = StorageKey::LevelThreshold(level);
    e.storage().instance().get(&key).unwrap_or_else(|| {
        match level {
            Level::Rookie => ROOKIE_THRESHOLD,
            Level::Bronze => BRONZE_THRESHOLD,
            Level::Silver => SILVER_THRESHOLD,
            Level::Gold => GOLD_THRESHOLD,
            Level::Diamond => DIAMOND_THRESHOLD,
        }
    })
}

/// Set level threshold
pub fn set_level_threshold(e: &Env, level: Level, threshold: u32) {
    let key = StorageKey::LevelThreshold(level);
    e.storage().instance().set(&key, &threshold);
}

/// Get event point value (returns default if not set)
pub fn get_event_point_value(e: &Env, event_type: EventType) -> u32 {
    let key = StorageKey::EventPointValue(event_type);
    e.storage().instance().get(&key).unwrap_or_else(|| {
        match event_type {
            EventType::Donation => DEFAULT_DONATION_POINTS,
            EventType::StreakDonation => DEFAULT_STREAK_DONATION_POINTS,
            EventType::SuccessfulReferral => DEFAULT_REFERRAL_POINTS,
            EventType::NewCategoryDonation => DEFAULT_NEW_CATEGORY_POINTS,
            EventType::NewCampaignDonation => DEFAULT_NEW_CAMPAIGN_POINTS,
            EventType::QuestCompletion => DEFAULT_QUEST_COMPLETION_POINTS,
            EventType::BoostedProject => DEFAULT_BOOSTED_PROJECT_POINTS,
            EventType::OutstandingBooster => DEFAULT_OUTSTANDING_BOOSTER_POINTS,
        }
    })
}

/// Set event point value
pub fn set_event_point_value(e: &Env, event_type: EventType, points: u32) {
    let key = StorageKey::EventPointValue(event_type);
    e.storage().instance().set(&key, &points);
}

/// Get permission threshold (returns default if not set)
pub fn get_permission_threshold(e: &Env, threshold_type: ThresholdType) -> Level {
    let key = StorageKey::PermissionThreshold(threshold_type);
    e.storage().instance().get(&key).unwrap_or_else(|| {
        match threshold_type {
            ThresholdType::Voting => Level::Bronze,
            ThresholdType::EarlyAccess => Level::Silver,
            ThresholdType::ExclusiveRounds => Level::Gold,
            ThresholdType::SpecialRewards => Level::Diamond,
        }
    })
}

/// Set permission threshold
pub fn set_permission_threshold(e: &Env, threshold_type: ThresholdType, level: Level) {
    let key = StorageKey::PermissionThreshold(threshold_type);
    e.storage().instance().set(&key, &level);
}

// ============================================================================
// Initialization Storage
// ============================================================================

/// Check if contract is initialized
pub fn is_initialized(e: &Env) -> bool {
    let key = StorageKey::Initialized;
    e.storage().instance().has(&key)
}

/// Mark contract as initialized
pub fn set_initialized(e: &Env) {
    let key = StorageKey::Initialized;
    e.storage().instance().set(&key, &true);
}
