use soroban_sdk::{contracttype, symbol_short, Address, BytesN, Symbol, Vec};

// Symbol representing the core contract init.
pub const INIT: Symbol = symbol_short!("init");

// Symbol representing account-related events.
pub const ACCOUNT: Symbol = symbol_short!("ACCOUNT");

// Symbol representing factory-related events.
pub const FACTORY: Symbol = symbol_short!("FACTORY");

// Symbol representing signer-related events.
pub const SIGNER: Symbol = symbol_short!("SIGNER");

// Symbol representing multisig security-related events.
pub const SECURITY: Symbol = symbol_short!("SECURITY");

// Symbol representing an add event.
pub const ADDED: Symbol = symbol_short!("ADDED");

// Symbol representing a removal event.
pub const REMOVED: Symbol = symbol_short!("REMOVED");

// Symbol representing a changed event.
pub const UPDATED: Symbol = symbol_short!("UPDATED");

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct InitEventData {
    pub threshold: u32,
    pub signers: Vec<BytesN<32>>,
}

// Event data for when a signer is added.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SignerAddedEventData {
    pub signer: BytesN<32>,
}

// Event data for when a signer is removed.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SignerRemovedEventData {
    pub signer: BytesN<32>,
}

// Event data for when a factory is added along with its associated context.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FactoryAddedEventData {
    pub factory: Address,
    pub context: Vec<Address>,
}

// Event data for when a factory is added along with its associated context.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FactoryRemovedEventData {
    pub factory: Address,
    pub context: Vec<Address>,
}

// Event data for when an account is added along with its associated context.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AccountAddedEventData {
    pub account: Address,
    pub context: Vec<Address>,
}

// Event data for when an account is removed along with its associated context.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AccountRemovedEventData {
    pub account: Address,
    pub context: Vec<Address>,
}

// Event data for when the default threshold is changed.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DefaultThresholdChangedEventData {
    pub threshold: u32,
}
