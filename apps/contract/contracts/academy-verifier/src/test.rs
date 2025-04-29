#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, vec, Map};

#[test]
fn test_initialization() {
    let env = Env::default();
    let contract_id = env.register_contract(None, AcademyVerifier);
    let client = AcademyVerifierClient::new(&env, &contract_id);

    // Create mock contract addresses
    let progress_tracker = Address::random(&env);
    let graduation_nft = Address::random(&env);
    let badge_tracker = Address::random(&env);

    // Initialize the contract
    client.init(&progress_tracker, &graduation_nft, &badge_tracker);

    // Verify that re-initialization fails
    let result = std::panic::catch_unwind(|| {
        client.init(&progress_tracker, &graduation_nft, &badge_tracker);
    });
    assert!(result.is_err());
}

#[test]
fn test_eligibility_verification() {
    let env = Env::default();
    let contract_id = env.register_contract(None, AcademyVerifier);
    let client = AcademyVerifierClient::new(&env, &contract_id);

    // Create mock contract addresses
    let progress_tracker = env.register_contract(None, MockProgressTracker);
    let graduation_nft = env.register_contract(None, MockGraduationNFT);
    let badge_tracker = env.register_contract(None, MockBadgeTracker);

    // Initialize the verifier contract
    client.init(&progress_tracker, &graduation_nft, &badge_tracker);

    // Setup test user
    let user = Address::random(&env);

    // Test user eligibility
    let is_eligible = client.is_user_eligible(&user);
    
    // This will depend on what the mock contracts return
    // In this example, we expect the user to be eligible
    assert!(is_eligible);
    
    // Test individual components
    let is_certified = client.is_user_fully_certified(&user);
    assert!(is_certified);
    
    let has_nft = client.has_graduation_nft(&user);
    assert!(has_nft);
    
    let badges = client.get_user_badges(&user);
    assert!(!badges.is_empty());
}

// Mock contract implementations for testing

#[contract]
struct MockProgressTracker;

#[contractimpl]
impl MockProgressTracker {
    pub fn get_user_progress(env: Env, _user: Address) -> Map<u32, u32> {
        let mut progress = Map::new(&env);
        // Add mock progress data
        progress.set(1, 5); // Chapter 1: 5 lessons
        progress.set(2, 3); // Chapter 2: 3 lessons
        progress
    }
}

#[contract]
struct MockGraduationNFT;

#[contractimpl]
impl MockGraduationNFT {
    pub fn has_graduation_nft(_env: Env, _user: Address) -> bool {
        // For testing, assume user has the NFT
        true
    }
}

#[contract]
struct MockBadgeTracker;

#[contractimpl]
impl MockBadgeTracker {
    pub fn get_user_badges(env: Env, _user: Address) -> Vec<Symbol> {
        // Return mock badge data
        vec![
            &env,
            Symbol::new(&env, "FIRST_STEPS"),
            Symbol::new(&env, "ADVANCED_LEARNER"),
        ]
    }
}