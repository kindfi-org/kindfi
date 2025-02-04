use soroban_sdk::{contracttype, symbol_short, Address, BytesN, Symbol, Vec};

// Symbol representing account-related events.
pub const ACCOUNT: Symbol = symbol_short("ACCOUNT");

// Symbol representing multisig security-related events.
pub const SECURITY: Symbol = symbol_short!("SECURITY");

// Symbol representing an added event.
pub const DEVICEADDED: Symbol = symbol_short!("DeviceAdded");

// Symbol representing a removed event.
pub const DEVICEREMOVED: Symbol = symbol_short!("DeviceRemoved");

// Event data for when a device is added.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DeviceAddedEventData {
    pub device_id: BytesN<32>,
    pub public_key: BytesN<65>,
}

// Event data for when a device is removed.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DeviceRemovedEventData {
    pub device_id: BytesN<32>,
    pub public_key: BytesN<65>,
}

// Event data for when a recovery addresss is added.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RecoveryAddressAddedData {
    pub address: Address
}

// Event data for when a recovery is updated.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RecoveryAddressUpdatedData {
    pub address: Address
}

// Event data for when a recovery is updated.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AccountRecoveredEventData {
    pub device_id: BytesN<32>,
    pub public_key: BytesN<65>,
}