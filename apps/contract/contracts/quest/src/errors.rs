use soroban_sdk::{contracterror, symbol_short, Symbol};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Contract has already been initialized
    AlreadyInitialized = 1,
    /// Unauthorized access
    Unauthorized = 2,
    /// Quest not found
    QuestNotFound = 3,
    /// Quest already completed
    QuestAlreadyCompleted = 4,
    /// Quest expired
    QuestExpired = 5,
    /// Quest not active
    QuestNotActive = 6,
    /// Invalid quest parameters
    InvalidQuestParams = 7,
    /// Reputation contract not set
    ReputationContractNotSet = 8,
}

impl Error {
    pub fn to_symbol(&self) -> Symbol {
        match self {
            Error::AlreadyInitialized => symbol_short!("InitDone"),
            Error::Unauthorized => symbol_short!("Unauth"),
            Error::QuestNotFound => symbol_short!("NotFound"),
            Error::QuestAlreadyCompleted => symbol_short!("Completed"),
            Error::QuestExpired => symbol_short!("Expired"),
            Error::QuestNotActive => symbol_short!("NotActive"),
            Error::InvalidQuestParams => symbol_short!("Invalid"),
            Error::ReputationContractNotSet => symbol_short!("RepNotSet"),
        }
    }
}
