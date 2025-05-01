use soroban_sdk::{contracttype, symbol_short, Address, Symbol};

pub const ADMIN_KEY: Symbol = symbol_short!("ADMIN");
pub const NFT_CONTRACT_KEY: Symbol = symbol_short!("NFT");

/// Tier levels for reputation system
#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum TierLevel {
    None,     
    Bronze,   
    Silver,   
    Gold,     
    Platinum, 
}

/// Data keys for storage operations
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    UserScore(Address),
    UserStreak(Address),
    UserTier(Address),
    TierThreshold(TierLevel),
}
