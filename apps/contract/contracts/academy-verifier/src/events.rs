use soroban_sdk::{contracttype, Address, Symbol};

// Event topics
pub const ACADEMY: Symbol = Symbol::short("ACADEMY");
pub const VERIFIED: Symbol = Symbol::short("VERIFIED");
pub const INITIALIZED: Symbol = Symbol::short("INITIALIZED");
pub const UPDATED: Symbol = Symbol::short("UPDATED");

#[contracttype]
#[derive(Clone)]
pub struct InitializedEventData {
    pub progress_tracker: Address,
    pub graduation_nft: Address,
    pub badge_tracker: Address,
}

#[contracttype]
#[derive(Clone)]
pub struct EligibilityVerifiedEventData {
    pub user: Address,
    pub eligible: bool,
    pub is_certified: bool,
    pub has_nft: bool,
}

#[contracttype]
#[derive(Clone)]
pub struct ContractAddressUpdatedEventData {
    pub contract_type: Symbol,
    pub new_address: Address,
}