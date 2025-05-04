use soroban_sdk::{contracttype, symbol_short, Address, Symbol};

// Event topics
pub const ACADEMY: Symbol = symbol_short!("ACADEMY");
pub const CERTIFIED: Symbol = symbol_short!("CERTIFIED");
pub const INITIALIZED: Symbol = symbol_short!("INIT");

#[contracttype]
#[derive(Clone)]
pub struct InitializedEventData {
    pub progress_tracker: Address,
    pub graduation_nft: Address,
    pub badge_tracker: Address,
}

#[contracttype]
#[derive(Clone)]
pub struct CertificationVerifiedEventData {
    pub user: Address,
    pub is_fully_certified: bool,
    pub has_completely_progressed: bool,
    pub has_all_badges: bool,
    pub has_graduated: bool,
}
