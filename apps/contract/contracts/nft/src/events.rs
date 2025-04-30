use soroban_sdk::{Address, Env, symbol_short, String, Symbol};
use crate::TierLevel;


// ################
// Event Definitions
// ################

pub struct NFTEvents;

impl NFTEvents {
    pub fn mint(env: &Env, to: &Address, token_id: u32) {
        let topics = (symbol_short!("mint"), to);
        env.events().publish(topics, token_id);
    }

    pub fn transfer(env: &Env, from: &Address, to: &Address, token_id: u32) {
        let topics = (symbol_short!("transfer"), from, to);
        env.events().publish(topics, token_id);
    }
}


    /// Emitted when an NFT is burned
    pub fn emit_mint(e: &Env, to: Address, token_id: u32, metadata_url: String) {
        let topics = (symbol_short!("mint"), to);
        e.events().publish(topics, (token_id, metadata_url));
    }
    
    pub fn emit_transfer(e: &Env, from: Address, to: Address, token_id: u32) {
        let topics = (symbol_short!("transfer"), from, to);
        e.events().publish(topics, token_id);
    }
    
    pub fn emit_burn(e: &Env, owner: Address, token_id: u32) {
        let topics = (symbol_short!("burn"), owner);
        e.events().publish(topics, token_id);
    }
    
    /// Emitted when metadata is updated
    pub fn emit_metadata_update(
        e: Env,
        token_id: u32,
        new_url: String
    ) {
        let topics = (symbol_short!("data_updt"), token_id);
        e.events().publish(topics, new_url);
    }
    
    /// Emitted when tier is updated
    pub fn emit_tier_update(
        e: Env,
        token_id: u32,
        new_tier: TierLevel
    ) {
        let topics = (symbol_short!("tier_updt"), token_id);
        e.events().publish(topics, new_tier);
    }

