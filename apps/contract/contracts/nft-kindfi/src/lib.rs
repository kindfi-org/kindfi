#![no_std]

mod types;
mod metadata;
mod mint;
mod burn;

use soroban_sdk::{contract, contractimpl, Address, Env};
use stellar_access_control::{set_admin, AccessControl};
use stellar_access_control_macros::only_role;
use stellar_default_impl_macro::default_impl;
use stellar_non_fungible::{Base, NonFungibleToken};
use crate::types::NFTMetadata;

#[contract]
pub struct KindfiNFT;

#[contractimpl]
impl KindfiNFT {
    pub fn __constructor(e: &Env, admin: Address, name: soroban_sdk::String, symbol: soroban_sdk::String, base_uri: soroban_sdk::String) {
        set_admin(e, &admin);
        Base::set_metadata(e, base_uri, name, symbol);
        e.storage().instance().set(&types::TokenCounterKey::Counter, &0u32);
    }

    #[only_role(caller, "minter")]
    pub fn mint_with_metadata(
        e: &Env,
        caller: Address,
        to: Address,
        metadata: NFTMetadata,
    ) -> u32 {
        mint::mint_with_metadata(e, caller, to, &metadata)
    }

    #[only_role(caller, "metadata_manager")]
    pub fn update_metadata(
        e: &Env,
        caller: Address,
        token_id: u32,
        metadata: NFTMetadata,
    ) {
        metadata::set_metadata(e, token_id, &metadata);
    }

    pub fn get_metadata(e: &Env, token_id: u32) -> Option<NFTMetadata> {
        metadata::get_metadata(e, token_id)
    }

    pub fn total_supply(e: &Env) -> u32 {
        e.storage().instance().get(&types::TokenCounterKey::Counter).unwrap_or(0)
    }

    #[only_role(from, "burner")]
    pub fn burn(e: &Env, from: Address, token_id: u32) {
        burn::burn(e, from, token_id);
    }

    #[only_role(spender, "burner")]
    pub fn burn_from(e: &Env, spender: Address, from: Address, token_id: u32) {
        burn::burn_from(e, spender, from, token_id);
    }
}

#[default_impl]
#[contractimpl]
impl NonFungibleToken for KindfiNFT {
    type ContractType = Base;
}

#[default_impl]
#[contractimpl]
impl AccessControl for KindfiNFT {}
