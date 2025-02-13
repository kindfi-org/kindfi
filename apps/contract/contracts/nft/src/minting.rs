use soroban_sdk::{Address, Env, String, Vec, symbol_short};
use crate::contract::{NFTContract, NFTMetadata, ADMIN_KEY, COUNTER_KEY};
use crate::events::NFTEvents;

impl NFTContract {
    pub fn mint(
        env: Env,
        to: Address,
        name: String,
        description: String,
        attributes: Vec<String>,
    ) {
        // Verify admin access
        let sender = env.invoker();
        Self::check_admin(&env, &sender);

        // Get and increment token counter
        let token_id: u32 = env.storage().instance().get(&COUNTER_KEY).unwrap();
        env.storage().instance().set(&COUNTER_KEY, &(token_id + 1));

        // Create metadata
        let metadata = NFTMetadata {
            name,
            description,
            attributes,
        };

        // Store token data
        let token_key = symbol_short!(&format!("TOKEN_{}", token_id));
        env.storage().instance().set(&token_key, &to);

        let metadata_key = symbol_short!(&format!("META_{}", token_id));
        env.storage().instance().set(&metadata_key, &metadata);

        // Emit mint event
        NFTEvents::mint(&env, &to, token_id);
    }
} 