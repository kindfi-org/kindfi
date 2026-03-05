use soroban_sdk::{Address, Env};

use crate::types::{StreakInfo, StreakPeriod, StorageKey};

/// Check if contract is initialized.
pub fn is_initialized(e: &Env) -> bool {
    e.storage()
        .instance()
        .has(&StorageKey::Initialized)
}

/// Set initialized flag.
pub fn set_initialized(e: &Env) {
    e.storage().instance().set(&StorageKey::Initialized, &true);
}

/// Get admin address.
pub fn get_admin(e: &Env) -> Option<Address> {
    e.storage().instance().get(&StorageKey::Admin)
}

/// Set admin address.
pub fn set_admin(e: &Env, admin: &Address) {
    e.storage().instance().set(&StorageKey::Admin, admin);
}

/// Get reputation contract address.
pub fn get_reputation_contract(e: &Env) -> Option<Address> {
    e.storage().instance().get(&StorageKey::ReputationContract)
}

/// Set reputation contract address.
pub fn set_reputation_contract(e: &Env, contract: &Address) {
    e.storage()
        .instance()
        .set(&StorageKey::ReputationContract, contract);
}

/// Get user's streak info.
pub fn get_user_streak(e: &Env, user: &Address, period: StreakPeriod) -> Option<StreakInfo> {
    e.storage()
        .persistent()
        .get(&StorageKey::UserStreak(user.clone(), period))
}

/// Set user's streak info.
pub fn set_user_streak(e: &Env, user: &Address, streak: &StreakInfo) {
    e.storage()
        .persistent()
        .set(&StorageKey::UserStreak(user.clone(), streak.period), streak);
    
    // Extend TTL for persistent storage (30 days)
    e.storage()
        .persistent()
        .extend_ttl(&StorageKey::UserStreak(user.clone(), streak.period), 518400, 518400);
}
