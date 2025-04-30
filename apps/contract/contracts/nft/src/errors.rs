use soroban_sdk::contracterror;

// ##################
// Error Definitions
// ##################

/// Error codes for NFT contract operations.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    // Core errors (0-99)
    /// The caller is not authorized to perform this action.
    NotAuthorized = 0,
    NonexistentToken = 1,
    TransferToZeroAddress = 2,
    
    // Metadata errors (100-199)
    /// The metadata URL exceeds the maximum length.
    /// This is a placeholder value; the actual max length is defined by OpenZeppenlin contract.
    MetadataTooLong = 100,
    /// The metadata for the token is invalid.   
    InvalidMetadata = 101,
    /// The specified token does not exist.
    TokenNotFound = 3,
    
    // Tier errors (200-299)
    InvalidTier = 200,
    TierUpdateDisabled = 201,
    
    // Admin errors (300-399)
    MintDisabled = 300,
    ContractPaused = 301,
    
    // Math errors (400-499)
    Overflow = 400,
    Underflow = 401,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum NFTError {
    AlreadyInitialized = 1,
    NotAuthorized = 2,
    TokenNotFound = 3,
    NotTokenOwner = 4,
    TokenAlreadyExists = 5,
}


#[derive(Debug, PartialEq, Eq)]
pub enum NFTContractError {
    /// The contract has already been initialized.
    AlreadyInitialized,


    TokenNotFound,
    /// The caller is not the owner of the token.
    NotTokenOwner,
    /// Metadata for the token was not found.
    MetadataNotFound,
}