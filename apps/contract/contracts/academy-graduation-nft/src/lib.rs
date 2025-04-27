#![no_std]
use soroban_sdk::{Address, Env, contract, contractimpl, panic_with_error};

mod datatype;
mod distribution;
mod interface;
mod metadata;
mod mint;
mod test;

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

use datatype::{DataKeys, GraduationNFT, NFTError};
use interface::{DistributionOperations, MintingOperations, QueryOperations};

/// @title AcademyGraduationNFT
/// @notice A contract for minting and managing non-transferable NFT badges
/// awarded to users for completing KindFi Academy modules.
#[contract]
pub struct AcademyGraduationNFT;

#[contractimpl]
impl AcademyGraduationNFT {
    /// @notice Initializes the contract with tracker addresses
    /// @param env The contract environment
    /// @param progress_tracker The address of the progress tracker contract
    /// @param badge_tracker The address of the badge tracker contract
    /// @return Result indicating success or initialization error
    pub fn initialize(
        env: Env,
        progress_tracker: Address,
        badge_tracker: Address,
    ) -> Result<(), NFTError> {
        if env.storage().persistent().has(&DataKeys::ProgressTracker) {
            return Err(NFTError::AlreadyInitialized); // This is now a proper error return
        }

        env.storage()
            .persistent()
            .set(&DataKeys::ProgressTracker, &progress_tracker);
        env.storage()
            .persistent()
            .set(&DataKeys::BadgeTracker, &badge_tracker);

        Ok(()) // Return Ok to indicate success
    }

    /// @notice Mints a graduation NFT for a user
    /// @param env The contract environment
    /// @param user The address of the user
    /// @return Result indicating success or minting error
    pub fn mint_graduation_nft(env: Env, user: Address) -> Result<(), NFTError> {
        <Self as MintingOperations>::mint_graduation_nft(&env, user)
    }

    /// @notice Retrieves a user's graduation NFT
    /// @param env The contract environment
    /// @param user The address of the user
    /// @return The NFT details or None if not found
    pub fn get_graduation_nft(env: Env, user: Address) -> Option<GraduationNFT> {
        <Self as QueryOperations>::get_graduation_nft(&env, user)
    }

    /// @notice Checks if a user has a graduation NFT
    /// @param env The contract environment
    /// @param user The address of the user
    /// @return True if the user has an NFT, false otherwise
    pub fn has_graduation_nft(env: Env, user: Address) -> bool {
        <Self as QueryOperations>::has_graduation_nft(&env, user)
    }

    /// @notice Attempts to transfer an NFT (always fails)
    /// @param env The contract environment
    /// @param from The address of the sender
    /// @param to The address of the recipient
    /// @param token_id The unique identifier of the NFT
    /// @return Result indicating failure due to soulbound nature
    pub fn attempt_transfer(
        _env: Env,
        from: Address,
        to: Address,
        token_id: u128,
    ) -> Result<(), NFTError> {
        <Self as DistributionOperations>::attempt_transfer(from, to, token_id)
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
