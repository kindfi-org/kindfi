#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, panic_with_error, Address, Env, Map, Vec, Symbol,
};

mod errors;
mod events;

use crate::errors::Error;
use crate::events::{EligibilityVerifiedEventData, ACADEMY, VERIFIED};

/// Storage keys for the contract
#[contracttype]
#[derive(Clone)]
enum DataKey {
    ProgressTracker,
    GraduationNFT,
    BadgeTracker,
}

#[contract]
pub struct AcademyVerifier;

#[contractimpl]
impl AcademyVerifier {
    /// Initialize the contract with addresses to the other academy contracts
    pub fn init(
        env: Env, 
        progress_tracker: Address, 
        graduation_nft: Address, 
        badge_tracker: Address
    ) {
        // Prevent re-initialization
        if env.storage().instance().has(&DataKey::ProgressTracker) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }

        // Validate addresses
        if !env.crypto().verify_contract_auth(&progress_tracker) {
            panic_with_error!(&env, Error::InvalidContractAddress);
        }
        if !env.crypto().verify_contract_auth(&graduation_nft) {
            panic_with_error!(&env, Error::InvalidContractAddress);
        }
        if !env.crypto().verify_contract_auth(&badge_tracker) {
            panic_with_error!(&env, Error::InvalidContractAddress);
        }

        // Store the contract addresses
        env.storage().instance().set(&DataKey::ProgressTracker, &progress_tracker);
        env.storage().instance().set(&DataKey::GraduationNFT, &graduation_nft);
        env.storage().instance().set(&DataKey::BadgeTracker, &badge_tracker);
    }

    /// Checks if a user has completed all required chapters and lessons
    pub fn is_user_fully_certified(env: Env, user: Address) -> bool {
        // Validate input address
        if !env.crypto().verify_contract_auth(&user) {
            panic_with_error!(&env, Error::InvalidUserAddress);
        }

        // Get the progress tracker contract address
        let progress_tracker = env.storage().instance().get::<DataKey, Address>(&DataKey::ProgressTracker)
            .unwrap_or_else(|| panic_with_error!(&env, Error::ContractNotInitialized));

        // Call into the progress tracker contract to get user progress
        let progress: Map<u32, u32> = env.invoke_contract(
            &progress_tracker,
            &Symbol::new(&env, "get_user_progress"),
            &Vec::from_array(&env, [user.into_val(&env)]),
        );

        // Check if the user has completed all required chapters
        // We consider certification complete if user has made progress in all chapters
        // Additional logic could be added here based on specific requirements
        !progress.is_empty() && progress.values().all(|lesson_count| lesson_count > 0)
    }

    /// Retrieves the user's progress as a map of chapter IDs to lesson counts
    pub fn get_user_progress(env: Env, user: Address) -> Map<u32, u32> {
        // Validate input address
        if !env.crypto().verify_contract_auth(&user) {
            panic_with_error!(&env, Error::InvalidUserAddress);
        }

        // Get the progress tracker contract address
        let progress_tracker = env.storage().instance().get::<DataKey, Address>(&DataKey::ProgressTracker)
            .unwrap_or_else(|| panic_with_error!(&env, Error::ContractNotInitialized));

        // Call into the progress tracker contract to get user progress
        env.invoke_contract(
            &progress_tracker,
            &Symbol::new(&env, "get_user_progress"),
            &Vec::from_array(&env, [user.into_val(&env)]),
        )
    }

    /// Checks if the user owns a valid graduation NFT
    pub fn has_graduation_nft(env: Env, user: Address) -> bool {
        // Validate input address
        if !env.crypto().verify_contract_auth(&user) {
            panic_with_error!(&env, Error::InvalidUserAddress);
        }

        // Get the graduation NFT contract address
        let graduation_nft = env.storage().instance().get::<DataKey, Address>(&DataKey::GraduationNFT)
            .unwrap_or_else(|| panic_with_error!(&env, Error::ContractNotInitialized));

        // Call into the graduation NFT contract to check ownership
        env.invoke_contract(
            &graduation_nft,
            &Symbol::new(&env, "has_graduation_nft"),
            &Vec::from_array(&env, [user.into_val(&env)]),
        )
    }

    /// Lists the badges earned by the user
    pub fn get_user_badges(env: Env, user: Address) -> Vec<Symbol> {
        // Validate input address
        if !env.crypto().verify_contract_auth(&user) {
            panic_with_error!(&env, Error::InvalidUserAddress);
        }

        // Get the badge tracker contract address
        let badge_tracker = env.storage().instance().get::<DataKey, Address>(&DataKey::BadgeTracker)
            .unwrap_or_else(|| panic_with_error!(&env, Error::ContractNotInitialized));

        // Call into the badge tracker contract to get badges
        env.invoke_contract(
            &badge_tracker,
            &Symbol::new(&env, "get_user_badges"),
            &Vec::from_array(&env, [user.into_val(&env)]),
        )
    }

    /// Returns a unified eligibility status for the user
    pub fn is_user_eligible(env: Env, user: Address) -> bool {
        // Validate input address
        if !env.crypto().verify_contract_auth(&user) {
            panic_with_error!(&env, Error::InvalidUserAddress);
        }

        // Check both certification and NFT ownership
        let is_certified = Self::is_user_fully_certified(env.clone(), user.clone());
        let has_nft = Self::has_graduation_nft(env.clone(), user.clone());
        
        // Publish event for this verification
        let eligible = is_certified && has_nft;
        env.events().publish(
            (ACADEMY, VERIFIED),
            EligibilityVerifiedEventData {
                user: user.clone(),
                eligible,
                is_certified,
                has_nft,
            },
        );
        
        eligible
    }

    /// Update the progress tracker contract address
    pub fn update_progress_tracker(env: Env, new_address: Address) {
        // Only allow the contract itself to update addresses
        env.current_contract_address().require_auth();
        
        // Validate the new address
        if !env.crypto().verify_contract_auth(&new_address) {
            panic_with_error!(&env, Error::InvalidContractAddress);
        }
        
        env.storage().instance().set(&DataKey::ProgressTracker, &new_address);
    }

    /// Update the graduation NFT contract address
    pub fn update_graduation_nft(env: Env, new_address: Address) {
        // Only allow the contract itself to update addresses
        env.current_contract_address().require_auth();
        
        // Validate the new address
        if !env.crypto().verify_contract_auth(&new_address) {
            panic_with_error!(&env, Error::InvalidContractAddress);
        }
        
        env.storage().instance().set(&DataKey::GraduationNFT, &new_address);
    }

    /// Update the badge tracker contract address
    pub fn update_badge_tracker(env: Env, new_address: Address) {
        // Only allow the contract itself to update addresses
        env.current_contract_address().require_auth();
        
        // Validate the new address
        if !env.crypto().verify_contract_auth(&new_address) {
            panic_with_error!(&env, Error::InvalidContractAddress);
        }
        
        env.storage().instance().set(&DataKey::BadgeTracker, &new_address);
    }
}

#[cfg(test)]
mod test;