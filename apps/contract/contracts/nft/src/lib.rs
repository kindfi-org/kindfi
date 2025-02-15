#![no_std]

mod errors;
mod events;
mod storage;
mod types;

use soroban_sdk::{
    contract, contractimpl, Address, Env, String, Vec,
};

use crate::{errors::NFTError, storage::NFTStorage, types::*, events::NFTEvents};

#[contract]
pub struct NFTContract;

#[contractimpl]
impl NFTContract {
    pub fn initialize(env: Env, admin: Address) -> Result<(), NFTError> {
        if env.storage().instance().has(&ADMIN_KEY) {
            return Err(NFTError::AlreadyInitialized);
        }
        NFTStorage::set_admin(&env, &admin);
        env.storage().instance().set(&COUNTER_KEY, &0u32);
        Ok(())
    }

    pub fn mint(
        env: Env,
        to: Address,
        name: String,
        description: String,
        attributes: Vec<String>,
    ) -> Result<(), NFTError> {
        // Verify admin access
        let admin = NFTStorage::get_admin(&env);
        admin.require_auth();

        // Get and increment token counter
        let token_id: u32 = env.storage().instance().get(&COUNTER_KEY).unwrap();
        env.storage().instance().set(&COUNTER_KEY, &(token_id + 1));

        // Create metadata
        let metadata = NFTMetadata {
            name,
            description,
            attributes,
        };

        // Store token data
        NFTStorage::set_token_owner(&env, &token_id, &to);
        NFTStorage::set_token_metadata(&env, &token_id, &metadata);
        
        // Increment balance
        NFTStorage::increment_balance(&env, &to);

        // Emit mint event
        NFTEvents::mint(&env, &to, token_id);

        Ok(())
    }

    pub fn transfer(
        env: Env,
        from: Address,
        to: Address,
        token_id: u32,
    ) -> Result<(), NFTError> {
        // Verify ownership
        let token_owner = NFTStorage::get_token_owner(&env, &token_id)
            .ok_or(NFTError::TokenNotFound)?;
        
        if token_owner != from {
            return Err(NFTError::NotTokenOwner);
        }

        // Verify authorization
        from.require_auth();

        // Update token ownership
        NFTStorage::set_token_owner(&env, &token_id, &to);
        
        // Update balances
        NFTStorage::decrement_balance(&env, &from);
        NFTStorage::increment_balance(&env, &to);

        // Emit transfer event
        NFTEvents::transfer(&env, &from, &to, token_id);

        Ok(())
    }

    pub fn token_metadata(env: Env, token_id: u32) -> NFTDetail {
        let owner = NFTStorage::get_token_owner(&env, &token_id)
            .unwrap_or_else(|| panic!("Token not found"));

        let metadata = NFTStorage::get_token_metadata(&env, &token_id)
            .unwrap_or_else(|| panic!("Metadata not found"));

        NFTDetail { owner, metadata }
    }
}

#[cfg(test)]
mod test;
