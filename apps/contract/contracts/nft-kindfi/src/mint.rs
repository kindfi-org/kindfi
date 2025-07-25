use soroban_sdk::{Env, Address};
use crate::types::{TokenCounterKey, NFTMetadata};
use crate::metadata;
use stellar_non_fungible::Base;

pub fn mint_with_metadata(e: &Env, _caller: Address, to: Address, metadata: &NFTMetadata) -> u32 {
    // Incrementa el contador
    let token_id: u32 = e.storage().instance().get(&TokenCounterKey::Counter).unwrap_or(0);
    e.storage().instance().set(&TokenCounterKey::Counter, &(token_id + 1));
    Base::mint(e, &to, token_id);
    metadata::set_metadata(e, token_id, metadata);
    token_id
} 