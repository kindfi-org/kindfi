#![cfg(test)]
use crate::{
    NFTContract, 
    errors::NFTError,
};
use soroban_sdk::{
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