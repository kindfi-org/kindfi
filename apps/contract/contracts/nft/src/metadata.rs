use soroban_sdk::{Env, Symbol, symbol_short};
use crate::contract::{NFTContract, NFTDetail, NFTMetadata};

impl NFTContract {
    pub fn token_metadata(env: Env, token_id: u32) -> NFTDetail {
        let token_key = symbol_short!(&format!("TOKEN_{}", token_id));
        let metadata_key = symbol_short!(&format!("META_{}", token_id));

        let owner = env.storage().instance().get(&token_key).unwrap_or_else(|| {
            panic!("Token not found");
        });

        let metadata: NFTMetadata = env.storage().instance().get(&metadata_key).unwrap();

        NFTDetail { owner, metadata }
    }
} 