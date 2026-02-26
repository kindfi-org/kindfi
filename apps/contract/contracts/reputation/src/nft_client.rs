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
use itoa;
use soroban_sdk::{contracttype, Address, ConversionError, Env, IntoVal, InvokeError, String, Symbol, Vec};

use crate::types::Level;

// ============================================================================
// NFT Metadata Types (mirrors nft-kindfi types, SEP-0050 compliant)
// ============================================================================

/// NFT attribute following SEP-0050 JSON schema.
/// Must match the nft-kindfi NFTAttribute structure exactly.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NFTAttribute {
    pub trait_type: String,
    pub value: String,
    pub display_type: Option<String>,
    pub max_value: Option<String>,
}

/// NFT Metadata structure matching the nft-kindfi contract.
/// Used for cross-contract calls to update NFT metadata.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NFTMetadata {
    pub name: String,
    pub description: String,
    pub image_uri: String,
    pub external_url: String,
    pub attributes: Vec<NFTAttribute>,
}

// ============================================================================
// Level Attribute Helpers
// ============================================================================

/// The trait type used for level attributes
const LEVEL_TRAIT_TYPE: &str = "level";

/// Level value constants
const LEVEL_VALUE_ROOKIE: &str = "rookie";
const LEVEL_VALUE_BRONZE: &str = "bronze";
const LEVEL_VALUE_SILVER: &str = "silver";
const LEVEL_VALUE_GOLD: &str = "gold";
const LEVEL_VALUE_DIAMOND: &str = "diamond";

/// Get the string value for a level
fn level_to_value(level: Level) -> &'static str {
    match level {
        Level::Rookie => LEVEL_VALUE_ROOKIE,
        Level::Bronze => LEVEL_VALUE_BRONZE,
        Level::Silver => LEVEL_VALUE_SILVER,
        Level::Gold => LEVEL_VALUE_GOLD,
        Level::Diamond => LEVEL_VALUE_DIAMOND,
    }
}

/// Build level attribute from Level enum (SEP-0050 compliant)
pub fn build_level_attribute(e: &Env, level: Level) -> NFTAttribute {
    NFTAttribute {
        trait_type: String::from_str(e, LEVEL_TRAIT_TYPE),
        value: String::from_str(e, level_to_value(level)),
        display_type: Some(String::from_str(e, "string")),
        max_value: None,
    }
}

/// Check if an NFTAttribute is a level attribute.
fn is_level_attribute(e: &Env, attr: &NFTAttribute) -> bool {
    attr.trait_type == String::from_str(e, LEVEL_TRAIT_TYPE)
}


pub fn u32_to_string(env: &Env, value: u32) -> String {
    let mut buffer = itoa::Buffer::new();
    let formatted = buffer.format(value);
    String::from_str(env, formatted)
}
/// Create updated attributes vector with new level.
/// Removes any existing level attribute and adds the new one.
pub fn update_attributes_with_level(
    e: &Env,
    current_attributes: &Vec<NFTAttribute>,
    new_level: Level,
) -> Vec<NFTAttribute> {
    let mut new_attrs: Vec<NFTAttribute> = Vec::new(e);

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

        let rookie_attr = build_level_attribute(&env, Level::Rookie);
        assert_eq!(rookie_attr.trait_type.to_string(), "level");
        assert_eq!(rookie_attr.value.to_string(), "rookie");

        let bronze_attr = build_level_attribute(&env, Level::Bronze);
        assert_eq!(bronze_attr.value.to_string(), "bronze");

        let silver_attr = build_level_attribute(&env, Level::Silver);
        assert_eq!(silver_attr.value.to_string(), "silver");

        let gold_attr = build_level_attribute(&env, Level::Gold);
        assert_eq!(gold_attr.value.to_string(), "gold");

        let diamond_attr = build_level_attribute(&env, Level::Diamond);
        assert_eq!(diamond_attr.value.to_string(), "diamond");
    }

    #[test]
    fn test_update_attributes_keeps_non_level_attrs() {
        let env = Env::default();

        // Create initial attributes without a level (SEP-0050 format)
        let mut attrs: Vec<NFTAttribute> = Vec::new(&env);
        attrs.push_back(NFTAttribute {
            trait_type: String::from_str(&env, "badge"),
            value: String::from_str(&env, "early_supporter"),
            display_type: Some(String::from_str(&env, "string")),
            max_value: None,
        });
        attrs.push_back(NFTAttribute {
            trait_type: String::from_str(&env, "tier"),
            value: String::from_str(&env, "standard"),
            display_type: None,
            max_value: None,
        });

        // Update to Bronze level
        let new_attrs = update_attributes_with_level(&env, &attrs, Level::Bronze);

        // Should have 3 attributes: badge, tier, and new level
        assert_eq!(new_attrs.len(), 3);
    }

    #[test]
    fn test_update_attributes_adds_level() {
        let env = Env::default();

        // Create empty attributes
        let attrs: Vec<NFTAttribute> = Vec::new(&env);

        // Update to Diamond level
        let new_attrs = update_attributes_with_level(&env, &attrs, Level::Diamond);

        // Should have 1 attribute: the new level
        assert_eq!(new_attrs.len(), 1);

        // Check that we have the diamond level
        let attr = new_attrs.get(0).unwrap();
        assert_eq!(attr.trait_type.to_string(), "level");
        assert_eq!(attr.value.to_string(), "diamond");
    }

    #[test]
    fn test_update_attributes_replaces_level() {
        let env = Env::default();

        // Create initial attributes with a level (SEP-0050 format)
        let mut attrs: Vec<NFTAttribute> = Vec::new(&env);
        attrs.push_back(NFTAttribute {
            trait_type: String::from_str(&env, "badge"),
            value: String::from_str(&env, "early_supporter"),
            display_type: Some(String::from_str(&env, "string")),
            max_value: None,
        });
        attrs.push_back(NFTAttribute {
            trait_type: String::from_str(&env, "level"),
            value: String::from_str(&env, "rookie"),
            display_type: Some(String::from_str(&env, "string")),
            max_value: None,
        });
        attrs.push_back(NFTAttribute {
            trait_type: String::from_str(&env, "tier"),
            value: String::from_str(&env, "standard"),
            display_type: None,
            max_value: None,
        });

        // Update to Gold level
        let new_attrs = update_attributes_with_level(&env, &attrs, Level::Gold);

        // Should still have 3 attributes: badge, tier, and new level (rookie replaced)
        assert_eq!(new_attrs.len(), 3);

        // Check that we have gold level and not rookie
        let mut has_gold = false;
        let mut has_rookie = false;
        for attr in new_attrs.iter() {
            if attr.trait_type.to_string() == "level" {
                if attr.value.to_string() == "gold" {
                    has_gold = true;
                }
                if attr.value.to_string() == "rookie" {
                    has_rookie = true;
                }
            }
        }

        assert!(has_gold, "Should have level:gold");
        assert!(!has_rookie, "Should not have level:rookie");
    }

     
    #[test]
    fn test_u32_to_string_integrity() {
        let env = Env::default();
        // Casos fallidos reportados en el issue #787
        assert_eq!(u32_to_string(&env, 123).to_string(), "123");
        assert_eq!(u32_to_string(&env, 1234).to_string(), "1234");
        assert_eq!(u32_to_string(&env, 2500).to_string(), "2500");
    }


}
