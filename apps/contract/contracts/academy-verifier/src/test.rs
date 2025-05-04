#![cfg(test)]
use super::*;
use soroban_sdk::{log, map, testutils::Address as _, Bytes, Map, Symbol};

// Test Constants
const CHAPTER_1: u32 = 1;
const CHAPTER_2: u32 = 2;
const CHAPTER_3: u32 = 3;

#[test]
fn test_initialization() {
    let env = Env::default();
    let contract_id = env.register(AcademyVerifier, ());
    let client = AcademyVerifierClient::new(&env, &contract_id);

    // Create mock contract addresses
    let progress_tracker = Address::generate(&env);
    let graduation_nft = Address::generate(&env);
    let badge_tracker = Address::generate(&env);

    // Initialize the contract
    client.init(&progress_tracker, &badge_tracker, &graduation_nft);

    // Verify that addresses are stored correctly
    assert!(client.get_progress_tracker_address() == progress_tracker, "Progress tracker address mismatch");
    assert!(client.get_badge_tracker_address() == badge_tracker, "Badge tracker address mismatch");
    assert!(client.get_graduation_nft_address() == graduation_nft, "Graduation NFT address mismatch");
}

#[test]
fn test_full_verification_process() {
    let env = Env::default();
    
    // Register mock contracts
    let progress_tracker_id = env.register(MockProgressTracker, ());
    let badge_tracker_id = env.register(MockBadgeTracker, ());
    let graduation_nft_id = env.register(MockGraduationNFT, ());
    
    // Register verifier contract
    let contract_id = env.register(AcademyVerifier, ());
    let client = AcademyVerifierClient::new(&env, &contract_id);
    
    // Initialize the verifier contract
    client.init(&progress_tracker_id, &badge_tracker_id, &graduation_nft_id);
    
    // Setup users with different progress statuses
    let complete_user = Address::generate(&env);
    let partial_progress_user = Address::generate(&env);
    let no_nft_user = Address::generate(&env);
    let no_badges_user = Address::generate(&env);
    
    // Configure mock contract responses using initialization parameters
    let progress_tracker_client = MockProgressTrackerClient::new(&env, &progress_tracker_id);
    progress_tracker_client.setup_user_progress(&complete_user, &100, &true);
    progress_tracker_client.setup_user_progress(&partial_progress_user, &50, &true);
    progress_tracker_client.setup_user_progress(&no_nft_user, &100, &true);
    progress_tracker_client.setup_user_progress(&no_badges_user, &0, &false);
    
    let badge_tracker_client = MockBadgeTrackerClient::new(&env, &badge_tracker_id);
    badge_tracker_client.setup_user_badges(&complete_user, &true);
    badge_tracker_client.setup_user_badges(&partial_progress_user, &true);
    badge_tracker_client.setup_user_badges(&no_nft_user, &true);
    badge_tracker_client.setup_user_badges(&no_badges_user, &false);
    
    let graduation_nft_client = MockGraduationNFTClient::new(&env, &graduation_nft_id);
    graduation_nft_client.setup_user_nft(&complete_user, &true);
    graduation_nft_client.setup_user_nft(&partial_progress_user, &false);
    graduation_nft_client.setup_user_nft(&no_nft_user, &false);
    graduation_nft_client.setup_user_nft(&no_badges_user, &false);

    // Test verification for complete user (should pass all checks)
    let result = client.is_user_fully_certified(&complete_user);
    assert!(result.is_fully_certified, "Complete user should be certified");
    assert!(result.has_completely_progressed, "Complete user should have fully progressed");
    assert!(result.has_graduated, "Complete user should have graduation NFT");
    assert!(result.has_all_badges, "Complete user should have all badges");
    
    // Test verification for partial user (should fail certification)
    let result = client.is_user_fully_certified(&partial_progress_user);
    assert!(!result.is_fully_certified, "Partial progress user should not be certified");
    assert!(!result.has_completely_progressed, "Partial progress user should not have fully progressed");
    assert!(!result.has_graduated, "Partial progress user should not have graduation NFT");
    assert!(result.has_all_badges, "Partial progress user should have all badges");
    
    // Test verification for no-NFT user (should fail NFT check only)
    let result = client.is_user_fully_certified(&no_nft_user);
    assert!(!result.is_fully_certified, "No NFT user should not be certified");
    assert!(result.has_completely_progressed, "No NFT user should have fully progressed");
    assert!(!result.has_graduated, "No NFT user should not have graduation NFT");
    assert!(result.has_all_badges, "No NFT user should have all badges");
    
    // Test verification for no-progress user (should fail all checks)
    let result = client.is_user_fully_certified(&no_badges_user);
    assert!(!result.is_fully_certified, "No badges user should not be certified");
    assert!(!result.has_completely_progressed, "No badges user should not have fully progressed");
    assert!(!result.has_graduated, "No badges user should not have graduation NFT");
    assert!(!result.has_all_badges, "No badges user should not have all badges");
}

#[test]
fn test_individual_verification_components() {
    let env = Env::default();
    
    // Register mock contracts
    let progress_tracker_id = env.register(MockProgressTracker, ());
    let badge_tracker_id = env.register(MockBadgeTracker, ());
    let graduation_nft_id = env.register(MockGraduationNFT, ());
    
    // Register verifier contract
    let contract_id = env.register(AcademyVerifier, ());
    let client = AcademyVerifierClient::new(&env, &contract_id);
    
    // Initialize the verifier contract
    client.init(&progress_tracker_id, &badge_tracker_id, &graduation_nft_id);
    
    // Setup test users
    let user = Address::generate(&env);
    let no_prog_user = Address::generate(&env);
    
    // Configure mock contracts for testing
    let progress_tracker_client = MockProgressTrackerClient::new(&env, &progress_tracker_id);
    progress_tracker_client.setup_user_progress(&user, &100, &true);
    progress_tracker_client.setup_user_progress(&no_prog_user, &0, &false);
    
    let badge_tracker_client = MockBadgeTrackerClient::new(&env, &badge_tracker_id);
    badge_tracker_client.setup_user_badges(&user, &true);
    
    let graduation_nft_client = MockGraduationNFTClient::new(&env, &graduation_nft_id);
    graduation_nft_client.setup_user_nft(&user, &true);
    
    // Test individual verification components
    
    // Test is_user_fully_certified
    assert!(client.is_user_fully_certified(&user).is_fully_certified);
    assert!(!client.is_user_fully_certified(&no_prog_user).is_fully_certified);
    
    // Test get_user_progress
    let progress = client.get_user_progress(&user);
    assert_eq!(progress.len(), 3); // Should have 3 chapters
    assert_eq!(progress.get(CHAPTER_1).unwrap(), 5); // Chapter 1: 5 lessons
    
    let no_progress = client.get_user_progress(&no_prog_user);
    assert_eq!(no_progress.len(), 0); // Should have no progress
    
    // Test has_graduation_nft
    assert!(client.has_graduation_nft(&user));
    assert!(!client.has_graduation_nft(&no_prog_user));
    
    // Test get_user_badges
    let badges = client.get_user_badges(&user);
    assert_eq!(badges.len(), 2); // Should have 2 badges
    assert_eq!(badges.get_unchecked(0), Symbol::new(&env, "FIRST_STEPS"));
    
    // Test has_all_progress_badges
    assert!(client.has_all_progress_badges(&user));
    assert!(!client.has_all_progress_badges(&no_prog_user));
}

#[test]
fn test_read_only_behavior() {
    let env = Env::default();

    env.mock_all_auths();
    
    // Register mock contracts
    let progress_tracker_id = env.register(MockProgressTracker, ());
    let badge_tracker_id = env.register(MockBadgeTracker, ());
    let graduation_nft_id = env.register(MockGraduationNFT, ());
    
    // Register verifier contract
    let contract_id = env.register(AcademyVerifier, ());
    let client = AcademyVerifierClient::new(&env, &contract_id);
    
    // Initialize the verifier contract
    client.init(&progress_tracker_id, &badge_tracker_id, &graduation_nft_id);
    
    let user = Address::generate(&env);
    
    // Configure mock contracts
    let progress_tracker_client = MockProgressTrackerClient::new(&env, &progress_tracker_id);
    progress_tracker_client.setup_user_progress(&user, &100, &true);
    
    // Get instance storage state before operations
    let storage_snapshot = snapshot_instance_storage(&env, &contract_id);
    
    // Perform verification operations
    client.is_user_fully_certified(&user);
    client.get_user_progress(&user);
    client.has_graduation_nft(&user);
    client.get_user_badges(&user);
    
    // Get instance storage state after operations
    let storage_snapshot_after = snapshot_instance_storage(&env, &contract_id);
    
    // The contract instance storage should remain unchanged
    assert_eq!(storage_snapshot, storage_snapshot_after);
}

// Helper function to capture instance storage state
fn snapshot_instance_storage(env: &Env, contract_id: &Address) -> Map<Bytes, Bytes> {
    env.as_contract(contract_id, || {
        let storage = env.storage().instance();
        let keys = map![
            env,
            (Bytes::from_slice(env, b"ProgressTracker"), Bytes::from_slice(env, b"ProgressTracker")),
            (Bytes::from_slice(env, b"BadgeTracker"), Bytes::from_slice(env, b"BadgeTracker")),
            (Bytes::from_slice(env, b"GraduationNFT"), Bytes::from_slice(env, b"GraduationNFT"))
        ];
        
        let mut snapshot = Map::new(env);
        for (key, _) in keys.iter() {
            if let Some(value) = storage.get::<Bytes, Bytes>(&key) {
                snapshot.set(key.clone(), value.clone());
                log!(env, "Snapshot key: {}, value: {:?}", key, value);
            }
        }
        snapshot
    })
}

// Mock contracts with setup functions

#[contract]
struct MockProgressTracker;

#[contractimpl]
impl MockProgressTracker {
    pub fn setup_user_progress(env: Env, user: Address, completion_percent: u32, has_progress: bool) {
        // Retrieve existing map or create a new one
        let mut data: Map<Address, (u32, bool)> = env.storage().instance()
            .get(&Symbol::new(&env, "user_progress"))
            .unwrap_or_else(|| Map::new(&env));
        // Update the map with the user's data
        data.set(user, (completion_percent, has_progress));
        // Store the updated map
        env.storage().instance().set(&Symbol::new(&env, "user_progress"), &data);
        log!(&env, "Stored progress: percent={}, has_progress={}", completion_percent, has_progress);
    }
    
    pub fn get_user_progress(env: Env, user: Address) -> Map<u32, u32> {
        let data: Map<Address, (u32, bool)> = env.storage().instance()
            .get(&Symbol::new(&env, "user_progress"))
            .unwrap_or_else(|| Map::new(&env));
        let (_, has_progress) = data.get(user).unwrap_or((0, false));
        log!(&env, "Get progress: has_progress={}", has_progress);
        
        let mut progress = Map::new(&env);
        if has_progress {
            progress.set(CHAPTER_1, 5);
            progress.set(CHAPTER_2, 3);
            progress.set(CHAPTER_3, 2);
        }
        progress
    }
    
    pub fn get_chapter_completion_percent(env: Env, user: Address) -> u32 {
        let data: Map<Address, (u32, bool)> = env.storage().instance()
            .get(&Symbol::new(&env, "user_progress"))
            .unwrap_or_else(|| Map::new(&env));
        let (percent, has_progress) = data.get(user).unwrap_or((0, false));
        log!(&env, "Get completion: percent={}, has_progress={}", percent, has_progress);
        percent
    }

    pub fn debug_get_user_progress_data(env: Env, user: Address) -> Option<(u32, bool)> {
        let data: Map<Address, (u32, bool)> = env.storage().instance()
            .get(&Symbol::new(&env, "user_progress"))
            .unwrap_or_else(|| Map::new(&env));
        let result = data.get(user);
        log!(&env, "Debug get progress data: exists={}", result.is_some());
        result
    }
}

#[contract]
struct MockBadgeTracker;

#[contractimpl]
impl MockBadgeTracker {
    pub fn setup_user_badges(env: Env, user: Address, has_badges: bool) {
        let mut data: Map<Address, bool> = env.storage().instance()
            .get(&Symbol::new(&env, "user_badges"))
            .unwrap_or_else(|| Map::new(&env));
        data.set(user, has_badges);
        env.storage().instance().set(&Symbol::new(&env, "user_badges"), &data);
        log!(&env, "Stored badges: has_badges={}", has_badges);
    }

    pub fn get_user_badges(env: Env, user: Address) -> Vec<Symbol> {
        let data: Map<Address, bool> = env.storage().instance()
            .get(&Symbol::new(&env, "user_badges"))
            .unwrap_or_else(|| Map::new(&env));
        let has_badges = data.get(user).unwrap_or(false);
        log!(&env, "Get badges: has_badges={}", has_badges);
        
        let mut badges = Vec::new(&env);
        if has_badges {
            badges.push_back(Symbol::new(&env, "FIRST_STEPS"));
            badges.push_back(Symbol::new(&env, "ADVANCED_LEARNER"));
        }
        badges
    }
    
    pub fn has_badge(env: Env, user: Address, badge_type: Symbol, _chapter_id: u32) -> bool {
        let data: Map<Address, bool> = env.storage().instance()
            .get(&Symbol::new(&env, "user_badges"))
            .unwrap_or_else(|| Map::new(&env));
        let result = data.get(user).unwrap_or(false);
        log!(&env, "Check badge: badge_type={}, result={}", badge_type, result);
        result
    }
}

#[contract]
struct MockGraduationNFT;

#[contractimpl]
impl MockGraduationNFT {
    pub fn setup_user_nft(env: Env, user: Address, has_nft: bool) {
        let mut data: Map<Address, bool> = env.storage().instance()
            .get(&Symbol::new(&env, "user_nfts"))
            .unwrap_or_else(|| Map::new(&env));
        data.set(user, has_nft);
        env.storage().instance().set(&Symbol::new(&env, "user_nfts"), &data);
        log!(&env, "Stored NFT: has_nft={}", has_nft);
    }

    pub fn has_graduation_nft(env: Env, user: Address) -> bool {
        let data: Map<Address, bool> = env.storage().instance()
            .get(&Symbol::new(&env, "user_nfts"))
            .unwrap_or_else(|| Map::new(&env));
        let result = data.get(user).unwrap_or(false);
        log!(&env, "Get NFT: has_nft={}", result);
        result
    }
}
