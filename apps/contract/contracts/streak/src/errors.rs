use soroban_sdk::{contracterror, symbol_short, Symbol};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Contract has already been initialized
    AlreadyInitialized = 1,
    /// Unauthorized access
    Unauthorized = 2,
    /// Reputation contract not set
    ReputationContractNotSet = 3,
}

impl Error {
    pub fn to_symbol(&self) -> Symbol {
        match self {
            Error::AlreadyInitialized => symbol_short!("InitDone"),
            Error::Unauthorized => symbol_short!("Unauth"),
            Error::ReputationContractNotSet => symbol_short!("RepNotSet"),
        }
    }
}
