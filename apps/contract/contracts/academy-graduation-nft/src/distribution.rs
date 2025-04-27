use crate::{AcademyGraduationNFT, datatype::NFTError, interface::DistributionOperations};
use soroban_sdk::Address;

impl DistributionOperations for AcademyGraduationNFT {
    /// Transfer functionality - always fails since NFTs are soulbound

    fn attempt_transfer(from: Address, _to: Address, _token_id: u128) -> Result<(), NFTError> {
        from.require_auth();
        Err(NFTError::Soulbound)
    }
}
