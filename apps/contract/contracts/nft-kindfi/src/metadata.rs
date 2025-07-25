use soroban_sdk::{contracttype, Env};
use crate::types::NFTMetadata;

#[contracttype]
pub enum MetadataKey {
    TokenMetadata(u32),
}

pub fn set_metadata(e: &Env, token_id: u32, metadata: &NFTMetadata) {
    e.storage().instance().set(&MetadataKey::TokenMetadata(token_id), metadata);
}

pub fn get_metadata(e: &Env, token_id: u32) -> Option<NFTMetadata> {
    e.storage().instance().get(&MetadataKey::TokenMetadata(token_id))
}

pub fn remove_metadata(e: &Env, token_id: u32) {
    e.storage().instance().remove(&MetadataKey::TokenMetadata(token_id));
} 