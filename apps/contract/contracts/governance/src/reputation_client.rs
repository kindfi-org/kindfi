//! Reputation client for cross-contract calls to the KindFi Reputation contract.
//!
//! Used to look up a voter's NFT tier level, which determines their vote weight.

use soroban_sdk::{Address, ConversionError, Env, IntoVal, InvokeError, Symbol};

use crate::types::NftTier;

/// Client for reading from the KindFi Reputation contract.
pub struct ReputationClient;

impl ReputationClient {
    /// Query a user's current reputation level from the Reputation contract.
    ///
    /// The level maps to NFT tiers:
    /// - 0 = Rookie  (not eligible)
    /// - 1 = Bronze  (1 vote weight)
    /// - 2 = Silver  (3 vote weight)
    /// - 3 = Gold    (5 vote weight)
    /// - 4 = Diamond (10 vote weight)
    ///
    /// # Returns
    /// * `Some(NftTier)` — tier resolved from the on-chain level
    /// * `None` — cross-contract call failed
    pub fn get_tier(e: &Env, reputation_contract: &Address, user: &Address) -> Option<NftTier> {
        let result: Result<Result<u32, ConversionError>, Result<InvokeError, InvokeError>> =
            e.try_invoke_contract(
                reputation_contract,
                &Symbol::new(e, "get_level"),
                (user,).into_val(e),
            );

        match result {
            Ok(Ok(level)) => Some(NftTier::from_level(level)),
            _ => None,
        }
    }
}
