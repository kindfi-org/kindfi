use soroban_sdk::{contracttype, symbol_short, Address, String, Symbol, Vec};

pub const ADMIN_KEY: Symbol = symbol_short!("ADMIN");
pub const COUNTER_KEY: Symbol = symbol_short!("COUNTER");

#[derive(Clone, Debug, PartialEq, Eq)]
#[contracttype]
pub struct NFTMetadata {
    pub name: String,
    pub description: String,
    pub attributes: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
#[contracttype]
pub struct NFTDetail {
    pub owner: Address,
    pub metadata: NFTMetadata,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    TokenOwner(u32),
    TokenMetadata(u32),
    TokenUri(u32),
    UserBalance(Address),
}
