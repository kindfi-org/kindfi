use soroban_sdk::{contracttype, symbol_short, Address, Symbol};

// Symbol representing account-related events.
pub const ACCOUNT: Symbol = symbol_short!("ACCOUNT");

// Symbol representing Deploy events.
pub const DEPLOY: Symbol = symbol_short!("DEPLOY");

// Event data for when a device is added.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AccountDeployEventData {
    pub account: Address,
}
