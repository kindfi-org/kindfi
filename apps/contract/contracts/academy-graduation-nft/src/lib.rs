#![no_std]
use soroban_sdk::{Address, Env, contract, contractimpl};

mod admin;
mod datatype;
mod distribution;
mod interface;
mod metadata;
mod mint;
mod test;

// Re-export main types for easier access
pub use datatype::{GraduationNFT, NFTMetadata, NFTError, DataKeys};
use admin::{check_admin, initialize_admin, set_admin, set_paused, is_paused};

mod progresstracker {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32-unknown-unknown/release/mock_progress_tracker.wasm"
    );
}
mod badgetracker {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32-unknown-unknown/release/mock_badge_tracker.wasm"
    );
}

use interface::{DistributionOperations, MintingOperations, QueryOperations};

const MAX_BADGES: u32 = 100; // Maximum number of badges allowed

/// @title AcademyGraduationNFT
/// @notice A contract for minting and managing non-transferable NFT badges
/// awarded to users for completing KindFi Academy modules.
/// @dev These NFTs are soulbound (non-transferable) by design - any transfer  
/// attempts will be rejected. Each user can only mint one graduation NFT.
#[contract]
pub struct AcademyGraduationNFT;

#[contractimpl]
impl AcademyGraduationNFT {
    /// @notice Initializes the contract with tracker addresses and admin
    pub fn initialize(
        env: Env,
        admin: Address,
        progress_tracker: Address,
        badge_tracker: Address,
    ) -> Result<(), NFTError> {
        // Validate addresses
        let this_contract = env.current_contract_address();
        if progress_tracker == this_contract ||
           badge_tracker == this_contract {
            return Err(NFTError::InvalidInput);
        }

        // Initialize admin first
        initialize_admin(&env, admin)?;

        // Set contract dependencies
        env.storage().persistent().set(&DataKeys::ProgressTracker, &progress_tracker);
        env.storage().persistent().set(&DataKeys::BadgeTracker, &badge_tracker);
        env.storage().persistent().set(&DataKeys::MaxBadges, &MAX_BADGES);

        // Emit initialization event
        env.events().publish(("init", "contract"), 
            (progress_tracker, badge_tracker));

        Ok(())
    }

    /// @notice Updates the contract admin
    pub fn update_admin(env: Env, new_admin: Address) -> Result<(), NFTError> {
        set_admin(&env, new_admin)
    }

    /// @notice Pauses or unpauses the contract
    pub fn set_contract_pause(env: Env, paused: bool) -> Result<(), NFTError> {
        set_paused(&env, paused)
    }

    /// @notice Mints a graduation NFT for a user
    pub fn mint_graduation_nft(env: Env, user: Address) -> Result<GraduationNFT, NFTError> {
        if is_paused(&env) {
            return Err(NFTError::Paused);
        }
        
        user.require_auth();
        <Self as MintingOperations>::mint_graduation_nft(&env, user)
    }

    /// @notice Retrieves a user's graduation NFT
    pub fn get_graduation_nft(env: Env, user: Address) -> Option<GraduationNFT> {
        <Self as QueryOperations>::get_graduation_nft(&env, user)
    }

    /// @notice Checks if a user has a graduation NFT
    pub fn has_graduation_nft(env: Env, user: Address) -> bool {
        <Self as QueryOperations>::has_graduation_nft(&env, user)
    }

    /// @notice Attempts to transfer an NFT (always fails)
    pub fn attempt_transfer(
        _env: Env,
        from: Address,
        to: Address,
        token_id: u128,
    ) -> Result<(), NFTError> {
        <Self as DistributionOperations>::attempt_transfer(from, to, token_id)
    }

    /// @notice Updates the maximum allowed badges
    pub fn update_max_badges(env: Env, new_max: u32) -> Result<(), NFTError> {
        check_admin(&env)?;
        if new_max == 0 {
            return Err(NFTError::InvalidInput);
        }
        env.storage().persistent().set(&DataKeys::MaxBadges, &new_max);
        env.events().publish(("max_badges", "update"), new_max);
        Ok(())
    }
}

impl QueryOperations for AcademyGraduationNFT {
    fn get_graduation_nft(env: &Env, user: Address) -> Option<GraduationNFT> {
        env.storage()
            .persistent()
            .get(&DataKeys::GraduationNFT(user))
    }

    fn has_graduation_nft(env: &Env, user: Address) -> bool {
        env.storage()
            .persistent()
            .has(&DataKeys::GraduationNFT(user))
    }
}
