use soroban_sdk::{Address, Env, Symbol, symbol_short};
use crate::contract::NFTContract;
use crate::events::NFTEvents;

impl NFTContract {
    pub fn transfer(env: Env, from: Address, to: Address, token_id: u32) {
        // Verify ownership
        let token_key = symbol_short!(&format!("TOKEN_{}", token_id));
        let owner: Address = env.storage().instance().get(&token_key).unwrap_or_else(|| {
            panic!("Token not found");
        });

        if owner != from {
            panic!("Not token owner");
        }

        // Verify authorization
        let sender = env.invoker();
        if sender != from {
            panic!("Not authorized");
        }

        // Update token ownership
        env.storage().instance().set(&token_key, &to);

        // Emit transfer event
        NFTEvents::transfer(&env, &from, &to, token_id);
    }
} 