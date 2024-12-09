use soroban_sdk::{contracttype, Address, String};

#[contracttype]
#[derive(Clone)]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub uri: String,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    TokenOwner(u32),
    TokenMetadata(u32),
    TokenUri(u32),
    UserBalance(Address),
}