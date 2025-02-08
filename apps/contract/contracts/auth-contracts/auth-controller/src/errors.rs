use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    SignerLimitExceeded = 100,
    UnknownSigner = 101,
    DefaultThresholdNotMet = 102,
    SignerDoesNotExist = 103,
    AlreadyInitialized = 104,
    InvalidThreshold = 105,
    SignerAlreadyAdded = 106,
    AccountThresholdNotMet = 107,
    DuplicateSignature = 108,
    AccountExists = 109,
    AccountDoesNotExist = 1010,
    FactoryExists = 1011,
    FactoryDoesNotExist = 1012,
    NotAllowedContract = 1013
}