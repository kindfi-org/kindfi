use soroban_sdk::{contracttype, String, Vec};

/// KindFi on-chain NFT attribute inspired by the draft SEP-0050 JSON schema.
/// Represents a single trait/property of the NFT.
///
/// A metadata server must convert numeric strings for the draft JSON schema:
/// ```json
/// {
///   "display_type": "string",
///   "trait_type": "string",
///   "value": "string | number",
///   "max_value": "number (optional)"
/// }
/// ```
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NFTAttribute {
    /// The type of trait this attribute represents (e.j., "level", "badge", "rarity")
    pub trait_type: String,
    /// The value of the attribute (ej., "gold", "100", "rare")
    pub value: String,
    /// Optional display type hint for UIs (ej., "string", "number", "date", "boost_percentage")
    pub display_type: Option<String>,
    /// Optional maximum value for numeric traits (stored as string for flexibility)
    pub max_value: Option<String>,
}

/// Custom metadata structure for KindFi NFTs.
/// Stores on-chain metadata per token for the reputation and incentivization system.
/// This is not the draft SEP-0050 JSON representation: `image_uri` maps to
/// `image`, and numeric attribute strings require conversion by the metadata server.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NFTMetadata {
    /// Display name for the NFT (identifies the asset)
    pub name: String,
    /// Description of the NFT (describes the asset)
    pub description: String,
    /// URI pointing to a resource with mime type image/* representing the asset
    pub image_uri: String,
    /// External URL for more information (ej., collection's own site)
    pub external_url: String,
    /// Array of KindFi attributes that describe the asset
    pub attributes: Vec<NFTAttribute>,
}

/// Storage keys for the KindFi NFT contract.
#[contracttype]
#[derive(Clone)]
pub enum StorageKey {
    /// Counter for sequential token IDs
    TokenCounter,
    /// Custom metadata storage per token ID
    TokenMetadata(u32),
}
