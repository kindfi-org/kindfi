#![cfg(test)]

use crate::badgetracker;
use crate::progresstracker;

use super::{
    AcademyGraduationNFT, AcademyGraduationNFTClient,
    datatype::{DataKeys, NFTError},
};
use soroban_sdk::{
    Address, Env, String, Vec,
    testutils::{Address as _, Ledger as _},
    vec,
};

fn create_test_env() -> (Env, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(AcademyGraduationNFT, ());
    (env, contract_id)
}

#[test]
fn test_initialize_success() {
    let (env, contract_id) = create_test_env();

    let progress_contract = env.register(progresstracker::WASM, ());

    let badge_contract = env.register(badgetracker::WASM, ());

    let client = AcademyGraduationNFTClient::new(&env, &contract_id);

    // Initialize
    let _result = client.try_initialize(&progress_contract, &badge_contract);

    env.as_contract(&contract_id, || {
        // Verify storage
        let stored_progress_tracker: Address = env
            .storage()
            .persistent()
            .get(&DataKeys::ProgressTracker)
            .unwrap();
        let stored_badge_tracker: Address = env
            .storage()
            .persistent()
            .get(&DataKeys::BadgeTracker)
            .unwrap();

        assert_eq!(stored_progress_tracker, progress_contract);

        assert_eq!(stored_badge_tracker, badge_contract);
    });
}

#[test]
fn test_initialize_already_initialized() {
    let (env, contract_id) = create_test_env();
    env.mock_all_auths();
    let progress_contract = env.register(progresstracker::WASM, ());
    let badge_contract = env.register(badgetracker::WASM, ());
    let client = AcademyGraduationNFTClient::new(&env, &contract_id);

    // First initialize - should succeed
    let result1 = client.try_initialize(&progress_contract, &badge_contract);
    assert_eq!(result1, Ok(Ok(())));

    // Second initialize - should return an error
    let result2 = client.try_initialize(&progress_contract, &badge_contract);
    assert_eq!(result2, Err(Ok(NFTError::AlreadyInitialized)));
}

#[test]
fn test_mint_success_full_badges() {
    let (env, contract_id) = create_test_env();
    let user = Address::generate(&env);
    let progress_contract = env.register(progresstracker::WASM, ());
    let badge_contract = env.register(badgetracker::WASM, ());
    let client = AcademyGraduationNFTClient::new(&env, &contract_id);
    let badge_client = badgetracker::Client::new(&env, &badge_contract);

    // Initialize
    let result = client.try_initialize(&progress_contract, &badge_contract);
    assert_eq!(result, Ok(Ok(())));

    // Set full badges for user
    let full_badges = vec![
        &env,
        String::from_str(&env, "MathMaster"),
        String::from_str(&env, "ScienceStar"),
        String::from_str(&env, "HistoryBuff"),
    ];
    badge_client.set_badges(&user, &full_badges.clone());

    // Set ledger timestamp
    env.ledger().with_mut(|l| l.timestamp = 1234567890);

    // Mint NFT
    let result = client.try_mint_graduation_nft(&user);
    assert!(result.is_ok(), "Expected Ok, got {:?}", result);
    let nft = result.unwrap().unwrap();
    assert_eq!(nft.owner, user);
    assert_eq!(nft.metadata.issued_at, 1234567890);
    assert_eq!(nft.metadata.version, String::from_str(&env, "v1.0"));
    assert_eq!(nft.metadata.badges, full_badges);
}

#[test]
fn test_mint_already_minted() {
    let (env, contract_id) = create_test_env();
    let user = Address::generate(&env);
    let progress_contract = env.register(progresstracker::WASM, ());
    let badge_contract = env.register(badgetracker::WASM, ());
    let client = AcademyGraduationNFTClient::new(&env, &contract_id);

    // Initialize
    let result = client.try_initialize(&progress_contract, &badge_contract);
    assert_eq!(result, Ok(Ok(())));

    // Mint first time
    let result = client.try_mint_graduation_nft(&user);
    assert!(result.is_ok(), "Expected Ok, got {:?}", result);

    // Attempt to mint again
    let result = client.try_mint_graduation_nft(&user);
    assert_eq!(result, Err(Ok(NFTError::AlreadyMinted)));
}

#[test]
fn test_mint_not_initialized() {
    let (env, contract_id) = create_test_env();
    let user = Address::generate(&env);
    let client = AcademyGraduationNFTClient::new(&env, &contract_id);

    // Attempt to mint without initialization
    let result = client.try_mint_graduation_nft(&user);
    assert_eq!(result, Err(Ok(NFTError::Uninitialized)));
}

#[test]
#[should_panic(expected = "Error(Auth, InvalidAction)")]
fn test_mint_unauthenticated() {
    let env = Env::default();
    let user = Address::generate(&env);
    let progress_contract = env.register(progresstracker::WASM, ());
    let badge_contract = env.register(badgetracker::WASM, ());
    let contract_id = env.register(AcademyGraduationNFT, ());
    let client = AcademyGraduationNFTClient::new(&env, &contract_id);

    // Mock all auths delibrately not called

    // Initialize
    client.initialize(&progress_contract, &badge_contract);

    // Attempt to mint without authentication
    client.mint_graduation_nft(&user);
}

#[test]
fn test_mint_not_completed() {
    let (env, contract_id) = create_test_env();
    let user = Address::generate(&env);
    let progress_contract = env.register(progresstracker::WASM, ());
    let badge_contract = env.register(badgetracker::WASM, ());
    let client = AcademyGraduationNFTClient::new(&env, &contract_id);
    let progress_client = progresstracker::Client::new(&env, &progress_contract);

    // Initialize
    let result = client.try_initialize(&progress_contract, &badge_contract);
    assert_eq!(result, Ok(Ok(())));

    // Set completion to false
    progress_client.set_completion(&user, &false);

    // Attempt to mint
    let result = client.try_mint_graduation_nft(&user);
    assert_eq!(result, Err(Ok(NFTError::NotCompleted)));
}

#[test]
fn test_mint_empty_badges() {
    let (env, contract_id) = create_test_env();
    let user = Address::generate(&env);
    let progress_contract = env.register(progresstracker::WASM, ());
    let badge_contract = env.register(badgetracker::WASM, ());
    let client = AcademyGraduationNFTClient::new(&env, &contract_id);

    // Initialize
    let result = client.try_initialize(&progress_contract, &badge_contract);
    assert_eq!(result, Ok(Ok(())));

    // Mint NFT (no badges set, so get_full_badges returns empty Vec)
    let result = client.try_mint_graduation_nft(&user);
    assert!(result.is_ok(), "Expected Ok, got {:?}", result);
    let nft = result.unwrap().unwrap();
    assert_eq!(nft.metadata.badges, Vec::new(&env));
}

#[test]
fn test_get_graduation_nft() {
    let (env, contract_id) = create_test_env();
    let user = Address::generate(&env);
    let progress_contract = env.register(progresstracker::WASM, ());
    let badge_contract = env.register(badgetracker::WASM, ());
    let client = AcademyGraduationNFTClient::new(&env, &contract_id);
    let badge_client = badgetracker::Client::new(&env, &badge_contract);

    // Initialize and mint
    let result = client.try_initialize(&progress_contract, &badge_contract);
    assert_eq!(result, Ok(Ok(())));

    // Set full badges for user
    let full_badges = vec![
        &env,
        String::from_str(&env, "MathMaster"),
        String::from_str(&env, "ScienceStar"),
        String::from_str(&env, "HistoryBuff"),
    ];
    badge_client.set_badges(&user, &full_badges.clone());

    let result = client.try_mint_graduation_nft(&user);
    assert!(result.is_ok(), "Expected Ok, got {:?}", result);

    // Get NFT
    let result = client.try_get_graduation_nft(&user);
    assert!(result.is_ok(), "Expected Ok, got {:?}", result);
    let inner_result = result.unwrap();
    assert!(inner_result.is_ok(), "Expected Ok, got {:?}", inner_result);
    let nft = inner_result.unwrap().unwrap();
    assert_eq!(nft.owner, user);
    assert_eq!(nft.metadata.badges.len(), 3);
}

#[test]
fn test_get_graduation_nft_none() {
    let (env, contract_id) = create_test_env();
    let user = Address::generate(&env);
    let progress_contract = env.register(progresstracker::WASM, ());
    let badge_contract = env.register(badgetracker::WASM, ());
    let client = AcademyGraduationNFTClient::new(&env, &contract_id);

    // Initialize but don't mint
    let result = client.try_initialize(&progress_contract, &badge_contract);
    assert_eq!(result, Ok(Ok(())));

    // Get non-existent NFT
    let result = client.try_get_graduation_nft(&user);
    assert_eq!(result, Ok(Ok(None)));
}

#[test]
fn test_has_graduation_nft() {
    let (env, contract_id) = create_test_env();
    let user = Address::generate(&env);
    let progress_contract = env.register(progresstracker::WASM, ());
    let badge_contract = env.register(badgetracker::WASM, ());
    let client = AcademyGraduationNFTClient::new(&env, &contract_id);

    // Initialize and mint
    let result = client.try_initialize(&progress_contract, &badge_contract);
    assert_eq!(result, Ok(Ok(())));
    let result = client.try_mint_graduation_nft(&user);
    assert!(result.is_ok(), "Expected Ok, got {:?}", result);

    // Check has NFT
    let has_nft = client.has_graduation_nft(&user);
    assert!(has_nft);

    // Check non-existent NFT
    let other_user = Address::generate(&env);
    let has_nft = client.has_graduation_nft(&other_user);
    assert!(!has_nft);
}

#[test]
fn test_attempt_transfer_fails() {
    let (env, contract_id) = create_test_env();
    let user = Address::generate(&env);
    let to = Address::generate(&env);
    let progress_contract = env.register(progresstracker::WASM, ());
    let badge_contract = env.register(badgetracker::WASM, ());
    let client = AcademyGraduationNFTClient::new(&env, &contract_id);

    // Initialize and mint
    let result = client.try_initialize(&progress_contract, &badge_contract);
    assert_eq!(result, Ok(Ok(())));
    let result = client.try_mint_graduation_nft(&user);
    assert!(result.is_ok(), "Expected Ok, got {:?}", result);

    // Attempt transfer
    let result = client.try_attempt_transfer(&user, &to, &1);
    assert_eq!(result, Err(Ok(NFTError::Soulbound)));
}

#[test]
fn test_mint_multiple_users() {
    let (env, contract_id) = create_test_env();
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let progress_contract = env.register(progresstracker::WASM, ());
    let badge_contract = env.register(badgetracker::WASM, ());
    let client = AcademyGraduationNFTClient::new(&env, &contract_id);

    // Initialize
    let result = client.try_initialize(&progress_contract, &badge_contract);
    assert_eq!(result, Ok(Ok(())));

    // Mint for user1
    env.ledger().with_mut(|l| l.timestamp = 1234567890);
    let result = client.try_mint_graduation_nft(&user1);
    assert!(result.is_ok(), "Expected Ok, got {:?}", result);
    let nft1 = result.unwrap().unwrap();
    assert_eq!(nft1.owner, user1);

    // Mint for user2
    env.ledger().with_mut(|l| l.timestamp = 1234567891);
    let result = client.try_mint_graduation_nft(&user2);
    assert!(result.is_ok(), "Expected Ok, got {:?}", result);
    let nft2 = result.unwrap().unwrap();
    assert_eq!(nft2.owner, user2);

    // Verify distinct NFTs
    assert_ne!(nft1.metadata.issued_at, nft2.metadata.issued_at);
}
