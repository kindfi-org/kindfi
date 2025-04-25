#![no_std]

mod errors;
mod events;
mod storage;
mod types;

use soroban_sdk::{
    contract, contractimpl, Address, Env,
};

use crate::{errors::ReputationError, storage::ReputationStorage, types::*, events::ReputationEvents};


#[contract]
pub struct ReputationContract;

#[contractimpl]
impl ReputationContract {

    pub fn initialize(env: Env, admin: Address, nft_contract_id: Address) -> Result<(), ReputationError> {
        if env.storage().instance().has(&ADMIN_KEY) {
            return Err(ReputationError::AlreadyInitialized);
        }
        
        ReputationStorage::set_admin(&env, &admin);
        ReputationStorage::set_nft_contract_id(&env, &nft_contract_id);
        
        // Initialize tier thresholds with default values
        ReputationStorage::set_tier_threshold(&env, &TierLevel::Bronze, &100);
        ReputationStorage::set_tier_threshold(&env, &TierLevel::Silver, &500);
        ReputationStorage::set_tier_threshold(&env, &TierLevel::Gold, &1000);
        ReputationStorage::set_tier_threshold(&env, &TierLevel::Platinum, &5000);
        
        ReputationEvents::contract_initialized(&env, &admin, &nft_contract_id);
        
        Ok(())
    }
    

    pub fn update_score(env: Env, user_id: Address, points: u32, streak: u32) -> Result<(), ReputationError> {
        // Verify admin access
        let admin = ReputationStorage::get_admin(&env);
        admin.require_auth();
        
        // Get current score and update
        let current_score = ReputationStorage::get_score(&env, &user_id).unwrap_or(0);
        let new_score = current_score + points;
        
        // Store updated values
        ReputationStorage::set_score(&env, &user_id, &new_score);
        ReputationStorage::set_streak(&env, &user_id, &streak);
        
        // Check and update tier if necessary
        let current_tier = Self::get_user_tier(env.clone(), user_id.clone())?;
        let potential_new_tier = Self::calculate_tier_from_score(env.clone(), new_score)?;
        
        if current_tier != potential_new_tier {
            ReputationStorage::set_user_tier(&env, &user_id, &potential_new_tier);
            ReputationEvents::tier_changed(&env, &user_id, &current_tier, &potential_new_tier);
        }
        
        // Emit score updated event
        ReputationEvents::score_updated(&env, &user_id, current_score, new_score, streak);
        
        Ok(())
    }
    

    pub fn get_score(env: Env, user_id: Address) -> Result<u32, ReputationError> {
        ReputationStorage::get_score(&env, &user_id)
            .ok_or(ReputationError::UserNotFound)
    }
    

    pub fn get_streak(env: Env, user_id: Address) -> Result<u32, ReputationError> {
        ReputationStorage::get_streak(&env, &user_id)
            .ok_or(ReputationError::UserNotFound)
    }
    

    pub fn get_user_tier(env: Env, user_id: Address) -> Result<TierLevel, ReputationError> {
        let tier = ReputationStorage::get_user_tier(&env, &user_id)
            .unwrap_or_else(|| {
                // If not explicitly set, calculate based on score
                let score = ReputationStorage::get_score(&env, &user_id).unwrap_or(0);
                match Self::calculate_tier_from_score(env.clone(), score) {
                    Ok(tier) => tier,
                    Err(_) => TierLevel::None,
                }
            });
            
        if tier == TierLevel::None && !ReputationStorage::get_score(&env, &user_id).is_some() {
            return Err(ReputationError::UserNotFound);
        }
        
        Ok(tier)
    }
    

    pub fn get_tier_threshold(env: Env, tier: TierLevel) -> Result<u32, ReputationError> {
        ReputationStorage::get_tier_threshold(&env, &tier)
            .ok_or(ReputationError::InvalidTier)
    }
    

    pub fn set_tier_threshold(env: Env, tier: TierLevel, threshold: u32) -> Result<(), ReputationError> {
        // Verify admin access
        let admin = ReputationStorage::get_admin(&env);
        admin.require_auth();
        
        if tier == TierLevel::None {
            return Err(ReputationError::InvalidTier);
        }
        
        // Update threshold
        let old_threshold = ReputationStorage::get_tier_threshold(&env, &tier)
            .ok_or(ReputationError::InvalidTier)?;
            
        ReputationStorage::set_tier_threshold(&env, &tier, &threshold);
        
        // Emit event
        ReputationEvents::tier_threshold_updated(&env, &tier, old_threshold, threshold);
        
        Ok(())
    }
    
    pub fn add_admin(env: Env, new_admin: Address) -> Result<(), ReputationError> {
        // Verify admin access
        let admin = ReputationStorage::get_admin(&env);
        admin.require_auth();
        
        // Update admin
        ReputationStorage::set_admin(&env, &new_admin);
        
        // Emit event
        ReputationEvents::admin_changed(&env, &admin, &new_admin);
        
        Ok(())
    }
    

    pub fn update_nft_contract(env: Env, new_contract_id: Address) -> Result<(), ReputationError> {
        // Verify admin access
        let admin = ReputationStorage::get_admin(&env);
        admin.require_auth();
        
        // Get current contract ID
        let current_contract_id = ReputationStorage::get_nft_contract_id(&env)
            .ok_or(ReputationError::ContractNotInitialized)?;
            
        // Update contract ID
        ReputationStorage::set_nft_contract_id(&env, &new_contract_id);
        
        // Emit event
        ReputationEvents::nft_contract_updated(&env, &current_contract_id, &new_contract_id);
        
        Ok(())
    }
    
    fn calculate_tier_from_score(env: Env, score: u32) -> Result<TierLevel, ReputationError> {
        let platinum_threshold = ReputationStorage::get_tier_threshold(&env, &TierLevel::Platinum)
            .ok_or(ReputationError::ContractNotInitialized)?;
        let gold_threshold = ReputationStorage::get_tier_threshold(&env, &TierLevel::Gold)
            .ok_or(ReputationError::ContractNotInitialized)?;
        let silver_threshold = ReputationStorage::get_tier_threshold(&env, &TierLevel::Silver)
            .ok_or(ReputationError::ContractNotInitialized)?;
        let bronze_threshold = ReputationStorage::get_tier_threshold(&env, &TierLevel::Bronze)
            .ok_or(ReputationError::ContractNotInitialized)?;
        
        if score >= platinum_threshold {
            Ok(TierLevel::Platinum)
        } else if score >= gold_threshold {
            Ok(TierLevel::Gold)
        } else if score >= silver_threshold {
            Ok(TierLevel::Silver)
        } else if score >= bronze_threshold {
            Ok(TierLevel::Bronze)
        } else {
            Ok(TierLevel::None)
        }
    }
}

#[cfg(test)]
mod test;
