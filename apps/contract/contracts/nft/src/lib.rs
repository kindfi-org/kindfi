#![no_std]

mod errors;
mod events;
mod storage;
mod types;
mod access;
mod rate_limiting;
mod pausable;
mod distribution;
mod test;

use soroban_sdk::{
    contract, contractimpl, Address, Env, String, Vec,
    auth, symbol_short, xdr::Signature,
};
use stellar_pausable_macros::pausable_contract;

use crate::{
    access::{AccessControl, MINTER_ROLE, METADATA_MANAGER_ROLE, DEFAULT_ADMIN_ROLE},
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

#[pausable_contract]
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
    ) -> Result<(), NFTError> {
        // Check if minting is paused
        NFTPausable::require_not_paused(&env, &PauseOperation::MintPause)?;
        
        // Verify minter role access
        let invoker = auth::get_invoker(&env);
        AccessControl::require_role(&env, MINTER_ROLE, &invoker)?;
        
        // Check rate limit
        RateLimiter::check_rate_limit(&env, &invoker, MINT_OP)?;
        
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
        
        // Record operation for rate limiting
        RateLimiter::record_operation(&env, &invoker, MINT_OP);

        Ok(())
    }
    
    // Transfer with access control and rate limiting
    pub fn transfer(
        env: Env,
        from: Address,
        to: Address,
        token_id: u32,
    ) -> Result<(), NFTError> {
        // Check if transfers are paused
        NFTPausable::require_not_paused(&env, &PauseOperation::TransferPause)?;
        
        // Verify ownership
        let token_owner = NFTStorage::get_token_owner(&env, &token_id)
            .ok_or(NFTError::TokenNotFound)?;
        
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
    ) -> Result<(), NFTError> {
        // Check if metadata updates are paused
        NFTPausable::require_not_paused(&env, &PauseOperation::MetadataPause)?;
        
        // Verify metadata manager role
        let invoker = auth::get_invoker(&env);
        AccessControl::require_role(&env, METADATA_MANAGER_ROLE, &invoker)?;
        
        // Check rate limit
        RateLimiter::check_rate_limit(&env, &invoker, METADATA_UPDATE_OP)?;
        
        // Verify token exists
        if NFTStorage::get_token_owner(&env, &token_id).is_none() {
            return Err(NFTError::TokenNotFound);
        }
        
        // Create and update metadata
        let metadata = NFTMetadata {
            name,
            description,
            attributes,
        };
        
        NFTStorage::set_token_metadata(&env, &token_id, &metadata);
        
        // Record operation for rate limiting
        RateLimiter::record_operation(&env, &invoker, METADATA_UPDATE_OP);
        
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
        signatures: Vec<(Address, Signature)>
    ) -> Result<(), NFTError> {
        // Para granting roles, necesitamos aprobación de los administradores
        // Serializar manualmente role y account para el hash
        let mut payload_data = Vec::new(&env);
        payload_data.push_back(role);
        
        // Crear un payload para firmar
        let payload = env.crypto().sha256(&payload_data);
        
        // Multi-sig verificación para operaciones críticas
        AccessControl::require_role_with_multiple_signatures(
            &env,
            DEFAULT_ADMIN_ROLE,
            symbol_short!("grantrol"),
            &signatures,
            &payload
        )?;
        
        // Otorgar el rol
        AccessControl::grant_role(&env, role, &account)?;
        
        Ok(())
    }
    
    // Revoke role con el mismo patrón
    pub fn revoke_role(
        env: Env,
        role: u32,
        account: Address,
        signatures: Vec<(Address, Signature)>
    ) -> Result<(), NFTError> {
        // Serializar manualmente role y account para el hash
        let mut payload_data = Vec::new(&env);
        payload_data.push_back(role);
        
        // Crear un payload para firmar
        let payload = env.crypto().sha256(&payload_data);
        
        // Multi-sig verificación para operaciones críticas
        AccessControl::require_role_with_multiple_signatures(
            &env,
            DEFAULT_ADMIN_ROLE,
            symbol_short!("revkrol"),
            &signatures,
            &payload
        )?;
        
        // Revocar el rol
        AccessControl::revoke_role(&env, role, &account)?;
        
        Ok(())
    }
    
    // Pause contract functions
    pub fn pause(
        env: Env,
        operation: PauseOperation,
    ) -> Result<(), NFTError> {
        // Verify admin authorization
        let invoker = auth::get_invoker(&env);
        AccessControl::require_role(&env, DEFAULT_ADMIN_ROLE, &invoker)?;
        
        NFTPausable::pause(&env, &operation, &invoker)
    }
    
    // Unpause contract functions
    pub fn unpause(
        env: Env,
        operation: PauseOperation,
    ) -> Result<(), NFTError> {
        // Verify admin authorization
        let invoker = auth::get_invoker(&env);
        AccessControl::require_role(&env, DEFAULT_ADMIN_ROLE, &invoker)?;
        
        NFTPausable::unpause(&env, &operation, &invoker)
    }
    
    // Set multisig threshold con el mismo patrón
    pub fn set_multisig_threshold(
        env: Env,
        role: u32,
        threshold: u32,
        signatures: Vec<(Address, Signature)>
    ) -> Result<(), NFTError> {
        // Serializar manualmente role y account para el hash
        let mut payload_data = Vec::new(&env);
        payload_data.push_back(role);
        payload_data.push_back(threshold);
        
        // Crear un payload para firmar
        let payload = env.crypto().sha256(&payload_data);
        
        // Multi-sig verificación para operaciones críticas
        AccessControl::require_role_with_multiple_signatures(
            &env,
            DEFAULT_ADMIN_ROLE,
            symbol_short!("setthres"),
            &signatures,
            &payload
        )?;
        
        // Establecer el threshold
        AccessControl::set_multisig_threshold(&env, role, threshold)?;
        
        Ok(())
    }
    
    // Set rate limits for operations
    pub fn set_rate_limit(
        env: Env,
        operation_name: String,
        limit: u32,
        window_ledgers: u32,
    ) -> Result<(), NFTError> {
        // Verify admin access
        let invoker = auth::get_invoker(&env);
        AccessControl::require_role(&env, DEFAULT_ADMIN_ROLE, &invoker)?;
        
        // Convert string to symbol
        // NOTA: En lugar de usar symbol_short con string dinámico, necesitamos manejar operaciones conocidas
        if operation_name == "mint" {
            RateLimiter::set_limit(&env, MINT_OP, limit, window_ledgers);
        } else if operation_name == "transfer" {
            RateLimiter::set_limit(&env, TRANSFER_OP, limit, window_ledgers);
        } else if operation_name == "updmeta" {
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
