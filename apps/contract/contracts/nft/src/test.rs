#![cfg(test)]
use crate::{
    KindfiNFT, 
    errors::NFTError,
};
use soroban_sdk::{
    testutils::{
        Address as _, AuthorizedFunction, AuthorizedInvocation, MockAuth, MockAuthInvoke,
    }, 
    vec, 
    Address, 
    Env, 
    String, 
    Vec, Symbol, IntoVal, auth::{Signature},
};
use stellar_constants::roles::DEFAULT_ADMIN_ROLE;
use crate::{
    access::{MINTER_ROLE, METADATA_MANAGER_ROLE},
    pausable::PauseOperation,
    types::NFTDetail,
};

// Test helper function to create a test environment with KindfiNFT contract
fn setup_test() -> (Env, KindfiNFT, Address, Address) {
    let env = Env::default();
    let contract_id = env.register_contract(None, KindfiNFT);
    let admin = Address::random(&env);
    let user = Address::random(&env);
    
    // Initialize the contract
    KindfiNFT::client(&env, &contract_id)
        .initialize(&admin)
        .unwrap();
    
    (env, KindfiNFT::client(&env, &contract_id), admin, user)
}

// Helper to create metadata attributes
fn create_test_attributes(env: &Env) -> Vec<String> {
    let mut attributes = Vec::new(env);
    attributes.push_back(String::from_str(env, "trait_type:color"));
    attributes.push_back(String::from_str(env, "value:red"));
    attributes
}

#[test]
fn test_initialize() {
    let (env, _, admin, _) = setup_test();
    
    // Verify the admin has the ADMIN_ROLE
    assert!(KindfiNFT::client(&env, &env.register_contract(None, KindfiNFT))
        .has_role(&DEFAULT_ADMIN_ROLE, &admin));
}

#[test]
fn test_mint_with_minter_role() {
    let (env, contract, admin, user) = setup_test();
    
    // Grant MINTER_ROLE to admin for testing
    env.mock_auth().with_no_verification().with_address(admin.clone())
        .run(|| {
            // For simplicity in test, we're not implementing real multi-sig - just direct grant
            contract.grant_role(&MINTER_ROLE, &admin, &Vec::new(&env));
        });
    
    // Mint as admin with MINTER_ROLE
    env.mock_auth().with_no_verification().with_address(admin.clone())
        .run(|| {
            contract.mint(
                &user, 
                &String::from_str(&env, "Test NFT"),
                &String::from_str(&env, "Test Description"),
                &create_test_attributes(&env),
            ).unwrap();
        });
    
    // Verify the NFT exists and belongs to the user
    let token_detail = contract.token_metadata(&0);
    assert_eq!(token_detail.owner, user);
    assert_eq!(token_detail.metadata.name, String::from_str(&env, "Test NFT"));
}

#[test]
fn test_mint_without_minter_role() {
    let (env, contract, _, user) = setup_test();
    
    // Try to mint as user without MINTER_ROLE
    let result = env.mock_auth().with_no_verification().with_address(user.clone())
        .run(|| {
            contract.mint(
                &user, 
                &String::from_str(&env, "Test NFT"),
                &String::from_str(&env, "Test Description"),
                &create_test_attributes(&env),
            )
        });
    
    // Should fail due to missing MINTER_ROLE
    assert!(result.is_err());
    
    match result.unwrap_err() {
        NFTError::NotAuthorized => { },
        e => panic!("Unexpected error: {:?}", e),
    }
}

#[test]
fn test_transfer() {
    let (env, contract, admin, user) = setup_test();
    
    // Grant MINTER_ROLE to admin
    env.mock_auth().with_no_verification().with_address(admin.clone())
        .run(|| {
            contract.grant_role(&MINTER_ROLE, &admin, &Vec::new(&env));
        });
    
    // Mint an NFT to admin
    env.mock_auth().with_no_verification().with_address(admin.clone())
        .run(|| {
            contract.mint(
                &admin, 
                &String::from_str(&env, "Test NFT"),
                &String::from_str(&env, "Test Description"),
                &create_test_attributes(&env),
            ).unwrap();
        });
    
    // Transfer from admin to user
    env.mock_auth().with_no_verification().with_address(admin.clone())
        .run(|| {
            contract.transfer(&admin, &user, &0).unwrap();
        });
    
    // Verify the NFT is now owned by the user
    let token_detail = contract.token_metadata(&0);
    assert_eq!(token_detail.owner, user);
}

#[test]
fn test_pause_and_unpause() {
    let (env, contract, admin, user) = setup_test();
    
    // Grant MINTER_ROLE to admin
    env.mock_auth().with_no_verification().with_address(admin.clone())
        .run(|| {
            contract.grant_role(&MINTER_ROLE, &admin, &Vec::new(&env));
        });
    
    // Pause minting
    env.mock_auth().with_no_verification().with_address(admin.clone())
        .run(|| {
            contract.pause(&PauseOperation::MintPause).unwrap();
        });
    
    // Try to mint while paused
    let result = env.mock_auth().with_no_verification().with_address(admin.clone())
        .run(|| {
            contract.mint(
                &user, 
                &String::from_str(&env, "Test NFT"),
                &String::from_str(&env, "Test Description"),
                &create_test_attributes(&env),
            )
        });
    
    // Should fail because minting is paused
    assert!(result.is_err());
    match result.unwrap_err() {
        NFTError::Paused => { },
        e => panic!("Unexpected error: {:?}", e),
    }
    
    // Unpause minting
    env.mock_auth().with_no_verification().with_address(admin.clone())
        .run(|| {
            contract.unpause(&PauseOperation::MintPause).unwrap();
        });
    
    // Mint now should succeed
    env.mock_auth().with_no_verification().with_address(admin.clone())
        .run(|| {
            contract.mint(
                &user, 
                &String::from_str(&env, "Test NFT"),
                &String::from_str(&env, "Test Description"),
                &create_test_attributes(&env),
            ).unwrap();
        });
    
    // Verify the NFT exists
    let token_detail = contract.token_metadata(&0);
    assert_eq!(token_detail.owner, user);
}

#[test]
fn test_role_management() {
    let (env, contract, admin, user) = setup_test();
    
    // Admin grants MINTER_ROLE to user
    env.mock_auth().with_no_verification().with_address(admin.clone())
        .run(|| {
            contract.grant_role(&MINTER_ROLE, &user, &Vec::new(&env)).unwrap();
        });
    
    // Verify user has MINTER_ROLE
    assert!(contract.has_role(&MINTER_ROLE, &user));
    
    // User tries to mint with their new role
    env.mock_auth().with_no_verification().with_address(user.clone())
        .run(|| {
            contract.mint(
                &user, 
                &String::from_str(&env, "User NFT"),
                &String::from_str(&env, "User Description"),
                &create_test_attributes(&env),
            ).unwrap();
        });
    
    // Verify the NFT exists
    let token_detail = contract.token_metadata(&0);
    assert_eq!(token_detail.owner, user);
    
    // Admin revokes MINTER_ROLE from user
    env.mock_auth().with_no_verification().with_address(admin.clone())
        .run(|| {
            contract.revoke_role(&MINTER_ROLE, &user, &Vec::new(&env)).unwrap();
        });
    
    // Verify user no longer has MINTER_ROLE
    assert!(!contract.has_role(&MINTER_ROLE, &user));
    
    // User tries to mint again, should fail
    let result = env.mock_auth().with_no_verification().with_address(user.clone())
        .run(|| {
            contract.mint(
                &user, 
                &String::from_str(&env, "User NFT 2"),
                &String::from_str(&env, "User Description"),
                &create_test_attributes(&env),
            )
        });
    
    // Should fail due to missing MINTER_ROLE
    assert!(result.is_err());
}

#[test]
fn test_metadata_update() {
    let (env, contract, admin, user) = setup_test();
    
    // Grant MINTER_ROLE to admin
    env.mock_auth().with_no_verification().with_address(admin.clone())
        .run(|| {
            contract.grant_role(&MINTER_ROLE, &admin, &Vec::new(&env));
        });
    
    // Grant METADATA_MANAGER_ROLE to admin
    env.mock_auth().with_no_verification().with_address(admin.clone())
        .run(|| {
            contract.grant_role(&METADATA_MANAGER_ROLE, &admin, &Vec::new(&env));
        });
    
    // Mint an NFT
    env.mock_auth().with_no_verification().with_address(admin.clone())
        .run(|| {
            contract.mint(
                &user, 
                &String::from_str(&env, "Original Name"),
                &String::from_str(&env, "Original Description"),
                &create_test_attributes(&env),
            ).unwrap();
        });
    
    // Update metadata
    env.mock_auth().with_no_verification().with_address(admin.clone())
        .run(|| {
            contract.update_metadata(
                &0,
                &String::from_str(&env, "Updated Name"),
                &String::from_str(&env, "Updated Description"),
                &create_test_attributes(&env),
            ).unwrap();
        });
    
    // Verify metadata was updated
    let token_detail = contract.token_metadata(&0);
    assert_eq!(token_detail.metadata.name, String::from_str(&env, "Updated Name"));
    assert_eq!(token_detail.metadata.description, String::from_str(&env, "Updated Description"));
}

#[test]
fn test_rate_limiting() {
    let (env, contract, admin, _) = setup_test();
    
    // Grant MINTER_ROLE to admin
    env.mock_auth().with_no_verification().with_address(admin.clone())
        .run(|| {
            contract.grant_role(&MINTER_ROLE, &admin, &Vec::new(&env));
        });
    
    // Set a very low rate limit for minting (1 mint per window)
    env.mock_auth().with_no_verification().with_address(admin.clone())
        .run(|| {
            contract.set_rate_limit(
                &String::from_str(&env, "mint"),
                &1,
                &1000,
            ).unwrap();
        });
    
    // First mint should succeed
    env.mock_auth().with_no_verification().with_address(admin.clone())
        .run(|| {
            contract.mint(
                &admin, 
                &String::from_str(&env, "NFT 1"),
                &String::from_str(&env, "Description"),
                &create_test_attributes(&env),
            ).unwrap();
        });
    
    // Second mint should fail due to rate limiting
    let result = env.mock_auth().with_no_verification().with_address(admin.clone())
        .run(|| {
            contract.mint(
                &admin, 
                &String::from_str(&env, "NFT 2"),
                &String::from_str(&env, "Description"),
                &create_test_attributes(&env),
            )
        });
    
    // Should fail due to rate limit
    assert!(result.is_err());
    match result.unwrap_err() {
        NFTError::RateLimitExceeded => { },
        e => panic!("Unexpected error: {:?}", e),
    }
} 