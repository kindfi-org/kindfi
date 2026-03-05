use soroban_sdk::contracterror;

/// Error codes for the KindFi Governance contract.
/// Uses codes starting at 500 to avoid conflicts with other contracts.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Contract has already been initialized
    AlreadyInitialized = 500,
    /// Caller does not have the required role
    Unauthorized = 501,
    /// The governance round was not found
    RoundNotFound = 502,
    /// The governance option was not found
    OptionNotFound = 503,
    /// Voting is not open (round is upcoming or already ended)
    RoundNotActive = 504,
    /// Voter has already cast a vote in this round
    AlreadyVoted = 505,
    /// Voter does not hold a Kinders NFT (Rookie tier = ineligible)
    NotEligible = 506,
    /// Failed to query the Reputation contract for the voter's level
    ReputationQueryFailed = 507,
    /// Option does not belong to the specified round
    OptionNotInRound = 508,
    /// Round title must not be empty
    EmptyTitle = 509,
    /// start_ledger must be strictly before end_ledger
    InvalidLedgerRange = 510,
    /// Round has already ended; cannot add more options
    RoundAlreadyEnded = 511,
    /// Cannot close a round that has not yet ended (end_ledger not reached)
    RoundNotYetEnded = 512,
    /// Reputation contract address has not been configured
    ReputationContractNotSet = 513,
    /// Fund amount must be non-negative
    InvalidFundAmount = 514,
}
