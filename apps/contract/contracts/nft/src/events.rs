use soroban_sdk::{Address, Env, symbol_short};

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
