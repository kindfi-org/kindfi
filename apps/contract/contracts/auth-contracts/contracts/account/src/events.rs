use soroban_sdk::{contracttype, symbol_short, Address, BytesN, Symbol};

// Symbol representing account-related events.
pub const ACCOUNT: Symbol = symbol_short!("ACCOUNT");

// Symbol representing multisig security-related events.
pub const SECURITY: Symbol = symbol_short!("SECURITY");

// Symbol representing device related events.
pub const DEVICE: Symbol = symbol_short!("DEVICE");

// Symbol representing an added event.
pub const ADDED: Symbol = symbol_short!("ADDED");

// Symbol representing an added event.
pub const UPDATED: Symbol = symbol_short!("UPDATED");

// Symbol representing a removed event.
pub const REMOVED: Symbol = symbol_short!("REMOVED");

// Event data for when a device is added.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DeviceAddedEventData {
    pub device_id: BytesN<32>,
    pub public_key: BytesN<64>,
}

// Event data for when a device is removed.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DeviceRemovedEventData {
    pub device_id: BytesN<32>,
}

// Event data for recovery addresss action.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RecoveryAddressEventData {
    pub address: Address,
}

// Event data for when a recovery is recovered.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AccountRecoveredEventData {
    pub device_id: BytesN<32>,
    pub public_key: BytesN<64>,
}
