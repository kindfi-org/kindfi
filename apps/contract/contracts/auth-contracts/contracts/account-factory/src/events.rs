use soroban_sdk::{contracttype, symbol_short, Address, Symbol};

// Symbol for events related to account operations.
pub const ACCOUNT: Symbol = symbol_short!("ACCOUNT");

// Symbol for account deployment events.
pub const DEPLOY: Symbol = symbol_short!("DEPLOY");

// Event data emitted when a new account is deployed.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AccountDeployEventData {
    pub account: Address,
}
