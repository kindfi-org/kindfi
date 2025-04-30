use soroban_sdk::{contract, contractimpl, Address, Env, String, panic_with_error};
use stellar_non_fungible::{Base, NonFungibleToken, burnable::NonFungibleBurnable};
use stellar_default_impl_macro::default_impl;

use crate::{
    interface::NFTContractTrait,
    errors::Error,
    events::{emit_mint, emit_transfer, emit_burn},
    types::{DataKey, TokenMetadata}
};

#[contract]
pub struct NFTCore;

#[contractimpl]
impl NFTCore {
    pub fn __constructor(e: Env, admin: Address, base_uri: String, name: String, symbol: String) {
        // Set metadata using OpenZeppelin's base implementation
        Base::set_metadata(&e, base_uri, name, symbol);
        
        // Store admin address
        e.storage().instance().set(&DataKey::Admin, &admin);
    }

    pub fn mint_nft(e: Env, to: Address, metadata_url: String) -> Result<u32, Error> {
        // Verify admin authorization
        let admin: Address = e.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let token_id = Base::sequential_mint(&e, &to);

        // Store additional metadata
        e.storage().persistent().set(
            &DataKey::TokenMetadata(token_id),
            &TokenMetadata {
                uri: metadata_url.clone()
            }
        );

        emit_mint(&e, to, token_id, metadata_url);

        Ok(token_id)
    }

    pub fn transfer_nft(e: Env, from: Address, to: Address, token_id: u32) {
        // if the token_id does not exist, panic
        if !e.storage().persistent().has(&DataKey::TokenMetadata(token_id)) {
            panic_with_error!(&e, Error::TokenNotFound);
        }
        // if to address is zero, panic
        // if to.is_zero() {
        //     panic_with_error!(&env, Error::TransferToZeroAddress);
        // }

        // verify owner authorization
        from.require_auth();
        Base::transfer(&e, &from, &to, token_id);
        emit_transfer(&e, from, to, token_id);
    }

    pub fn burn(e: Env, from: Address, token_id: u32) {
        // if the token_id does not exist, panic
        if !e.storage().persistent().has(&DataKey::TokenMetadata(token_id)) {
            panic_with_error!(&e, Error::TokenNotFound);
        }
        from.require_auth();
        Base::burn(&e, &from, token_id);
        e.storage().persistent().remove(&DataKey::TokenMetadata(token_id));
        emit_burn(&e, from, token_id);
    }
}

// Single implementation of NonFungibleToken trait
#[default_impl]
// #[contractimpl]
impl NonFungibleToken for NFTCore {
    // Uses OpenZeppelin's Base implementation
    type ContractType = Base;
}

