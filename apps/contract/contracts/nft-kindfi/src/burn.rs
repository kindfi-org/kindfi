use soroban_sdk::{Address, Env};
use stellar_tokens::non_fungible::Base;

use crate::events::{BurnedEventData};
use crate::metadata;

/// Burn an NFT owned by the caller.
/// Removes the token and its associated metadata.
pub fn burn(e: &Env, from: &Address, token_id: u32) {
    // Burn using OpenZeppelin Base implementation
    // This handles ownership verification and balance updates
    Base::burn(e, from, token_id);

    // Remove custom metadata
    metadata::remove_metadata(e, token_id);

    // Emit burned event
    BurnedEventData {
        token_id,
        from: from.clone(),
    }.publish(e);
}

/// Burn an NFT from another address (requires approval).
/// The spender must be approved to transfer the token.
pub fn burn_from(e: &Env, spender: &Address, from: &Address, token_id: u32) {
    // Burn using OpenZeppelin Base implementation
    // This handles approval verification, ownership checks, and balance updates
    Base::burn_from(e, spender, from, token_id);

    // Remove custom metadata
    metadata::remove_metadata(e, token_id);

    // Emit burned event
    BurnedEventData {
        token_id,
        from: from.clone(),
    }.publish(e);
}
