use crate::datatype::{GraduationNFT, NFTError, NFTMetadata};
// Note: String and Vec are soroban_sdk generic types (see datatype.rs for detailed explanation)
use soroban_sdk::{Address, Env, String, Vec};

/// Trait for creating and managing NFT metadata  
///  
/// Implementations should handle creation of properly formatted  
/// metadata for graduation NFTs with validation as needed.  
pub trait MetadataOperations {
    /// Creates NFT metadata with the specified attributes  
    ///  
    /// # Parameters  
    /// * `issued_at` - Timestamp when the NFT was issued  
    /// * `version` - Version string for the academy curriculum  
    /// * `badges` - List of badge identifiers earned by the user  
    fn create_nft_metadata(
        issued_at: u64,
        version: String,
        badges: Vec<String>,
    ) -> Result<NFTMetadata, NFTError>;
}

pub trait MintingOperations {
    fn mint_graduation_nft(env: &Env, recipient: Address) -> Result<GraduationNFT, NFTError>;
}

pub trait QueryOperations {
    fn get_graduation_nft(env: &Env, user: Address) -> Option<GraduationNFT>;
    fn has_graduation_nft(env: &Env, user: Address) -> bool;
}

/// Trait for handling NFT transfer operations  
/// For soulbound NFTs, implementations should reject all transfer  
/// attempts with appropriate error responses.  
pub trait DistributionOperations {
    /// Attempts to transfer a token between addresses  
    ///  
    /// For soulbound NFTs, this operation will always fail with  
    /// an appropriate error, as these tokens cannot be transferred.  
    fn attempt_transfer(from: Address, to: Address, token_id: u128) -> Result<(), NFTError>;
}
