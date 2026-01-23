#![no_std]

mod burn;
mod errors;
mod events;
mod metadata;
mod mint;
mod types;

use soroban_sdk::{contract, contractimpl, panic_with_error, Address, Env, String, Symbol};
use stellar_access::access_control::{
    accept_admin_transfer as storage_accept_admin_transfer, get_admin as storage_get_admin,
    get_role_admin as storage_get_role_admin, get_role_member as storage_get_role_member,
    get_role_member_count as storage_get_role_member_count, grant_role as storage_grant_role,
    has_role as storage_has_role, renounce_admin as storage_renounce_admin,
    renounce_role as storage_renounce_role, revoke_role as storage_revoke_role, set_admin,
    set_role_admin as storage_set_role_admin,
    transfer_admin_role as storage_transfer_admin_role, AccessControl,
};
use stellar_macros::{has_role, only_role};
use stellar_tokens::non_fungible::{burnable::NonFungibleBurnable, Base, NonFungibleToken};

use crate::errors::Error;
use crate::events::{MetadataUpdatedEventData};
use crate::types::NFTMetadata;

// ============================================================================
// Constants
// ============================================================================

/// Number of ledgers in a day (assuming ~5 second block time)
const DAY_IN_LEDGERS: u32 = 17280;

/// TTL extension amount for instance storage (30 days)
const INSTANCE_TTL_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;

/// TTL threshold before extending (29 days)
const INSTANCE_TTL_THRESHOLD: u32 = INSTANCE_TTL_AMOUNT - DAY_IN_LEDGERS;

/// Role identifier for addresses that can mint NFTs.
pub const MINTER_ROLE: &str = "minter";

/// Role identifier for addresses that can burn NFTs.
pub const BURNER_ROLE: &str = "burner";

/// Role identifier for addresses that can update NFT metadata.
pub const METADATA_MANAGER_ROLE: &str = "metadata_manager";

// ============================================================================
// Contract
// ============================================================================

/// KindFi NFT Contract
///
/// A non-fungible token contract for the KindFi platform's reputation and
/// incentivization system. Built on OpenZeppelin Stellar Contracts.
///
/// Features:
/// - Sequential token ID minting starting from 0
/// - Custom on-chain metadata per token
/// - Role-based access control (minter, burner, metadata_manager)
/// - Standard NFT functionality (transfers, approvals)
/// - Automatic TTL extension for persistent storage
#[contract]
pub struct KindfiNFT;

#[contractimpl]
impl KindfiNFT {
    /// Initialize the KindFi NFT contract.
    ///
    /// # Arguments
    /// * `admin` - Address that will have admin privileges and can grant roles
    /// * `name` - Collection name (e.g., "KindFi NFT")
    /// * `symbol` - Collection symbol (e.g., "KFNFT")
    /// * `base_uri` - Base URI for token metadata (e.g., "https://api.kindfi.org/nft/")
    ///
    /// # Errors
    /// * `Error::AlreadyInitialized` - If the contract has already been initialized
    pub fn __constructor(e: &Env, admin: Address, name: String, symbol: String, base_uri: String) {
        // Check if already initialized by checking if admin is set
        if storage_get_admin(e).is_some() {
            panic_with_error!(e, Error::AlreadyInitialized);
        }

        // Set the admin for access control
        set_admin(e, &admin);

        // Set NFT collection metadata using OpenZeppelin Base
        Base::set_metadata(e, base_uri, name, symbol);

        // Extend instance storage TTL
        Self::extend_instance_ttl(e);
    }

    /// Mint a new NFT with custom metadata.
    ///
    /// Requires the "minter" role.
    ///
    /// # Arguments
    /// * `caller` - Address initiating the mint (must have minter role)
    /// * `to` - Address to receive the NFT
    /// * `nft_metadata` - Custom metadata for this NFT
    ///
    /// # Returns
    /// The token ID of the newly minted NFT (sequential, starting from 0)
    #[only_role(caller, "minter")]
    pub fn mint_with_metadata(
        e: &Env,
        caller: Address,
        to: Address,
        nft_metadata: NFTMetadata,
    ) -> u32 {
        Self::extend_instance_ttl(e);
        mint::mint_with_metadata(e, &to, &nft_metadata)
    }

    /// Update the metadata for an existing NFT.
    ///
    /// Requires the "metadata_manager" role.
    ///
    /// # Arguments
    /// * `caller` - Address initiating the update (must have metadata_manager role)
    /// * `token_id` - ID of the token to update
    /// * `nft_metadata` - New metadata for the NFT
    ///
    /// # Errors
    /// * `Error::Unauthorized` - If caller doesn't have metadata_manager role
    pub fn update_metadata(e: &Env, caller: Address, token_id: u32, nft_metadata: NFTMetadata) {
        // Verify caller has metadata_manager role (using full name with Symbol::new)
        let role = Symbol::new(e, METADATA_MANAGER_ROLE);
        if storage_has_role(e, &caller, &role).is_none() {
            panic_with_error!(e, Error::Unauthorized);
        }
        caller.require_auth();

        // Verify token exists by checking owner (will panic if not found)
        let _ = Base::owner_of(e, token_id);

        // Update metadata
        metadata::set_metadata(e, token_id, &nft_metadata);

        // Emit metadata updated event
        MetadataUpdatedEventData {
            token_id,
            metadata: nft_metadata,
        }.publish(e);

        Self::extend_instance_ttl(e);
    }

    /// Get the custom metadata for a specific token.
    ///
    /// # Arguments
    /// * `token_id` - ID of the token to query
    ///
    /// # Returns
    /// The metadata if found, None otherwise
    pub fn get_metadata(e: &Env, token_id: u32) -> Option<NFTMetadata> {
        metadata::get_metadata(e, token_id)
    }

    /// Get the total number of NFTs that have been minted.
    ///
    /// Note: This is the total minted count, not the current supply.
    /// Burned tokens are still counted in this total.
    ///
    /// # Returns
    /// The total number of tokens minted
    pub fn total_supply(e: &Env) -> u32 {
        mint::get_token_counter(e)
    }

    /// Get the metadata_manager role symbol.
    /// Helper function since the role name exceeds symbol_short! limit.
    pub fn metadata_manager_role(e: &Env) -> Symbol {
        Symbol::new(e, METADATA_MANAGER_ROLE)
    }

    /// Extend the TTL of instance storage.
    /// Called internally during state-changing operations.
    fn extend_instance_ttl(e: &Env) {
        e.storage()
            .instance()
            .extend_ttl(INSTANCE_TTL_THRESHOLD, INSTANCE_TTL_AMOUNT);
    }
}

/// Implementation of the NonFungibleToken trait using OpenZeppelin Base.
/// Provides standard NFT functionality: transfers, approvals, balance queries.
#[contractimpl]
impl NonFungibleToken for KindfiNFT {
    type ContractType = Base;

    fn balance(e: &Env, account: Address) -> u32 {
        Self::ContractType::balance(e, &account)
    }

    fn owner_of(e: &Env, token_id: u32) -> Address {
        Self::ContractType::owner_of(e, token_id)
    }

    fn transfer(e: &Env, from: Address, to: Address, token_id: u32) {
        Self::ContractType::transfer(e, &from, &to, token_id);
        KindfiNFT::extend_instance_ttl(e);
    }

    fn transfer_from(e: &Env, spender: Address, from: Address, to: Address, token_id: u32) {
        Self::ContractType::transfer_from(e, &spender, &from, &to, token_id);
        KindfiNFT::extend_instance_ttl(e);
    }

    fn approve(
        e: &Env,
        approver: Address,
        approved: Address,
        token_id: u32,
        live_until_ledger: u32,
    ) {
        Self::ContractType::approve(e, &approver, &approved, token_id, live_until_ledger);
        KindfiNFT::extend_instance_ttl(e);
    }

    fn approve_for_all(e: &Env, owner: Address, operator: Address, live_until_ledger: u32) {
        Self::ContractType::approve_for_all(e, &owner, &operator, live_until_ledger);
        KindfiNFT::extend_instance_ttl(e);
    }

    fn get_approved(e: &Env, token_id: u32) -> Option<Address> {
        Self::ContractType::get_approved(e, token_id)
    }

    fn is_approved_for_all(e: &Env, owner: Address, operator: Address) -> bool {
        Self::ContractType::is_approved_for_all(e, &owner, &operator)
    }

    fn name(e: &Env) -> String {
        Self::ContractType::name(e)
    }

    fn symbol(e: &Env) -> String {
        Self::ContractType::symbol(e)
    }

    fn token_uri(e: &Env, token_id: u32) -> String {
        Self::ContractType::token_uri(e, token_id)
    }
}

/// Implementation of the NonFungibleBurnable trait with role-based access control.
/// Only addresses with the "burner" role can burn NFTs.
#[contractimpl]
impl NonFungibleBurnable for KindfiNFT {
    /// Burn an NFT owned by the caller.
    ///
    /// Requires the "burner" role on the `from` address.
    ///
    /// # Arguments
    /// * `from` - Owner of the NFT (must have burner role)
    /// * `token_id` - ID of the token to burn
    #[has_role(from, "burner")]
    fn burn(e: &Env, from: Address, token_id: u32) {
        burn::burn(e, &from, token_id);
        KindfiNFT::extend_instance_ttl(e);
    }

    /// Burn an NFT from another address.
    ///
    /// Requires the "burner" role on the `spender` address and
    /// approval from the token owner.
    ///
    /// # Arguments
    /// * `spender` - Address initiating the burn (must have burner role and approval)
    /// * `from` - Owner of the NFT
    /// * `token_id` - ID of the token to burn
    #[has_role(spender, "burner")]
    fn burn_from(e: &Env, spender: Address, from: Address, token_id: u32) {
        burn::burn_from(e, &spender, &from, token_id);
        KindfiNFT::extend_instance_ttl(e);
    }
}

/// Implementation of the AccessControl trait.
/// Provides role management functionality using OpenZeppelin storage functions.
#[contractimpl]
impl AccessControl for KindfiNFT {
    fn has_role(e: &Env, account: Address, role: Symbol) -> Option<u32> {
        storage_has_role(e, &account, &role)
    }

    fn get_role_member_count(e: &Env, role: Symbol) -> u32 {
        storage_get_role_member_count(e, &role)
    }

    fn get_role_member(e: &Env, role: Symbol, index: u32) -> Address {
        storage_get_role_member(e, &role, index)
    }

    fn get_role_admin(e: &Env, role: Symbol) -> Option<Symbol> {
        storage_get_role_admin(e, &role)
    }

    fn get_admin(e: &Env) -> Option<Address> {
        storage_get_admin(e)
    }

    fn grant_role(e: &Env, account: Address, role: Symbol, caller: Address) {
        storage_grant_role(e, &account, &role, &caller);
        KindfiNFT::extend_instance_ttl(e);
    }

    fn revoke_role(e: &Env, account: Address, role: Symbol, caller: Address) {
        storage_revoke_role(e, &account, &role, &caller);
        KindfiNFT::extend_instance_ttl(e);
    }

    fn renounce_role(e: &Env, role: Symbol, caller: Address) {
        storage_renounce_role(e, &role, &caller);
        KindfiNFT::extend_instance_ttl(e);
    }

    fn transfer_admin_role(e: &Env, new_admin: Address, live_until_ledger: u32) {
        storage_transfer_admin_role(e, &new_admin, live_until_ledger);
        KindfiNFT::extend_instance_ttl(e);
    }

    fn accept_admin_transfer(e: &Env) {
        storage_accept_admin_transfer(e);
        KindfiNFT::extend_instance_ttl(e);
    }

    fn set_role_admin(e: &Env, role: Symbol, admin_role: Symbol) {
        storage_set_role_admin(e, &role, &admin_role);
        KindfiNFT::extend_instance_ttl(e);
    }

    fn renounce_admin(e: &Env) {
        storage_renounce_admin(e);
        KindfiNFT::extend_instance_ttl(e);
    }
}

#[cfg(test)]
mod test;
