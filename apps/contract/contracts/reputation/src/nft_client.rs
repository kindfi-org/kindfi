//! NFT Client module for cross-contract calls to the KindFi NFT contract.
//!
//! This module handles the integration between the Reputation contract and the NFT contract,
//! allowing automatic NFT metadata updates when users level up.
//!
//! ## Setup Required
//!
//! For the cross-contract calls to work:
//! 1. The Reputation contract needs `metadata_manager` role on the NFT contract
//! 2. Register user NFT token IDs using `register_user_nft`

use soroban_sdk::{contracttype, Address, ConversionError, Env, IntoVal, InvokeError, String, Symbol, Vec};

use crate::types::Level;

// ============================================================================
// NFT Metadata Type (mirrors nft-kindfi NFTMetadata)
// ============================================================================

/// NFT Metadata structure matching the nft-kindfi contract.
/// Used for cross-contract calls to update NFT metadata.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NFTMetadata {
    pub name: String,
    pub description: String,
    pub image_uri: String,
    pub external_url: String,
    pub attributes: Vec<String>,
}

// ============================================================================
// Level Attribute Helpers
// ============================================================================

/// All valid level attribute strings
const LEVEL_ROOKIE: &str = "level:rookie";
const LEVEL_BRONZE: &str = "level:bronze";
const LEVEL_SILVER: &str = "level:silver";
const LEVEL_GOLD: &str = "level:gold";
const LEVEL_DIAMOND: &str = "level:diamond";

/// Build level attribute string from Level enum
pub fn build_level_attribute(e: &Env, level: Level) -> String {
    match level {
        Level::Rookie => String::from_str(e, LEVEL_ROOKIE),
        Level::Bronze => String::from_str(e, LEVEL_BRONZE),
        Level::Silver => String::from_str(e, LEVEL_SILVER),
        Level::Gold => String::from_str(e, LEVEL_GOLD),
        Level::Diamond => String::from_str(e, LEVEL_DIAMOND),
    }
}

/// Check if a Soroban String is a level attribute.
fn is_level_attribute(e: &Env, attr: &String) -> bool {
    *attr == String::from_str(e, LEVEL_ROOKIE)
        || *attr == String::from_str(e, LEVEL_BRONZE)
        || *attr == String::from_str(e, LEVEL_SILVER)
        || *attr == String::from_str(e, LEVEL_GOLD)
        || *attr == String::from_str(e, LEVEL_DIAMOND)
}

/// Create updated attributes vector with new level.
/// Removes any existing level attribute and adds the new one.
pub fn update_attributes_with_level(
    e: &Env,
    current_attributes: &Vec<String>,
    new_level: Level,
) -> Vec<String> {
    let mut new_attrs: Vec<String> = Vec::new(e);

    // Copy non-level attributes
    for attr in current_attributes.iter() {
        if !is_level_attribute(e, &attr) {
            new_attrs.push_back(attr);
        }
    }

    // Add new level attribute
    new_attrs.push_back(build_level_attribute(e, new_level));

    new_attrs
}

// ============================================================================
// Cross-Contract Call Functions
// ============================================================================

/// Try to get NFT metadata from the NFT contract.
///
/// # Arguments
/// * `e` - The environment
/// * `nft_contract` - Address of the NFT contract
/// * `token_id` - The NFT token ID to query
///
/// # Returns
/// * `Some(NFTMetadata)` if successful
/// * `None` if the call failed or token not found
fn try_get_nft_metadata(e: &Env, nft_contract: &Address, token_id: u32) -> Option<NFTMetadata> {
    let result: Result<Result<Option<NFTMetadata>, ConversionError>, Result<InvokeError, InvokeError>> =
        e.try_invoke_contract(
            nft_contract,
            &Symbol::new(e, "get_metadata"),
            (token_id,).into_val(e),
        );

    match result {
        Ok(Ok(metadata_opt)) => metadata_opt,
        _ => None,
    }
}

/// Try to update NFT metadata on the NFT contract.
///
/// # Arguments
/// * `e` - The environment
/// * `nft_contract` - Address of the NFT contract
/// * `caller` - Address calling the update (needs metadata_manager role)
/// * `token_id` - The NFT token ID to update
/// * `metadata` - The new metadata
///
/// # Returns
/// * `true` if the update was successful
/// * `false` if the call failed
fn try_update_nft_metadata(
    e: &Env,
    nft_contract: &Address,
    caller: &Address,
    token_id: u32,
    metadata: &NFTMetadata,
) -> bool {
    let result: Result<Result<(), ConversionError>, Result<InvokeError, InvokeError>> =
        e.try_invoke_contract(
            nft_contract,
            &Symbol::new(e, "update_metadata"),
            (caller, token_id, metadata).into_val(e),
        );

    matches!(result, Ok(Ok(())))
}

/// Try to upgrade user's NFT metadata with new level.
/// This function makes a cross-contract call to the NFT contract.
///
/// # Arguments
/// * `e` - The environment
/// * `nft_contract` - Address of the NFT contract
/// * `reputation_contract` - Address of this contract (caller for metadata update)
/// * `token_id` - The NFT token ID to update
/// * `new_level` - The new level to set in the metadata
///
/// # Returns
/// * `true` if the upgrade was successful
/// * `false` if the upgrade failed (NFT not found, no permission, etc.)
pub fn try_upgrade_nft(
    e: &Env,
    nft_contract: &Address,
    reputation_contract: &Address,
    token_id: u32,
    new_level: Level,
) -> bool {
    // Try to get current metadata
    let current_metadata = match try_get_nft_metadata(e, nft_contract, token_id) {
        Some(meta) => meta,
        None => return false,
    };

    // Update attributes with new level
    let updated_attributes =
        update_attributes_with_level(e, &current_metadata.attributes, new_level);

    // Create updated metadata
    let updated_metadata = NFTMetadata {
        name: current_metadata.name,
        description: current_metadata.description,
        image_uri: current_metadata.image_uri,
        external_url: current_metadata.external_url,
        attributes: updated_attributes,
    };

    // Try to update metadata (this contract needs metadata_manager role on NFT contract)
    try_update_nft_metadata(e, nft_contract, reputation_contract, token_id, &updated_metadata)
}

#[cfg(test)]
mod tests {
    extern crate std;

    use super::*;
    use soroban_sdk::Env;
    use std::string::ToString;

    #[test]
    fn test_build_level_attribute() {
        let env = Env::default();

        assert_eq!(
            build_level_attribute(&env, Level::Rookie).to_string(),
            "level:rookie"
        );
        assert_eq!(
            build_level_attribute(&env, Level::Bronze).to_string(),
            "level:bronze"
        );
        assert_eq!(
            build_level_attribute(&env, Level::Silver).to_string(),
            "level:silver"
        );
        assert_eq!(
            build_level_attribute(&env, Level::Gold).to_string(),
            "level:gold"
        );
        assert_eq!(
            build_level_attribute(&env, Level::Diamond).to_string(),
            "level:diamond"
        );
    }

    #[test]
    fn test_update_attributes_keeps_non_level_attrs() {
        let env = Env::default();

        // Create initial attributes without a level
        let mut attrs: Vec<String> = Vec::new(&env);
        attrs.push_back(String::from_str(&env, "badge:early_supporter"));
        attrs.push_back(String::from_str(&env, "tier:standard"));

        // Update to Bronze level
        let new_attrs = update_attributes_with_level(&env, &attrs, Level::Bronze);

        // Should have 3 attributes: badge, tier, and new level
        assert_eq!(new_attrs.len(), 3);
    }

    #[test]
    fn test_update_attributes_adds_level() {
        let env = Env::default();

        // Create empty attributes
        let attrs: Vec<String> = Vec::new(&env);

        // Update to Diamond level
        let new_attrs = update_attributes_with_level(&env, &attrs, Level::Diamond);

        // Should have 1 attribute: the new level
        assert_eq!(new_attrs.len(), 1);

        // Check that we have the diamond level
        let attr = new_attrs.get(0).unwrap();
        assert_eq!(attr.to_string(), "level:diamond");
    }

    #[test]
    fn test_update_attributes_replaces_level() {
        let env = Env::default();

        // Create initial attributes with a level
        let mut attrs: Vec<String> = Vec::new(&env);
        attrs.push_back(String::from_str(&env, "badge:early_supporter"));
        attrs.push_back(String::from_str(&env, "level:rookie"));
        attrs.push_back(String::from_str(&env, "tier:standard"));

        // Update to Gold level
        let new_attrs = update_attributes_with_level(&env, &attrs, Level::Gold);

        // Should still have 3 attributes: badge, tier, and new level (rookie replaced)
        assert_eq!(new_attrs.len(), 3);

        // Check that we have gold level and not rookie
        let mut has_gold = false;
        let mut has_rookie = false;
        for attr in new_attrs.iter() {
            let s = attr.to_string();
            if s == "level:gold" {
                has_gold = true;
            }
            if s == "level:rookie" {
                has_rookie = true;
            }
        }

        assert!(has_gold, "Should have level:gold");
        assert!(!has_rookie, "Should not have level:rookie");
    }
}
