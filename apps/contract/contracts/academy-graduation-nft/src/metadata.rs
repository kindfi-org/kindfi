use crate::{
    AcademyGraduationNFT,
    datatype::{NFTError, NFTMetadata},
    interface::MetadataOperations,
};
// Note: String and Vec are soroban_sdk generic types (see datatype.rs for detailed explanation)
use soroban_sdk::{String, Vec};

impl MetadataOperations for AcademyGraduationNFT {
    fn create_nft_metadata(
        issued_at: u64,
        version: String,
        badges: Vec<String>,
    ) -> Result<NFTMetadata, NFTError> {
        let metadata = NFTMetadata {
            issued_at,
            version,
            badges,
        };
        Ok(metadata)
    }
}
