use soroban_sdk::{symbol_short, Address, Env, Symbol};
use crate::types::TierLevel;

pub struct ReputationEvents;

impl ReputationEvents {
    // Event topics
    const CONTRACT_INITIALIZED: Symbol = symbol_short!("init");
    const SCORE_UPDATED: Symbol = symbol_short!("score_upd");
    const TIER_CHANGED: Symbol = symbol_short!("tier_chg");
    const TIER_THRESHOLD_UPDATED: Symbol = symbol_short!("tier_thrs");
    const ADMIN_CHANGED: Symbol = symbol_short!("admin_chg");
    const NFT_CONTRACT_UPDATED: Symbol = symbol_short!("nft_upd");

    pub fn contract_initialized(env: &Env, admin: &Address, nft_contract_id: &Address) {
        let topics = (Self::CONTRACT_INITIALIZED, admin);
        env.events().publish(topics, nft_contract_id);
    }

    pub fn score_updated(env: &Env, user: &Address, old_score: u32, new_score: u32, streak: u32) {
        let topics = (Self::SCORE_UPDATED, user);
        let data = (old_score, new_score, streak);
        env.events().publish(topics, data);
    }

    pub fn tier_changed(env: &Env, user: &Address, old_tier: &TierLevel, new_tier: &TierLevel) {
        let topics = (Self::TIER_CHANGED, user);
        let data = (old_tier.clone(), new_tier.clone());
        env.events().publish(topics, data);
    }

    pub fn tier_threshold_updated(env: &Env, tier: &TierLevel, old_threshold: u32, new_threshold: u32) {
        let topics = (Self::TIER_THRESHOLD_UPDATED, tier.clone());
        let data = (old_threshold, new_threshold);
        env.events().publish(topics, data);
    }

    pub fn admin_changed(env: &Env, old_admin: &Address, new_admin: &Address) {
        let topics = (Self::ADMIN_CHANGED,);
        let data = (old_admin, new_admin);
        env.events().publish(topics, data);
    }

    pub fn nft_contract_updated(env: &Env, old_contract: &Address, new_contract: &Address) {
        let topics = (Self::NFT_CONTRACT_UPDATED,);
        let data = (old_contract, new_contract);
        env.events().publish(topics, data);
    }
}
