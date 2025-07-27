use soroban_sdk::{contracttype, String, Vec};

#[derive(Clone, Debug, PartialEq, Eq)]
#[contracttype]
pub struct NFTMetadata {
    pub name: String,
    pub description: String,
    pub image_uri: String,
    pub external_url: String,
    pub attributes: Vec<String>,
}

#[contracttype]
pub enum TokenCounterKey {
    Counter,
} 