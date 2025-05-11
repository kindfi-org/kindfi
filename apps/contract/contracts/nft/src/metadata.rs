use soroban_sdk::{contract, contractimpl, Address, Env, String};
use crate::{
    nft_core::NFTCore,
    types::{DataKey, TokenMetadata, TierLevel},
    errors::Error,
    events::*,
};
use stellar_non_fungible::{Base, NonFungibleToken};

#[contract]
pub struct KindfiNFT;

#[contractimpl]
impl KindfiNFT {
    // Core operations
    fn mint(e: Env, to: Address, metadata_url: String) -> Result<u32, Error> {
        // Verify admin authorization
        let admin: Address = e.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        // Mint through core contract
        let token_id: u32 = NFTCore::mint_nft(e.clone(), to.clone(), metadata_url.clone()).unwrap();
        
        // Store default tier and timestamp
        e.storage().instance().set(&DataKey::LastUpdated(token_id), &e.ledger().timestamp());
        e.storage().instance().set(&DataKey::Tier(token_id), &TierLevel::Wood);

        emit_mint(&e, to, token_id, metadata_url);
        
        Ok(token_id)
    }

    // Metadata operations
    pub fn update_metadata(e: Env, token_id: u32, metadata_url: String) -> Result<(), Error> {
        // Verify admin or owner
        let owner = Base::owner_of(&e, token_id);
        owner.require_auth();

        // Verify token exists
        if !e.storage().instance().has(&DataKey::TokenMetadata(token_id)) {
            return Err(Error::TokenNotFound);
        }

        // Update metadata
        e.storage().instance().set(&DataKey::TokenMetadata(token_id),
            &TokenMetadata {
                uri: metadata_url.clone()
            }
        );
        e.storage().instance().set(&DataKey::LastUpdated(token_id), &e.ledger().timestamp());

        emit_metadata_update(e, token_id, metadata_url);
        Ok(())
    }

    pub fn get_metadata(e: Env, token_id: u32) -> Result<String, Error> {
        if let Some(metadata) = e.storage()
            .persistent()
            .get::<_, TokenMetadata>(&DataKey::TokenMetadata(token_id)) 
        {
            Ok(metadata.uri)
        } else {
            Err(Error::TokenNotFound)
        }
    }

    // Tier operations
    pub fn update_tier(e: Env, token_id: u32, tier: TierLevel) -> Result<(), Error> {
        // Verify admin or owner
        let owner = Base::owner_of(&e, token_id);
        owner.require_auth();

        // Verify token exists
        if !e.storage().instance().has(&DataKey::TokenMetadata(token_id)) {
            return Err(Error::TokenNotFound);
        }

        // Update tier
        e.storage().instance().set(&DataKey::Tier(token_id), &tier);
        e.storage().instance().set(&DataKey::LastUpdated(token_id), &e.ledger().timestamp());

        emit_tier_update(e, token_id, tier);
        Ok(())
    }

    pub fn get_tier(e: Env, token_id: u32) -> Result<TierLevel, Error> {
        if let Some(tier) = e.storage()
            .persistent()
            .get::<_, TierLevel>(&DataKey::Tier(token_id)) 
        {
            Ok(tier)
        } else {
            Err(Error::TokenNotFound)
        }
    }
}

// // Unit Tests
// #[cfg(test)]
// mod tests {
//     use super::*;
//     use soroban_sdk::{testutils::Address as _, Env};

//     #[test]
//     fn test_metadata_management() {
//         let env = Env::default();
//         let admin = Address::generate(&env);
//         let user = Address::generate(&env);
        
//         let contract = KindfiNFT::new(&env);
//         contract.initialize(
//             &env,
//             admin.clone(),
//             String::from_str(&env, "https://api.kindfi.com/nfts/"),
//             String::from_str(&env, "KindFi NFT"),
//             String::from_str(&env, "KIND")
//         );

//         // Test mint with metadata
//         admin.require_auth();
//         let metadata = NFTMetadata {
//             name: String::from_str(&env, "Test NFT"),
//             description: String::from_str(&env, "Description"),
//             asset_uri: String::from_str(&env, "ipfs://test"),
//             external_url: String::from_str(&env, "https://kindfi.com/nft/1"),
//             attributes: vec![],
//             related_nfts: vec![]
//         };
        
//         let token_id = contract.mint(
//             &env,
//             user.clone(),
//             metadata.clone(),
//             TierLevel::Silver
//         ).unwrap();
        
//         // Verify metadata
//         let stored_metadata = contract.get_metadata(&env, token_id).unwrap();
//         assert_eq!(stored_metadata.name, metadata.name);
        
//         // Test tier update
//         contract.update_tier(&env, token_id, TierLevel::Gold).unwrap();
//         assert_eq!(contract.get_tier(&env, token_id).unwrap(), TierLevel::Gold);
//     }
// }