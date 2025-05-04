use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
pub enum Error {
    AlreadyInitialized = 1,
    ContractNotInitialized = 2,
    InvalidContractAddress = 3,
    InvalidUserAddress = 4,
    ProgressTrackerNotFound = 5,
    GraduationNFTNotFound = 6,
    BadgeTrackerNotFound = 7,
    UnauthorizedAccess = 8,
}
