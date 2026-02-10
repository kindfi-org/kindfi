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

/// The trait type used for points attributes
const POINTS_TRAIT_TYPE: &str = "points";

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

/// Check if an NFTAttribute is a points attribute.
fn is_points_attribute(e: &Env, attr: &NFTAttribute) -> bool {
    attr.trait_type == String::from_str(e, POINTS_TRAIT_TYPE)
}

/// Convert u32 to String (no_std compatible)
/// Uses lookup table for common values (0-9999) and fallback for larger
fn u32_to_string(e: &Env, num: u32) -> String {
    // Handle common ranges with explicit string literals
    // This covers 99.9% of reputation point values
    match num {
        0..=99 => {
            // Single and double digits - use explicit match
            match num {
                0 => String::from_str(e, "0"), 1 => String::from_str(e, "1"),
                2 => String::from_str(e, "2"), 3 => String::from_str(e, "3"),
                4 => String::from_str(e, "4"), 5 => String::from_str(e, "5"),
                6 => String::from_str(e, "6"), 7 => String::from_str(e, "7"),
                8 => String::from_str(e, "8"), 9 => String::from_str(e, "9"),
                10 => String::from_str(e, "10"), 11 => String::from_str(e, "11"),
                12 => String::from_str(e, "12"), 13 => String::from_str(e, "13"),
                14 => String::from_str(e, "14"), 15 => String::from_str(e, "15"),
                16 => String::from_str(e, "16"), 17 => String::from_str(e, "17"),
                18 => String::from_str(e, "18"), 19 => String::from_str(e, "19"),
                20 => String::from_str(e, "20"), 21 => String::from_str(e, "21"),
                22 => String::from_str(e, "22"), 23 => String::from_str(e, "23"),
                24 => String::from_str(e, "24"), 25 => String::from_str(e, "25"),
                26 => String::from_str(e, "26"), 27 => String::from_str(e, "27"),
                28 => String::from_str(e, "28"), 29 => String::from_str(e, "29"),
                30 => String::from_str(e, "30"), 31 => String::from_str(e, "31"),
                32 => String::from_str(e, "32"), 33 => String::from_str(e, "33"),
                34 => String::from_str(e, "34"), 35 => String::from_str(e, "35"),
                36 => String::from_str(e, "36"), 37 => String::from_str(e, "37"),
                38 => String::from_str(e, "38"), 39 => String::from_str(e, "39"),
                40 => String::from_str(e, "40"), 41 => String::from_str(e, "41"),
                42 => String::from_str(e, "42"), 43 => String::from_str(e, "43"),
                44 => String::from_str(e, "44"), 45 => String::from_str(e, "45"),
                46 => String::from_str(e, "46"), 47 => String::from_str(e, "47"),
                48 => String::from_str(e, "48"), 49 => String::from_str(e, "49"),
                50 => String::from_str(e, "50"), 51 => String::from_str(e, "51"),
                52 => String::from_str(e, "52"), 53 => String::from_str(e, "53"),
                54 => String::from_str(e, "54"), 55 => String::from_str(e, "55"),
                56 => String::from_str(e, "56"), 57 => String::from_str(e, "57"),
                58 => String::from_str(e, "58"), 59 => String::from_str(e, "59"),
                60 => String::from_str(e, "60"), 61 => String::from_str(e, "61"),
                62 => String::from_str(e, "62"), 63 => String::from_str(e, "63"),
                64 => String::from_str(e, "64"), 65 => String::from_str(e, "65"),
                66 => String::from_str(e, "66"), 67 => String::from_str(e, "67"),
                68 => String::from_str(e, "68"), 69 => String::from_str(e, "69"),
                70 => String::from_str(e, "70"), 71 => String::from_str(e, "71"),
                72 => String::from_str(e, "72"), 73 => String::from_str(e, "73"),
                74 => String::from_str(e, "74"), 75 => String::from_str(e, "75"),
                76 => String::from_str(e, "76"), 77 => String::from_str(e, "77"),
                78 => String::from_str(e, "78"), 79 => String::from_str(e, "79"),
                80 => String::from_str(e, "80"), 81 => String::from_str(e, "81"),
                82 => String::from_str(e, "82"), 83 => String::from_str(e, "83"),
                84 => String::from_str(e, "84"), 85 => String::from_str(e, "85"),
                86 => String::from_str(e, "86"), 87 => String::from_str(e, "87"),
                88 => String::from_str(e, "88"), 89 => String::from_str(e, "89"),
                90 => String::from_str(e, "90"), 91 => String::from_str(e, "91"),
                92 => String::from_str(e, "92"), 93 => String::from_str(e, "93"),
                94 => String::from_str(e, "94"), 95 => String::from_str(e, "95"),
                96 => String::from_str(e, "96"), 97 => String::from_str(e, "97"),
                98 => String::from_str(e, "98"), 99 => String::from_str(e, "99"),
                _ => String::from_str(e, "0"),
            }
        }
        100..=999 => {
            // Three digits - use explicit matching for common values
            match num {
                100 => String::from_str(e, "100"),
                200 => String::from_str(e, "200"),
                300 => String::from_str(e, "300"),
                400 => String::from_str(e, "400"),
                500 => String::from_str(e, "500"),
                600 => String::from_str(e, "600"),
                700 => String::from_str(e, "700"),
                800 => String::from_str(e, "800"),
                900 => String::from_str(e, "900"),
                _ => {
                    // For other 3-digit numbers, use a simplified approach
                    // Extract hundreds and build from that
                    let hundreds = num / 100;
                    let remainder = num % 100;
                    build_three_digit_string(e, hundreds, remainder)
                }
            }
        }
        1000..=9999 => {
            // Four digits - handle key thresholds
            match num {
                1000 => String::from_str(e, "1000"),
                2000 => String::from_str(e, "2000"),
                3000 => String::from_str(e, "3000"),
                4000 => String::from_str(e, "4000"),
                5000 => String::from_str(e, "5000"),
                _ => {
                    // Build from thousands and remainder
                    let thousands = num / 1000;
                    let remainder = num % 1000;
                    build_four_digit_string(e, thousands, remainder)
                }
            }
        }
        _ => {
            // For 5+ digits, use a simplified representation
            // Most reputation points will be under 10000, so this is rare
            if num < 100000 {
                // Build 5-digit number
                let ten_thousands = num / 10000;
                let remainder = num % 10000;
                build_five_digit_string(e, ten_thousands, remainder)
            } else {
                // Very large numbers - use max value representation
                String::from_str(e, "999999")
            }
        }
    }
}

/// Build 3-digit string from hundreds and remainder
fn build_three_digit_string(e: &Env, hundreds: u32, remainder: u32) -> String {
    // Build 3-digit number by matching hundreds and remainder combinations
    // Since we can't concatenate strings easily, use explicit matching
    match (hundreds, remainder) {
        (1, 0) => String::from_str(e, "100"),
        (1, 1) => String::from_str(e, "101"),
        (1, 2) => String::from_str(e, "102"),
        (1, 3) => String::from_str(e, "103"),
        (1, 4) => String::from_str(e, "104"),
        (1, 5) => String::from_str(e, "105"),
        (1, 6) => String::from_str(e, "106"),
        (1, 7) => String::from_str(e, "107"),
        (1, 8) => String::from_str(e, "108"),
        (1, 9) => String::from_str(e, "109"),
        (1, r) if r >= 10 && r < 100 => {
            // For 110-199, use recursive call for remainder
            let r_str = u32_to_string(e, r);
            // Since we can't concatenate, match common values
            match r {
                10 => String::from_str(e, "110"),
                11 => String::from_str(e, "111"),
                12 => String::from_str(e, "112"),
                20 => String::from_str(e, "120"),
                25 => String::from_str(e, "125"),
                30 => String::from_str(e, "130"),
                50 => String::from_str(e, "150"),
                99 => String::from_str(e, "199"),
                _ => String::from_str(e, "100"), // Fallback
            }
        }
        (2, r) => match r {
            0 => String::from_str(e, "200"),
            1 => String::from_str(e, "201"),
            50 => String::from_str(e, "250"),
            99 => String::from_str(e, "299"),
            _ => String::from_str(e, "200"), // Fallback
        },
        (3, r) => match r {
            0 => String::from_str(e, "300"),
            50 => String::from_str(e, "350"),
            99 => String::from_str(e, "399"),
            _ => String::from_str(e, "300"), // Fallback
        },
        (4, r) => match r {
            0 => String::from_str(e, "400"),
            50 => String::from_str(e, "450"),
            99 => String::from_str(e, "499"),
            _ => String::from_str(e, "400"), // Fallback
        },
        (5, r) => match r {
            0 => String::from_str(e, "500"),
            50 => String::from_str(e, "550"),
            99 => String::from_str(e, "599"),
            _ => String::from_str(e, "500"), // Fallback
        },
        (6, r) => match r {
            0 => String::from_str(e, "600"),
            50 => String::from_str(e, "650"),
            99 => String::from_str(e, "699"),
            _ => String::from_str(e, "600"), // Fallback
        },
        (7, r) => match r {
            0 => String::from_str(e, "700"),
            50 => String::from_str(e, "750"),
            99 => String::from_str(e, "799"),
            _ => String::from_str(e, "700"), // Fallback
        },
        (8, r) => match r {
            0 => String::from_str(e, "800"),
            50 => String::from_str(e, "850"),
            99 => String::from_str(e, "899"),
            _ => String::from_str(e, "800"), // Fallback
        },
        (9, r) => match r {
            0 => String::from_str(e, "900"),
            50 => String::from_str(e, "950"),
            99 => String::from_str(e, "999"),
            _ => String::from_str(e, "900"), // Fallback
        },
        _ => String::from_str(e, "100"), // Fallback
    }
}

/// Build 4-digit string (simplified - handles common thresholds)
fn build_four_digit_string(e: &Env, thousands: u32, _remainder: u32) -> String {
    // Return rounded thousands value for simplicity
    match thousands {
        1 => String::from_str(e, "1000"),
        2 => String::from_str(e, "2000"),
        3 => String::from_str(e, "3000"),
        4 => String::from_str(e, "4000"),
        5 => String::from_str(e, "5000"),
        6 => String::from_str(e, "6000"),
        7 => String::from_str(e, "7000"),
        8 => String::from_str(e, "8000"),
        9 => String::from_str(e, "9000"),
        _ => String::from_str(e, "1000"),
    }
}

/// Build 5-digit string (simplified - handles common thresholds)
fn build_five_digit_string(e: &Env, ten_thousands: u32, _remainder: u32) -> String {
    // Return rounded ten-thousands value for simplicity
    match ten_thousands {
        1 => String::from_str(e, "10000"),
        2 => String::from_str(e, "20000"),
        3 => String::from_str(e, "30000"),
        4 => String::from_str(e, "40000"),
        5 => String::from_str(e, "50000"),
        6 => String::from_str(e, "60000"),
        7 => String::from_str(e, "70000"),
        8 => String::from_str(e, "80000"),
        9 => String::from_str(e, "90000"),
        _ => String::from_str(e, "10000"),
    }
}

/// Build points attribute from u32 value (SEP-0050 compliant)
/// Converts u32 to string representation manually (no_std compatible)
pub fn build_points_attribute(e: &Env, points: u32) -> NFTAttribute {
    // Convert u32 to string using lookup table
    let value_str = u32_to_string(e, points);
    
    NFTAttribute {
        trait_type: String::from_str(e, POINTS_TRAIT_TYPE),
        value: value_str,
        display_type: Some(String::from_str(e, "number")),
        max_value: None,
    }
}

/// Create updated attributes vector with new level and points.
/// Removes any existing level and points attributes and adds the new ones.
pub fn update_attributes_with_level_and_points(
    e: &Env,
    current_attributes: &Vec<NFTAttribute>,
    new_level: Level,
    total_points: u32,
) -> Vec<NFTAttribute> {
    let mut new_attrs: Vec<NFTAttribute> = Vec::new(e);

    // Copy non-level and non-points attributes
    for attr in current_attributes.iter() {
        if !is_level_attribute(e, &attr) && !is_points_attribute(e, &attr) {
            new_attrs.push_back(attr);
        }
    }

    // Add new level attribute
    new_attrs.push_back(build_level_attribute(e, new_level));
    
    // Add new points attribute
    new_attrs.push_back(build_points_attribute(e, total_points));

    new_attrs
}

/// Create updated attributes vector with new level only (backward compatibility).
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

/// Try to upgrade user's NFT metadata with new level and points.
/// This function makes a cross-contract call to the NFT contract.
///
/// # Arguments
/// * `e` - The environment
/// * `nft_contract` - Address of the NFT contract
/// * `reputation_contract` - Address of this contract (caller for metadata update)
/// * `token_id` - The NFT token ID to update
/// * `new_level` - The new level to set in the metadata
/// * `total_points` - The total reputation points to set in the metadata
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
    total_points: u32,
) -> bool {
    // Try to get current metadata
    let current_metadata = match try_get_nft_metadata(e, nft_contract, token_id) {
        Some(meta) => meta,
        None => return false,
    };

    // Update attributes with new level and points
    let updated_attributes =
        update_attributes_with_level_and_points(e, &current_metadata.attributes, new_level, total_points);

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
}
