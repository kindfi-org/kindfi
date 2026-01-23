use soroban_sdk::{panic_with_error, Address, Env};
use stellar_non_fungible::Base;

use crate::errors::Error;
use crate::events::{MintedEventData, MINTED, NFT};
use crate::metadata;
use crate::types::{NFTMetadata, StorageKey};

/// Get the current token counter value (next token ID to be minted).
pub fn get_token_counter(e: &Env) -> u32 {
    e.storage()
        .instance()
        .get(&StorageKey::TokenCounter)
        .unwrap_or(0)
}

/// Increment the token counter and return the new token ID.
fn increment_token_counter(e: &Env) -> u32 {
    let current_id = get_token_counter(e);
    let Some(next_id) = current_id.checked_add(1) else {
        panic_with_error!(e, Error::TokenIdOverflow);
    };
    e.storage()
        .instance()
        .set(&StorageKey::TokenCounter, &next_id);
    current_id
}

/// Mint a new NFT with custom metadata.
/// Uses sequential token IDs starting from 0.
/// Returns the minted token ID.
pub fn mint_with_metadata(e: &Env, to: &Address, nft_metadata: &NFTMetadata) -> u32 {
    // Get next sequential token ID
    let token_id = increment_token_counter(e);

    // Mint using OpenZeppelin Base implementation
    Base::mint(e, to, token_id);

    // Store custom metadata
    metadata::set_metadata(e, token_id, nft_metadata);

    // Emit minted event with metadata
    e.events().publish(
        (NFT, MINTED),
        MintedEventData {
            token_id,
            to: to.clone(),
            metadata: nft_metadata.clone(),
        },
    );

    token_id
}
