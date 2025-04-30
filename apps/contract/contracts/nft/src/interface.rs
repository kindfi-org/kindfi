// NFT Contract Interface Definition
//
// This trait defines the interface for the NFT contract, including core NFT operations, metadata management,
// and KindFi-specific extensions. Each function is documented with parameter descriptions, expected behaviors, 
// authentication requirements, event emissions, and error codes.

use soroban_sdk::{Address, Env, String};
use crate::types::TierLevel;
use crate::errors::*;

/// NFT Contract Interface
pub trait NFTContractTrait {
    // ##################
    // Core NFT Operations
    // ##################
    
    /// Mints a new NFT to the specified address
    /// 
    /// # Arguments
    /// * `e` - The environment
    /// * `to` - Recipient address
    /// * `metadata_url` - Off-chain metadata URL (IPFS/HTTPS)
    /// 
    /// # Authentication
    /// Requires admin authorization
    /// 
    /// # Events
    /// Emits:
    /// * `mint(address to, u256 token_id, string metadata_url)`
    /// 
    /// # Errors
    /// * `Unauthorized` - If caller isn't admin
    /// * `TokenNotFound` - If token doesn't exist
    fn mint(
        e: Env,
        to: Address,
        metadata_url: String
    ) -> Result<u32, Error>;
    
    /// Transfers NFT between accounts
    ///
    /// # Arguments
    /// * `e` - The environment
    /// * `from` - Current owner address
    /// * `to` - New owner address  
    /// * `token_id` - NFT to transfer
    ///
    /// # Authentication  
    /// Requires `from` authorization
    ///
    /// # Events
    /// Emits:
    /// * `transfer(address from, address to, u256 token_id)`
    ///
    /// # Errors
    /// * `Unauthorized` - If caller isn't owner
    /// * `TokenNotFound` - If token doesn't exist
    fn transfer(
        e: Env,
        from: Address,
        to: Address,
        token_id: u32
    ) -> Result<(), Error>;
    
    /// Burns an existing NFT
    ///
    /// # Arguments
    /// * `e` - The environment
    /// * `from` - Current owner address
    /// * `token_id` - NFT to burn
    ///
    /// # Authentication
    /// Requires owner authorization
    ///
    /// # Events
    /// Emits:
    /// * `burn(address owner, u256 token_id)`
    ///
    /// # Errors
    /// * `Unauthorized` - If caller isn't owner/admin
    /// * `NonexistentToken` - If token doesn't exist
    fn burn(
        e: Env,
        from: Address,
        token_id: u32
    ) -> Result<(), Error>;
    
    // ####################
    // Metadata Operations
    // ####################
    
    /// Updates NFT metadata URL
    ///
    /// # Arguments
    /// * `e` - The environment
    /// * `token_id` - NFT to update
    /// * `metadata_url` - New metadata URL
    ///
    /// # Authentication
    /// Requires owner authorization
    ///
    /// # Events
    /// Emits: 
    /// * `metadata_update(u256 token_id, string new_url)`
    ///
    /// # Errors
    /// * `Unauthorized` - If caller isn't owner
    /// * `TokenNotFound` - If token doesn't exist
    fn update_metadata(
        e: Env,
        token_id: u32,
        metadata_url: String
    ) -> Result<(), Error>;
    
    /// Gets metadata URL for an NFT
    ///
    /// # Arguments
    /// * `e` - The environment
    /// * `token_id` - NFT to query
    ///
    /// # Errors
    /// * `TokenNotFound` - If token doesn't exist
    fn get_metadata(
        e: Env,
        token_id: u32
    ) -> Result<String, Error>;
    
    // #######################
    // KindFi-specific Features
    // #######################
    
    /// Updates NFT tier level
    ///
    /// # Arguments
    /// * `e` - The environment
    /// * `token_id` - NFT to update
    /// * `tier` - New tier level
    ///
    /// # Authentication
    /// Requires owner authorization
    ///
    /// # Events
    /// Emits:
    /// * `tier_update(u256 token_id, TierLevel new_tier)`
    ///
    /// # Errors
    /// * `Unauthorized` - If caller isn't owner
    /// * `TokenNotFound` - If token doesn't exist
    /// * `InvalidTier` - If tier is invalid
    fn update_tier(
        e: Env,
        token_id: u32,
        tier: TierLevel
    ) -> Result<(), Error>;
    
    /// Gets current tier for an NFT
    ///
    /// # Arguments
    /// * `e` - The environment
    /// * `token_id` - NFT to query
    ///
    /// # Errors
    /// * `TokenNotFound` - If token doesn't exist
    fn get_tier(
        e: Env,
        token_id: u32
    ) -> Result<TierLevel, Error>;
}
