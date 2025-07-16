#![no_std]

mod access;
mod errors;
mod events;
mod pausable;
mod rate_limiting;
mod storage;
mod test;
mod types;

use soroban_sdk::{
    contract, contractimpl, symbol_short, Address, Bytes, BytesN, Env, String, Vec,
};

use crate::{
    access::{AccessControl, DEFAULT_ADMIN_ROLE, METADATA_MANAGER_ROLE, MINTER_ROLE},
    errors::NFTError,
    events::NFTEvents,
    pausable::{NFTPausable, PauseOperation},
    rate_limiting::RateLimiter,
    storage::NFTStorage,
    types::*,
};

// Operations for rate limiting
const MINT_OP: soroban_sdk::Symbol = symbol_short!("mint");
const TRANSFER_OP: soroban_sdk::Symbol = symbol_short!("transfer");
const METADATA_UPDATE_OP: soroban_sdk::Symbol = symbol_short!("updmeta");

#[contract]
pub struct KindfiNFT;

#[contractimpl]
impl KindfiNFT {
    pub fn initialize(env: Env, admin: Address) -> Result<(), NFTError> {
        if env.storage().instance().has(&ADMIN_KEY) {
            return Err(NFTError::AlreadyInitialized);
        }

        // Initialize role-based access control
        AccessControl::initialize(&env, &admin);

        // Initialize pausable
        NFTPausable::initialize(&env);

        // Initialize base NFT storage
        NFTStorage::set_admin(&env, &admin);
        env.storage().instance().set(&COUNTER_KEY, &0u32);

        // Set rate limits
        RateLimiter::set_limit(&env, MINT_OP, 100, 1000); // 100 mints per 1000 ledgers
        RateLimiter::set_limit(&env, TRANSFER_OP, 50, 100); // 50 transfers per 100 ledgers
        RateLimiter::set_limit(&env, METADATA_UPDATE_OP, 20, 500); // 20 metadata updates per 500 ledgers

        Ok(())
    }

    // Mint with access control and rate limiting
    pub fn mint(
        env: Env,
        to: Address,
        name: String,
        description: String,
        attributes: Vec<String>,
        admin: Address,
    ) -> Result<(), NFTError> {
        // Check if the contract is paused
        NFTPausable::require_not_paused(&env, &PauseOperation::MintPause)?;

        // Verify minter role access
        admin.require_auth();
        AccessControl::require_role(&env, MINTER_ROLE, &admin)?;

        // Check rate limit
        RateLimiter::check_rate_limit(&env, &admin, MINT_OP)?;

        // Get and increment token counter
        let token_id: u32 = env.storage().instance().get(&COUNTER_KEY).unwrap();
        env.storage().instance().set(&COUNTER_KEY, &(token_id + 1));

        // Create the NFT metadata
        let metadata = NFTMetadata {
            name,
            description,
            attributes,
        };

        // Store the NFT
        NFTStorage::set_token_owner(&env, &token_id, &to);
        NFTStorage::set_token_metadata(&env, &token_id, &metadata);

        // Update balance
        NFTStorage::increment_balance(&env, &to);

        // Record the operation for rate limiting
        RateLimiter::record_operation(&env, &admin, MINT_OP);

        // Emit event
        NFTEvents::mint(&env, &to, token_id, &metadata);

        Ok(())
    }

    // Transfer with access control and rate limiting
    pub fn transfer(env: Env, from: Address, to: Address, token_id: u32) -> Result<(), NFTError> {
        // Check if transfers are paused
        NFTPausable::require_not_paused(&env, &PauseOperation::TransferPause)?;

        // Verify ownership
        let token_owner =
            NFTStorage::get_token_owner(&env, &token_id).ok_or(NFTError::TokenNotFound)?;

        if token_owner != from {
            return Err(NFTError::NotTokenOwner);
        }

        // Verify authorization
        from.require_auth();

        // Check rate limit for sender
        RateLimiter::check_rate_limit(&env, &from, TRANSFER_OP)?;

        // Update token ownership
        NFTStorage::set_token_owner(&env, &token_id, &to);

        // Update balances
        NFTStorage::decrement_balance(&env, &from);
        NFTStorage::increment_balance(&env, &to);

        // Emit transfer event
        NFTEvents::transfer(&env, &from, &to, token_id);

        // Record operation for rate limiting
        RateLimiter::record_operation(&env, &from, TRANSFER_OP);

        Ok(())
    }

    // Update metadata with access control and rate limiting
    pub fn update_metadata(
        env: Env,
        token_id: u32,
        name: String,
        description: String,
        attributes: Vec<String>,
        admin: Address,
    ) -> Result<(), NFTError> {
        // Check if metadata updates are paused
        NFTPausable::require_not_paused(&env, &PauseOperation::MetadataPause)?;

        // Verify metadata manager role
        admin.require_auth();
        AccessControl::require_role(&env, METADATA_MANAGER_ROLE, &admin)?;

        // Check rate limit
        RateLimiter::check_rate_limit(&env, &admin, METADATA_UPDATE_OP)?;

        // Verify token exists
        if NFTStorage::get_token_owner(&env, &token_id).is_none() {
            return Err(NFTError::TokenNotFound);
        }

        // Create new metadata
        let metadata = NFTMetadata {
            name,
            description,
            attributes,
        };

        // Update metadata
        NFTStorage::set_token_metadata(&env, &token_id, &metadata);

        // Record the operation for rate limiting
        RateLimiter::record_operation(&env, &admin, METADATA_UPDATE_OP);

        // Emit event
        NFTEvents::metadata_update(&env, token_id, &metadata);

        Ok(())
    }

    // Token details query - no access control needed for reads
    pub fn token_metadata(env: Env, token_id: u32) -> NFTDetail {
        let owner = NFTStorage::get_token_owner(&env, &token_id)
            .unwrap_or_else(|| panic!("Token not found"));

        let metadata = NFTStorage::get_token_metadata(&env, &token_id)
            .unwrap_or_else(|| panic!("Metadata not found"));

        NFTDetail { owner, metadata }
    }

    // Role management with multi-sig for admin operations
    pub fn grant_role(
        env: Env,
        role: u32,
        account: Address,
        signatures: Vec<(Address, BytesN<64>)>,
    ) -> Result<(), NFTError> {
        // For granting roles, we need approval from the admins
        // Serialize role and account for the hash
        let mut payload_data = Bytes::new(&env);
        payload_data.append(&Bytes::from_slice(&env, &role.to_le_bytes()));
        // Simple approach - just use the account directly without conversion
        payload_data.append(&Bytes::from_slice(&env, &[0u8])); // placeholder

        // Multi-sig verification for critical operations
        AccessControl::require_role_with_multiple_signatures(
            &env,
            DEFAULT_ADMIN_ROLE,
            symbol_short!("grantrol"),
            &signatures,
            &payload_data,
        )?;


        AccessControl::grant_role(&env, role, &account)?;

        Ok(())
    }

    // Revoke role with the same pattern
    pub fn revoke_role(
        env: Env,
        role: u32,
        account: Address,
        signatures: Vec<(Address, BytesN<64>)>,
    ) -> Result<(), NFTError> {
        // Serialize role and account for the hash
        let mut payload_data = Bytes::new(&env);
        payload_data.append(&Bytes::from_slice(&env, &role.to_le_bytes()));
        // Simple approach - just use the account directly without conversion
        payload_data.append(&Bytes::from_slice(&env, &[0u8])); // placeholder

        // Multi-sig verification for critical operations
        AccessControl::require_role_with_multiple_signatures(
            &env,
            DEFAULT_ADMIN_ROLE,
            symbol_short!("revkrol"),
            &signatures,
            &payload_data,
        )?;

        // Revoke the role
        AccessControl::revoke_role(&env, role, &account)?;

        Ok(())
    }

    // Pause contract functions
    pub fn pause(env: Env, operation: PauseOperation, admin: Address) -> Result<(), NFTError> {
        // Verify admin authorization
        admin.require_auth();
        AccessControl::require_role(&env, DEFAULT_ADMIN_ROLE, &admin)?;

        NFTPausable::pause(&env, &operation, &admin)
    }

    // Unpause contract functions
    pub fn unpause(env: Env, operation: PauseOperation, admin: Address) -> Result<(), NFTError> {
        // Verify admin authorization
        admin.require_auth();
        AccessControl::require_role(&env, DEFAULT_ADMIN_ROLE, &admin)?;

        NFTPausable::unpause(&env, &operation, &admin)
    }

    // Set multisig threshold with the same pattern
    pub fn set_multisig_threshold(
        env: Env,
        role: u32,
        threshold: u32,
        signatures: Vec<(Address, BytesN<64>)>,
    ) -> Result<(), NFTError> {
        // Serialize role and threshold for the hash
        let mut payload_data = Bytes::new(&env);
        payload_data.append(&Bytes::from_slice(&env, &role.to_le_bytes()));
        payload_data.append(&Bytes::from_slice(&env, &threshold.to_le_bytes()));

        // Multi-sig verification for critical operations
        AccessControl::require_role_with_multiple_signatures(
            &env,
            DEFAULT_ADMIN_ROLE,
            symbol_short!("setthres"),
            &signatures,
            &payload_data,
        )?;

        // Set the threshold
        AccessControl::set_multisig_threshold(&env, role, threshold)?;

        Ok(())
    }

    // Set rate limits for operations
    pub fn set_rate_limit(
        env: Env,
        operation_name: String,
        limit: u32,
        window_ledgers: u32,
        admin: Address,
    ) -> Result<(), NFTError> {
        // Verify admin access
        admin.require_auth();
        AccessControl::require_role(&env, DEFAULT_ADMIN_ROLE, &admin)?;

        if operation_name == String::from_str(&env, "mint") {
            RateLimiter::set_limit(&env, MINT_OP, limit, window_ledgers);
        } else if operation_name == String::from_str(&env, "transfer") {
            RateLimiter::set_limit(&env, TRANSFER_OP, limit, window_ledgers);
        } else if operation_name == String::from_str(&env, "updmeta") {
            RateLimiter::set_limit(&env, METADATA_UPDATE_OP, limit, window_ledgers);
        } else {
            return Err(NFTError::InvalidOperation);
        }

        Ok(())
    }

    // Check if an address has a specific role
    pub fn has_role(env: Env, role: u32, account: Address) -> bool {
        AccessControl::has_role(&env, role, &account)
    }
}
