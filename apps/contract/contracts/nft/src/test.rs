#![cfg(test)]
use crate::{
    NFTContract, 
    errors::NFTError,
};
use soroban_sdk::{
    contract,
    testutils::{
        Address as _,
    }, 
    vec, 
    Address, 
    Env, 
    String, 
    Vec,
};

fn create_contract() -> (Env, Address) {
    let env = Env::default();
    let contract_id = env.register(NFTContract, ());
    (env, contract_id)
}

fn create_test_address(env: &Env) -> Address {
    Address::generate(&env)
}

#[test]
fn test_basic_flow() {
    let (env, contract_id) = create_contract();
    let admin = create_test_address(&env);
    let user = create_test_address(&env);

    // Initialize contract
    env.as_contract(&contract_id, || {
        NFTContract::initialize(env.clone(), admin.clone())
    }).unwrap();

    // Test minting
    let name = String::from_str(&env, "Test Token");
    let description = String::from_str(&env, "Test Description");
    let attributes: Vec<String> = vec![&env];

    env.mock_all_auths();
    
    let result = env.as_contract(&contract_id, || {
        NFTContract::mint(
            env.clone(),
            user.clone(),
            name.clone(),
            description.clone(),
            attributes.clone(),
        )
    });
    assert!(result.is_ok());

    // Verify token metadata
    let token_detail = env.as_contract(&contract_id, || {
        NFTContract::token_metadata(env.clone(), 0)
    });
    assert_eq!(token_detail.owner, user);
    assert_eq!(token_detail.metadata.name, name);
    assert_eq!(token_detail.metadata.description, description);
}

#[test]
fn test_admin_access_control() {
    let (env, contract_id) = create_contract();
    let admin = create_test_address(&env);
    let user = create_test_address(&env);

    // Initialize contract
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        NFTContract::initialize(env.clone(), admin.clone())
    }).unwrap();

    let name = String::from_str(&env, "Test Token");
    let description = String::from_str(&env, "Test Description");
    let attributes: Vec<String> = vec![&env];

    // Test minting without auth (should fail)
    env.as_contract(&contract_id, || {
        // Intentar mint sin autorización
        env.mock_auths(&[]);  // Establecer autorizaciones vacías
        let result = NFTContract::mint(
            env.clone(),
            user.clone(),
            name.clone(),
            description.clone(),
            attributes.clone(),
        );
        assert!(result.is_err());
    });
}

#[test]
fn test_transfer_ownership() {
    let (env, contract_id) = create_contract();
    let admin = create_test_address(&env);
    let owner = create_test_address(&env);
    let recipient = create_test_address(&env);

    // Initialize and mint
    env.as_contract(&contract_id, || {
        NFTContract::initialize(env.clone(), admin.clone())
    }).unwrap();

    let name = String::from_str(&env, "Test Token");
    let description = String::from_str(&env, "Test Description");
    let attributes: Vec<String> = vec![&env];

    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        NFTContract::mint(
            env.clone(),
            owner.clone(),
            name.clone(),
            description.clone(),
            attributes.clone(),
        )
    }).unwrap();

    // Test transfer
    env.mock_all_auths();
    let result = env.as_contract(&contract_id, || {
        NFTContract::transfer(
            env.clone(),
            owner.clone(),
            recipient.clone(),
            0,
        )
    });
    assert!(result.is_ok());

    // Verify ownership
    let token_detail = env.as_contract(&contract_id, || {
        NFTContract::token_metadata(env.clone(), 0)
    });
    assert_eq!(token_detail.owner, recipient);
}

#[test]
fn test_error_handling() {
    let (env, contract_id) = create_contract();
    let admin = create_test_address(&env);
    let user = create_test_address(&env);

    // Initialize contract
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        NFTContract::initialize(env.clone(), admin.clone())
    }).unwrap();

    // Test unauthorized minting
    env.as_contract(&contract_id, || {
        // Intentar mint sin autorización
        env.mock_auths(&[]);  // Establecer autorizaciones vacías
        let result = NFTContract::mint(
            env.clone(),
            user.clone(),
            String::from_str(&env, "Test Token"),
            String::from_str(&env, "Test Description"),
            vec![&env],
        );
        assert!(result.is_err());
    });

    // Test double initialization
    env.mock_all_auths();
    let result = env.as_contract(&contract_id, || {
        NFTContract::initialize(env.clone(), admin.clone())
    });
    assert!(matches!(result, Err(NFTError::AlreadyInitialized)));

    // Test non-existent token transfer
    env.mock_all_auths();
    let result = env.as_contract(&contract_id, || {
        NFTContract::transfer(
            env.clone(),
            user.clone(),
            admin.clone(),
            999,
        )
    });
    assert!(matches!(result, Err(NFTError::TokenNotFound)));
}


use crate::{
    interface::NFTContractTrait,
    errors::Error,
    types::{DataKey, TokenMetadata, TierLevel},
    metadata::*,
    nft_core::*,

};
use stellar_non_fungible::{Base};

#[contract]
struct MockContract;

#[test]
fn constructor_success() {
    let e = Env::default();
    let admin = Address::generate(&e);
    let base_uri = String::from_str(&e, "https://api.kindfi.com/nfts/");
    let name = String::from_str(&e, "KindFi NFT");
    let symbol = String::from_str(&e, "KIND");

    e.as_contract(&e.register(MockContract, ()), || {
        NFTCore::__constructor(e.clone(), admin.clone(), base_uri.clone(), name.clone(), symbol.clone());

        // Verify metadata was set
        let metadata = Base::get_metadata(&e);
        assert_eq!(metadata.base_uri, base_uri);
        assert_eq!(metadata.name, name);
        assert_eq!(metadata.symbol, symbol);

        // Verify admin was set
        let stored_admin: Address = e.storage().instance().get(&DataKey::Admin).unwrap();
        assert_eq!(stored_admin, admin);
    });
}

#[test]
fn mint_nft_success() {
    let e = Env::default();
    e.mock_all_auths();
    let admin = Address::generate(&e);
    let recipient = Address::generate(&e);
    let metadata_url = String::from_str(&e, "ipfs://test-metadata");

    e.as_contract(&e.register(MockContract, ()), || {
        // Initialize contract
        NFTCore::__constructor(
            e.clone(),
            admin.clone(),
            String::from_str(&e, "https://api.kindfi.com/nfts/"),
            String::from_str(&e, "KindFi NFT"),
            String::from_str(&e, "KIND"),
        );

        // Mint NFT
        let token_id = NFTCore::mint_nft(e.clone(), recipient.clone(), metadata_url.clone()).unwrap();

        // Verify token was minted
        assert_eq!(Base::balance(&e, &recipient), 1);
        assert_eq!(Base::owner_of(&e, token_id), recipient);

        // Verify metadata was stored
        let stored_metadata: TokenMetadata = e.storage().persistent().get(&DataKey::TokenMetadata(token_id)).unwrap();
        assert_eq!(stored_metadata.uri, metadata_url);

        // Verify events

    });
}

#[test]
#[should_panic(expected = "Error(Auth, InvalidAction)")]
fn mint_nft_unauthorized_fail() {
    let e = Env::default(); // Don't mock auths
    let admin = Address::generate(&e);
    let unauthorized = Address::generate(&e);
    let recipient = Address::generate(&e);

    e.as_contract(&e.register(MockContract, ()), || {
        // Initialize contract
        NFTCore::__constructor(
            e.clone(),
            admin.clone(),
            String::from_str(&e, "https://api.kindfi.com/nfts/"),
            String::from_str(&e, "KindFi NFT"),
            String::from_str(&e, "KIND"),
        );

        // Attempt to mint without admin auth
        NFTCore::mint_nft(e.clone(), recipient.clone(), String::from_str(&e, "ipfs://test")).unwrap();
    });
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn transfer_nonexistent_token_fail() {
    let e = Env::default();
    e.mock_all_auths();
    let from = Address::generate(&e);
    let to = Address::generate(&e);

    e.as_contract(&e.register(MockContract, ()), || {
        // Attempt to transfer non-existent token
        NFTCore::transfer_nft(e.clone(), from.clone(), to.clone(), 123);
    });
}

#[test]
fn burn_nft_success() {
    let e = Env::default();
    e.mock_all_auths();
    let admin = Address::generate(&e);
    let owner = Address::generate(&e);

    e.as_contract(&e.register(MockContract, ()), || {
        // Initialize contract
        NFTCore::__constructor(
            e.clone(),
            admin.clone(),
            String::from_str(&e, "https://api.kindfi.com/nfts/"),
            String::from_str(&e, "KindFi NFT"),
            String::from_str(&e, "KIND"),
        );

        // Mint first
        let token_id = NFTCore::mint_nft(e.clone(), owner.clone(), String::from_str(&e, "ipfs://test")).unwrap();

        // Burn
        NFTCore::burn(e.clone(), owner.clone(), token_id);

        // Verify burn
        assert_eq!(Base::balance(&e, &owner), 0);

        // Verify token no longer exists
        assert!(!e.storage().persistent().has(&DataKey::TokenMetadata(token_id)));

        // Verify events

    });
}

#[test]
fn metadata_operations_success() {
    let e = Env::default();
    e.mock_all_auths();
    let admin = Address::generate(&e);
    let owner = Address::generate(&e);
    let new_metadata = String::from_str(&e, "ipfs://updated-metadata");

    e.as_contract(&e.register(MockContract, ()), || {
        // Initialize contract
        NFTCore::__constructor(
            e.clone(),
            admin.clone(),
            String::from_str(&e, "https://api.kindfi.com/nfts/"),
            String::from_str(&e, "KindFi NFT"),
            String::from_str(&e, "KIND"),
        );

        // Mint first
        let token_id = NFTCore::mint_nft(e.clone(), owner.clone(), String::from_str(&e, "ipfs://initial")).unwrap();

        // Update metadata
        KindfiNFT::update_metadata(e.clone(), token_id, new_metadata.clone()).unwrap();

        // Verify update
        let stored_metadata = KindfiNFT::get_metadata(e.clone(), token_id).unwrap();
        assert_eq!(stored_metadata, new_metadata);

        // Verify last updated timestamp
        let last_updated: u64 = e.storage().instance().get(&DataKey::LastUpdated(token_id)).unwrap();
        assert!(last_updated > 0);

        // Verify events

    });
}

#[test]
fn tier_operations_success() {
    let e = Env::default();
    e.mock_all_auths();
    let admin = Address::generate(&e);
    let owner = Address::generate(&e);

    e.as_contract(&e.register(MockContract, ()), || {
        // Initialize contract
        NFTCore::__constructor(
            e.clone(),
            admin.clone(),
            String::from_str(&e, "https://api.kindfi.com/nfts/"),
            String::from_str(&e, "KindFi NFT"),
            String::from_str(&e, "KIND"),
        );

        // Mint first
        let token_id = NFTCore::mint_nft(e.clone(), owner.clone(), String::from_str(&e, "ipfs://test")).unwrap();

        // Verify default tier
        let default_tier = KindfiNFT::get_tier(e.clone(), token_id).unwrap();
        assert_eq!(default_tier, TierLevel::Wood);

        // Update tier
        KindfiNFT::update_tier(e.clone(), token_id, TierLevel::Gold).unwrap();

        // Verify update
        let updated_tier = KindfiNFT::get_tier(e.clone(), token_id).unwrap();
        assert_eq!(updated_tier, TierLevel::Gold);

        // Verify events

    });
}

#[test]
#[should_panic(expected = "Error(Contract, #101)")]
fn get_metadata_nonexistent_token_fail() {
    let e = Env::default();
    e.mock_all_auths();

    e.as_contract(&e.register(MockContract, ()), || {
        // Attempt to get metadata for non-existent token
        KindfiNFT::get_metadata(e.clone(), 123).expect_err("Should fail for non-existent token");
    });
}

#[test]
fn full_nft_lifecycle_success() {
    let e = Env::default();
    e.mock_all_auths();
    let admin = Address::generate(&e);
    let creator = Address::generate(&e);
    let collector = Address::generate(&e);
    let initial_metadata = String::from_str(&e, "ipfs://initial");
    let updated_metadata = String::from_str(&e, "ipfs://updated");

    e.as_contract(&e.register(MockContract, ()), || {
        // 1. Initialize contract
        NFTCore::__constructor(
            e.clone(),
            admin.clone(),
            String::from_str(&e, "https://api.kindfi.com/nfts/"),
            String::from_str(&e, "KindFi NFT"),
            String::from_str(&e, "KIND"),
        );

        // 2. Mint NFT
        let token_id = NFTCore::mint_nft(e.clone(), creator.clone(), initial_metadata.clone()).unwrap();

        // 3. Upgrade tier
        KindfiNFT::update_tier(e.clone(), token_id, TierLevel::Silver).unwrap();

        // 4. Transfer NFT
        NFTCore::transfer_nft(e.clone(), creator.clone(), collector.clone(), token_id);

        // 5. Update metadata (new owner)
        KindfiNFT::update_metadata(e.clone(), token_id, updated_metadata.clone()).unwrap();

        // 6. Burn NFT
        NFTCore::burn(e.clone(), collector.clone(), token_id);

        // Verify all expected events were emitted

    });
}
