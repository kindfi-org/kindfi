use soroban_sdk::contracterror;

#[contracterror]
#[derive(Debug, PartialEq)]
pub enum BadgeError {
    AlreadyMinted = 1,      // The badge has already been minted
    InvalidReferenceId = 2, // Reference ID is invalid (e.g., zero)
    InvalidMetadata = 3,    // Metadata is invalid (e.g., empty)
    ProgressNotCompleted = 4, // User has not completed the chapter
}
