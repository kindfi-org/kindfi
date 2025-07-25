use soroban_sdk::{Env, Address};
use crate::metadata;
use stellar_non_fungible::Base;

pub fn burn(e: &Env, from: Address, token_id: u32) {
    Base::burn(e, &from, token_id);
    metadata::remove_metadata(e, token_id);
}

pub fn burn_from(e: &Env, spender: Address, from: Address, token_id: u32) {
    Base::burn_from(e, &spender, &from, token_id);
    metadata::remove_metadata(e, token_id);
} 