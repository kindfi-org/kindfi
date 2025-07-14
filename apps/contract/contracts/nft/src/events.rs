use soroban_sdk::{symbol_short, Address, Env, String, Vec};

pub struct NFTEvents;

impl NFTEvents {
    pub fn mint(env: &Env, to: &Address, token_id: u32, metadata: &crate::types::NFTMetadata) {
        let topics = (symbol_short!("mint"), to);
        env.events().publish(topics, (token_id, metadata.name.clone()));
    }

    pub fn transfer(env: &Env, from: &Address, to: &Address, token_id: u32) {
        let topics = (symbol_short!("transfer"), from, to);
        env.events().publish(topics, token_id);
    }

    pub fn metadata_update(env: &Env, token_id: u32, metadata: &crate::types::NFTMetadata) {
        let topics = (symbol_short!("metadata"), token_id);
        env.events().publish(topics, metadata.name.clone());
    }
}
