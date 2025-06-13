use soroban_sdk::contracterror;

/// Enum representing the possible errors that can occur in the badge tracker.
#[contracterror]
#[derive(Debug, PartialEq)]
pub enum BadgeError {
    /// The badge has already been minted for this user and reference.
    AlreadyMinted = 1,
    /// The provided reference ID is invalid (e.g., zero or nonexistent).
    InvalidReferenceId = 2,
    /// The provided metadata is invalid (e.g., empty string or incorrect format).
    InvalidMetadata = 3,
    /// The user has not completed the required chapter to earn this badge.
    ProgressNotCompleted = 4,
    /// The progress tracker contract address is not set in storage.
    ProgressTrackerAddressNotSet = 5,
    /// The provided address is not a valid KindFi user (as per auth-controller).
    InvalidKindfiUserAddress = 6,
}
