use soroban_sdk::{Address, Env};
use crate::types::{DataKey, NFTMetadata, ADMIN_KEY};

pub struct NFTStorage;

impl NFTStorage {
    // Set the admin of the contract in the storage
    pub fn set_admin(env: &Env, admin: &Address) {
        env.storage().instance().set(&ADMIN_KEY, admin);
    }

    pub fn get_admin(env: &Env) -> Address {
        env.storage().instance().get(&ADMIN_KEY).unwrap()
    }

    pub fn set_token_owner(env: &Env, token_id: &u32, owner: &Address) {
        env.storage().instance().set(&DataKey::TokenOwner(*token_id), owner);
    }

    pub fn get_token_owner(env: &Env, token_id: &u32) -> Option<Address> {
        env.storage().instance().get(&DataKey::TokenOwner(*token_id))
    }

    pub fn set_token_metadata(env: &Env, token_id: &u32, metadata: &NFTMetadata) {
        env.storage().instance().set(&DataKey::TokenMetadata(*token_id), metadata);
    }

    #[allow(dead_code)]
    pub fn get_token_metadata(env: &Env, token_id: &u32) -> Option<NFTMetadata> {
        env.storage().instance().get(&DataKey::TokenMetadata(*token_id))
    }

    pub fn increment_balance(env: &Env, address: &Address) {
        let balance: u32 = env
            .storage()
            .instance()
            .get(&DataKey::UserBalance(address.clone()))
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::UserBalance(address.clone()), &(balance + 1));
    }

    pub fn decrement_balance(env: &Env, address: &Address) {
        let balance: u32 = env
            .storage()
            .instance()
            .get(&DataKey::UserBalance(address.clone()))
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::UserBalance(address.clone()), &(balance - 1));
    }
}
