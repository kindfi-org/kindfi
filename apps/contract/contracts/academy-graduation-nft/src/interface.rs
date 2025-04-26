use crate::GraduationNFT;
use crate::datatype::{NFTError, NFTMetadata};
use soroban_sdk::{Address, Env, String, Vec};

pub trait MetadataOperations {
    fn create_nft_metadata(
        issued_at: u64,
        version: String,
        badges: Vec<String>,
    ) -> Result<NFTMetadata, NFTError>;
}

pub trait MintingOperations {
    fn mint_graduation_nft(env: &Env, recipient: Address) -> Result<(), NFTError>;
}

pub trait QueryOperations {
    fn get_graduation_nft(env: &Env, user: Address) -> Option<GraduationNFT>;
    fn has_graduation_nft(env: &Env, user: Address) -> bool;
}

pub trait DistributionOperations {
    fn attempt_transfer(from: Address, to: Address, token_id: u128) -> Result<(), NFTError>;
}
