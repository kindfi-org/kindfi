use soroban_sdk::{Address, Env, Vec};

use crate::types::{ReferralRecord, ReferrerStats, StorageKey};

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

/// Get referral record for a referred user.
pub fn get_referral_record(e: &Env, referred: &Address) -> Option<ReferralRecord> {
    e.storage()
        .persistent()
        .get(&StorageKey::ReferralRecord(referred.clone()))
}

/// Set referral record.
pub fn set_referral_record(e: &Env, record: &ReferralRecord) {
    e.storage()
        .persistent()
        .set(&StorageKey::ReferralRecord(record.referred.clone()), record);
    
    // Extend TTL for persistent storage (30 days)
    e.storage()
        .persistent()
        .extend_ttl(&StorageKey::ReferralRecord(record.referred.clone()), 518400, 518400);
}

/// Get referrer statistics.
pub fn get_referrer_stats(e: &Env, referrer: &Address) -> Option<ReferrerStats> {
    e.storage()
        .persistent()
        .get(&StorageKey::ReferrerStats(referrer.clone()))
}

/// Set referrer statistics.
pub fn set_referrer_stats(e: &Env, referrer: &Address, stats: &ReferrerStats) {
    e.storage()
        .persistent()
        .set(&StorageKey::ReferrerStats(referrer.clone()), stats);
    
    // Extend TTL
    e.storage()
        .persistent()
        .extend_ttl(&StorageKey::ReferrerStats(referrer.clone()), 518400, 518400);
}

/// Get referrer's referrals list.
pub fn get_referrer_referrals(e: &Env, referrer: &Address) -> Vec<Address> {
    e.storage()
        .persistent()
        .get(&StorageKey::ReferrerReferrals(referrer.clone()))
        .unwrap_or_else(|| Vec::new(e))
}

/// Add referral to referrer's list.
pub fn add_referrer_referral(e: &Env, referrer: &Address, referred: &Address) {
    let mut referrals = get_referrer_referrals(e, referrer);
    referrals.push_back(referred.clone());
    e.storage()
        .persistent()
        .set(&StorageKey::ReferrerReferrals(referrer.clone()), &referrals);
    
    // Extend TTL
    e.storage()
        .persistent()
        .extend_ttl(&StorageKey::ReferrerReferrals(referrer.clone()), 518400, 518400);
}
