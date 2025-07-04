use crate::types::{DataKey, TierLevel, ADMIN_KEY, NFT_CONTRACT_KEY};
use soroban_sdk::{Address, Env};

pub struct ReputationStorage;

impl ReputationStorage {
    pub fn set_admin(env: &Env, admin: &Address) {
        env.storage().instance().set(&ADMIN_KEY, admin);
    }

    pub fn get_admin(env: &Env) -> Option<Address> {
        env.storage().instance().get(&ADMIN_KEY)
    }

    pub fn set_nft_contract_id(env: &Env, contract_id: &Address) {
        env.storage().instance().set(&NFT_CONTRACT_KEY, contract_id);
    }

    pub fn get_nft_contract_id(env: &Env) -> Option<Address> {
        env.storage().instance().get(&NFT_CONTRACT_KEY)
    }

    pub fn set_score(env: &Env, user: &Address, score: &u32) {
        let key = DataKey::UserScore(user.clone());
        env.storage().persistent().set(&key, score);
    }

    pub fn get_score(env: &Env, user: &Address) -> Option<u32> {
        let key = DataKey::UserScore(user.clone());
        env.storage().persistent().get(&key)
    }

    pub fn set_streak(env: &Env, user: &Address, streak: &u32) {
        let key = DataKey::UserStreak(user.clone());
        env.storage().persistent().set(&key, streak);
    }

    pub fn get_streak(env: &Env, user: &Address) -> Option<u32> {
        let key = DataKey::UserStreak(user.clone());
        env.storage().persistent().get(&key)
    }

    pub fn set_user_tier(env: &Env, user: &Address, tier: &TierLevel) {
        let key = DataKey::UserTier(user.clone());
        env.storage().persistent().set(&key, tier);
    }

    pub fn get_user_tier(env: &Env, user: &Address) -> Option<TierLevel> {
        let key = DataKey::UserTier(user.clone());
        env.storage().persistent().get(&key)
    }

    pub fn set_tier_threshold(env: &Env, tier: &TierLevel, threshold: &u32) {
        let key = DataKey::TierThreshold(tier.clone());
        env.storage().persistent().set(&key, threshold);
    }

    pub fn get_tier_threshold(env: &Env, tier: &TierLevel) -> Option<u32> {
        let key = DataKey::TierThreshold(tier.clone());
        env.storage().persistent().get(&key)
    }
    
}
