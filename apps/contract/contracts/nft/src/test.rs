#![cfg(test)]
use crate::{NFTContract, errors::NFTError};
use soroban_sdk::{
    testutils::Address as _, 
    vec, 
    Address, 
    Env, 
    String, 
    Vec,
};

fn create_contract() -> (Env, Address) {
    let env = Env::default();
    let contract_id = env.register_contract(None, NFTContract);
    (env, contract_id)
}

#[test]
fn test_basic_flow() {
    let (env, contract_id) = create_contract();
    let admin = Address::random(&env);
    let user = Address::random(&env);

    // Initialize contract
    env.as_contract(&contract_id, || {
        NFTContract::initialize(env.clone(), admin.clone())
    }).unwrap();

    // Test minting
    let name = String::from_str(&env, "Test Token");
    let description = String::from_str(&env, "Test Description");
    let attributes: Vec<String> = vec![&env];

    let result = env.as_contract(&contract_id, || {
        env.set_source(admin.clone());
        NFTContract::mint(
            env.clone(),
            user.clone(),
            name.clone(),
            description.clone(),
            attributes.clone(),
        )
    });
    assert!(result.is_ok());
}

#[test]
fn test_admin_access_control() {
    let (env, contract_id) = create_contract();
    let admin = Address::random(&env);
    let user = Address::random(&env);

    // Test initialization
    env.as_contract(&contract_id, || {
        NFTContract::initialize(env.clone(), admin.clone())
    }).unwrap();

    // Test minting as admin
    let name = String::from_str(&env, "Test Token");
    let description = String::from_str(&env, "Test Description");
    let attributes: Vec<String> = vec![&env];

    // Set admin as the transaction source
    let result = env.as_contract(&contract_id, || {
        env.set_source(admin.clone());
        NFTContract::mint(
            env.clone(),
            user.clone(),
            name.clone(),
            description.clone(),
            attributes.clone(),
        )
    });
    assert!(result.is_ok());

    // Test minting as non-admin (should fail)
    let result = env.as_contract(&contract_id, || {
        env.set_source(user.clone());
        NFTContract::mint(
            env.clone(),
            user.clone(),
            name.clone(),
            description.clone(),
            attributes.clone(),
        )
    });
    assert!(matches!(result, Err(NFTError::NotAuthorized)));
}

#[test]
fn test_transfer_ownership() {
    let (env, contract_id) = create_contract();
    let admin = Address::random(&env);
    let owner = Address::random(&env);
    let recipient = Address::random(&env);

    // Initialize contract
    env.as_contract(&contract_id, || {
        NFTContract::initialize(env.clone(), admin.clone())
    }).unwrap();

    // Mint token
    let name = String::from_str(&env, "Test Token");
    let description = String::from_str(&env, "Test Description");
    let attributes: Vec<String> = vec![&env];

    env.as_contract(&contract_id, || {
        env.set_source(admin.clone());
        NFTContract::mint(
            env.clone(),
            owner.clone(),
            name.clone(),
            description.clone(),
            attributes.clone(),
        )
    }).unwrap();

    // Test successful transfer
    let result = env.as_contract(&contract_id, || {
        env.set_source(owner.clone());
        NFTContract::transfer(
            env.clone(),
            owner.clone(),
            recipient.clone(),
            0,
        )
    });
    assert!(result.is_ok());

    // Test transfer of transferred token (should fail)
    let result = env.as_contract(&contract_id, || {
        env.set_source(owner.clone());
        NFTContract::transfer(
            env.clone(),
            owner.clone(),
            recipient.clone(),
            0,
        )
    });
    assert!(matches!(result, Err(NFTError::NotTokenOwner)));
}

#[test]
fn test_error_handling() {
    let (env, contract_id) = create_contract();
    let admin = Address::random(&env);
    let user = Address::random(&env);

    // Test double initialization
    env.as_contract(&contract_id, || {
        NFTContract::initialize(env.clone(), admin.clone())
    }).unwrap();

    let result = env.as_contract(&contract_id, || {
        NFTContract::initialize(env.clone(), admin.clone())
    });
    assert!(matches!(result, Err(NFTError::AlreadyInitialized)));

    // Test unauthorized minting
    let name = String::from_str(&env, "Test Token");
    let description = String::from_str(&env, "Test Description");
    let attributes: Vec<String> = vec![&env];

    let result = env.as_contract(&contract_id, || {
        env.set_source(user.clone());
        NFTContract::mint(
            env.clone(),
            user.clone(),
            name.clone(),
            description.clone(),
            attributes.clone(),
        )
    });
    assert!(matches!(result, Err(NFTError::NotAuthorized)));

    // Test transfer of non-existent token
    let result = env.as_contract(&contract_id, || {
        env.set_source(user.clone());
        NFTContract::transfer(
            env.clone(),
            user.clone(),
            admin.clone(),
            999,
        )
    });
    assert!(matches!(result, Err(NFTError::TokenNotFound)));
} 