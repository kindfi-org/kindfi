#![cfg(test)]
extern crate std;

use soroban_sdk::{symbol_short, testutils::Address as _, Address, Env, Map};

use crate::types::{EventType, Level, ThresholdType};
use crate::{Reputation, ReputationClient};

/// Helper to create a test environment with an initialized contract.
struct TestEnv {
    env: Env,
    admin: Address,
    client: ReputationClient<'static>,
}

impl TestEnv {
    fn new() -> Self {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);

        let contract_id = env.register(Reputation, (&admin, Option::<Address>::None));
        let client = ReputationClient::new(&env, &contract_id);

        TestEnv { env, admin, client }
    }

    fn new_with_nft(nft_contract: &Address) -> Self {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);

        let contract_id = env.register(Reputation, (&admin, Some(nft_contract.clone())));
        let client = ReputationClient::new(&env, &contract_id);

        TestEnv { env, admin, client }
    }

    fn grant_recorder_role(&self, account: &Address) {
        self.client
            .grant_role(account, &symbol_short!("recorder"), &self.admin);
    }

    fn grant_config_role(&self, account: &Address) {
        self.client
            .grant_role(account, &symbol_short!("config"), &self.admin);
    }
}

// ============================================================================
// Constructor Tests
// ============================================================================

#[test]
fn test_constructor_sets_admin() {
    let test = TestEnv::new();

    // Admin should be able to grant roles
    let recorder = Address::generate(&test.env);
    test.grant_recorder_role(&recorder);

    // Verify role was granted
    let has_role = test.client.has_role(&recorder, &symbol_short!("recorder"));
    assert!(has_role.is_some());
}

#[test]
fn test_constructor_with_nft_contract() {
    let env = Env::default();
    env.mock_all_auths();

    let nft_contract = Address::generate(&env);
    let _test = TestEnv::new_with_nft(&nft_contract);

    // Constructor should succeed with NFT contract
}

#[test]
fn test_initial_user_state() {
    let test = TestEnv::new();
    let user = Address::generate(&test.env);

    // New user should have 0 points
    assert_eq!(test.client.get_points(&user), 0);

    // New user should be at Rookie level (0)
    assert_eq!(test.client.get_level(&user), 0);
}

// ============================================================================
// Record Event Tests
// ============================================================================

#[test]
fn test_record_event_adds_points() {
    let test = TestEnv::new();
    let recorder = Address::generate(&test.env);
    let user = Address::generate(&test.env);

    test.grant_recorder_role(&recorder);

    // Record a donation event (default 10 points)
    let new_total = test.client.record_event(&recorder, &user, &EventType::Donation);

    assert_eq!(new_total, 10);
    assert_eq!(test.client.get_points(&user), 10);
}

#[test]
fn test_record_multiple_events() {
    let test = TestEnv::new();
    let recorder = Address::generate(&test.env);
    let user = Address::generate(&test.env);

    test.grant_recorder_role(&recorder);

    // Record multiple events
    test.client.record_event(&recorder, &user, &EventType::Donation); // 10 points
    test.client.record_event(&recorder, &user, &EventType::StreakDonation); // 25 points
    test.client.record_event(&recorder, &user, &EventType::SuccessfulReferral); // 50 points

    assert_eq!(test.client.get_points(&user), 85);
}

#[test]
fn test_record_event_with_custom_points() {
    let test = TestEnv::new();
    let recorder = Address::generate(&test.env);
    let user = Address::generate(&test.env);

    test.grant_recorder_role(&recorder);

    let new_total =
        test.client
            .record_event_with_points(&recorder, &user, &EventType::Donation, &100);

    assert_eq!(new_total, 100);
    assert_eq!(test.client.get_points(&user), 100);
}

#[test]
#[should_panic(expected = "Error(Contract, #404)")] // InvalidPoints
fn test_record_event_with_zero_points_fails() {
    let test = TestEnv::new();
    let recorder = Address::generate(&test.env);
    let user = Address::generate(&test.env);

    test.grant_recorder_role(&recorder);

    test.client
        .record_event_with_points(&recorder, &user, &EventType::Donation, &0);
}

#[test]
#[should_panic(expected = "Error(Contract, #2000)")] // Role check failure
fn test_record_event_without_role_fails() {
    let test = TestEnv::new();
    let unauthorized = Address::generate(&test.env);
    let user = Address::generate(&test.env);

    // Should fail - unauthorized doesn't have recorder role
    test.client
        .record_event(&unauthorized, &user, &EventType::Donation);
}

// ============================================================================
// Level Tests
// ============================================================================

#[test]
fn test_level_up_to_bronze() {
    let test = TestEnv::new();
    let recorder = Address::generate(&test.env);
    let user = Address::generate(&test.env);

    test.grant_recorder_role(&recorder);

    // Start at Rookie
    assert_eq!(test.client.get_level(&user), Level::Rookie.as_u32());

    // Add 200 points to reach Bronze (using custom points)
    test.client
        .record_event_with_points(&recorder, &user, &EventType::Donation, &200);

    assert_eq!(test.client.get_level(&user), Level::Bronze.as_u32());
}

#[test]
fn test_level_up_to_silver() {
    let test = TestEnv::new();
    let recorder = Address::generate(&test.env);
    let user = Address::generate(&test.env);

    test.grant_recorder_role(&recorder);

    // Add 500 points to reach Silver
    test.client
        .record_event_with_points(&recorder, &user, &EventType::Donation, &500);

    assert_eq!(test.client.get_level(&user), Level::Silver.as_u32());
}

#[test]
fn test_level_up_to_gold() {
    let test = TestEnv::new();
    let recorder = Address::generate(&test.env);
    let user = Address::generate(&test.env);

    test.grant_recorder_role(&recorder);

    // Add 1000 points to reach Gold
    test.client
        .record_event_with_points(&recorder, &user, &EventType::Donation, &1000);

    assert_eq!(test.client.get_level(&user), Level::Gold.as_u32());
}

#[test]
fn test_level_up_to_diamond() {
    let test = TestEnv::new();
    let recorder = Address::generate(&test.env);
    let user = Address::generate(&test.env);

    test.grant_recorder_role(&recorder);

    // Add 5000 points to reach Diamond
    test.client
        .record_event_with_points(&recorder, &user, &EventType::Donation, &5000);

    assert_eq!(test.client.get_level(&user), Level::Diamond.as_u32());
}

#[test]
fn test_calculate_level() {
    let test = TestEnv::new();

    assert_eq!(test.client.calculate_level(&0), Level::Rookie.as_u32());
    assert_eq!(test.client.calculate_level(&199), Level::Rookie.as_u32());
    assert_eq!(test.client.calculate_level(&200), Level::Bronze.as_u32());
    assert_eq!(test.client.calculate_level(&499), Level::Bronze.as_u32());
    assert_eq!(test.client.calculate_level(&500), Level::Silver.as_u32());
    assert_eq!(test.client.calculate_level(&999), Level::Silver.as_u32());
    assert_eq!(test.client.calculate_level(&1000), Level::Gold.as_u32());
    assert_eq!(test.client.calculate_level(&4999), Level::Gold.as_u32());
    assert_eq!(test.client.calculate_level(&5000), Level::Diamond.as_u32());
    assert_eq!(test.client.calculate_level(&10000), Level::Diamond.as_u32());
}

// ============================================================================
// Threshold Tests
// ============================================================================

#[test]
fn test_meets_threshold_voting() {
    let test = TestEnv::new();
    let recorder = Address::generate(&test.env);
    let user = Address::generate(&test.env);

    test.grant_recorder_role(&recorder);

    // Rookie user shouldn't meet voting threshold (requires Bronze)
    assert!(!test.client.meets_threshold(&user, &ThresholdType::Voting));

    // Level up to Bronze
    test.client
        .record_event_with_points(&recorder, &user, &EventType::Donation, &200);

    // Now should meet voting threshold
    assert!(test.client.meets_threshold(&user, &ThresholdType::Voting));
}

#[test]
fn test_meets_threshold_early_access() {
    let test = TestEnv::new();
    let recorder = Address::generate(&test.env);
    let user = Address::generate(&test.env);

    test.grant_recorder_role(&recorder);

    // Level up to Silver (500 points)
    test.client
        .record_event_with_points(&recorder, &user, &EventType::Donation, &500);

    // Should meet early access threshold (requires Silver)
    assert!(test
        .client
        .meets_threshold(&user, &ThresholdType::EarlyAccess));
}

#[test]
fn test_meets_threshold_exclusive_rounds() {
    let test = TestEnv::new();
    let recorder = Address::generate(&test.env);
    let user = Address::generate(&test.env);

    test.grant_recorder_role(&recorder);

    // Level up to Gold (1000 points)
    test.client
        .record_event_with_points(&recorder, &user, &EventType::Donation, &1000);

    // Should meet exclusive rounds threshold (requires Gold)
    assert!(test
        .client
        .meets_threshold(&user, &ThresholdType::ExclusiveRounds));
}

#[test]
fn test_meets_threshold_special_rewards() {
    let test = TestEnv::new();
    let recorder = Address::generate(&test.env);
    let user = Address::generate(&test.env);

    test.grant_recorder_role(&recorder);

    // Level up to Diamond (5000 points)
    test.client
        .record_event_with_points(&recorder, &user, &EventType::Donation, &5000);

    // Should meet special rewards threshold (requires Diamond)
    assert!(test
        .client
        .meets_threshold(&user, &ThresholdType::SpecialRewards));
}

// ============================================================================
// Configuration Tests
// ============================================================================

#[test]
fn test_set_level_thresholds() {
    let test = TestEnv::new();
    let config_user = Address::generate(&test.env);

    test.grant_config_role(&config_user);

    // Set new thresholds
    let mut thresholds: Map<u32, u32> = Map::new(&test.env);
    thresholds.set(Level::Bronze.as_u32(), 100); // Lower Bronze threshold
    thresholds.set(Level::Silver.as_u32(), 300);

    test.client.set_level_thresholds(&config_user, &thresholds);

    // Verify new thresholds
    assert_eq!(test.client.get_level_threshold(&Level::Bronze.as_u32()), 100);
    assert_eq!(test.client.get_level_threshold(&Level::Silver.as_u32()), 300);

    // Verify level calculation with new thresholds
    assert_eq!(test.client.calculate_level(&100), Level::Bronze.as_u32());
    assert_eq!(test.client.calculate_level(&300), Level::Silver.as_u32());
}

#[test]
fn test_set_event_point_values() {
    let test = TestEnv::new();
    let config_user = Address::generate(&test.env);
    let recorder = Address::generate(&test.env);
    let user = Address::generate(&test.env);

    test.grant_config_role(&config_user);
    test.grant_recorder_role(&recorder);

    // Set new event point values
    let mut event_points: Map<EventType, u32> = Map::new(&test.env);
    event_points.set(EventType::Donation, 50); // Increase donation points

    test.client
        .set_event_point_values(&config_user, &event_points);

    // Verify new point value
    assert_eq!(
        test.client.get_event_point_value(&EventType::Donation),
        50
    );

    // Record event should use new point value
    let points = test.client.record_event(&recorder, &user, &EventType::Donation);
    assert_eq!(points, 50);
}

#[test]
fn test_set_permission_threshold() {
    let test = TestEnv::new();
    let config_user = Address::generate(&test.env);
    let recorder = Address::generate(&test.env);
    let user = Address::generate(&test.env);

    test.grant_config_role(&config_user);
    test.grant_recorder_role(&recorder);

    // Set voting threshold to Rookie (anyone can vote)
    test.client.set_permission_threshold(
        &config_user,
        &ThresholdType::Voting,
        &Level::Rookie.as_u32(),
    );

    // New user (Rookie) should now meet voting threshold
    assert!(test.client.meets_threshold(&user, &ThresholdType::Voting));
}

#[test]
#[should_panic(expected = "Error(Contract, #2000)")] // Role check failure
fn test_set_level_thresholds_without_role_fails() {
    let test = TestEnv::new();
    let unauthorized = Address::generate(&test.env);

    let thresholds: Map<u32, u32> = Map::new(&test.env);

    test.client
        .set_level_thresholds(&unauthorized, &thresholds);
}

// ============================================================================
// Event History Tests
// ============================================================================

#[test]
fn test_get_user_events() {
    let test = TestEnv::new();
    let recorder = Address::generate(&test.env);
    let user = Address::generate(&test.env);

    test.grant_recorder_role(&recorder);

    // Record some events
    test.client.record_event(&recorder, &user, &EventType::Donation);
    test.client.record_event(&recorder, &user, &EventType::QuestCompletion);

    let events = test.client.get_user_events(&user);

    assert_eq!(events.len(), 2);
    assert_eq!(events.get(0).unwrap().event_type, EventType::Donation);
    assert_eq!(events.get(1).unwrap().event_type, EventType::QuestCompletion);
}

// ============================================================================
// NFT Integration Tests
// ============================================================================

#[test]
fn test_register_user_nft() {
    let test = TestEnv::new();
    let recorder = Address::generate(&test.env);
    let user = Address::generate(&test.env);

    test.grant_recorder_role(&recorder);

    // Initially no NFT registered
    assert!(test.client.get_user_nft_token_id(&user).is_none());

    // Register NFT
    test.client.register_user_nft(&recorder, &user, &42);

    // Verify registration
    assert_eq!(test.client.get_user_nft_token_id(&user), Some(42));
}

#[test]
fn test_set_nft_contract() {
    let test = TestEnv::new();
    let nft_contract = Address::generate(&test.env);

    // Admin can set NFT contract
    test.client.set_nft_contract(&test.admin, &nft_contract);
}

#[test]
#[should_panic(expected = "Error(Contract, #401)")] // Unauthorized
fn test_set_nft_contract_unauthorized_fails() {
    let test = TestEnv::new();
    let unauthorized = Address::generate(&test.env);
    let nft_contract = Address::generate(&test.env);

    test.client.set_nft_contract(&unauthorized, &nft_contract);
}

// ============================================================================
// Role Management Tests
// ============================================================================

#[test]
fn test_grant_and_revoke_role() {
    let test = TestEnv::new();
    let user = Address::generate(&test.env);

    // Grant recorder role
    test.grant_recorder_role(&user);
    assert!(test
        .client
        .has_role(&user, &symbol_short!("recorder"))
        .is_some());

    // Revoke recorder role
    test.client
        .revoke_role(&user, &symbol_short!("recorder"), &test.admin);
    assert!(test
        .client
        .has_role(&user, &symbol_short!("recorder"))
        .is_none());
}

#[test]
fn test_multiple_roles() {
    let test = TestEnv::new();
    let user = Address::generate(&test.env);

    // Grant multiple roles
    test.grant_recorder_role(&user);
    test.grant_config_role(&user);

    assert!(test
        .client
        .has_role(&user, &symbol_short!("recorder"))
        .is_some());
    assert!(test
        .client
        .has_role(&user, &symbol_short!("config"))
        .is_some());

    // User can now record events and update config
    let target_user = Address::generate(&test.env);
    test.client
        .record_event(&user, &target_user, &EventType::Donation);

    let thresholds: Map<u32, u32> = Map::new(&test.env);
    test.client.set_level_thresholds(&user, &thresholds);
}

// ============================================================================
// Default Values Tests
// ============================================================================

#[test]
fn test_default_event_point_values() {
    let test = TestEnv::new();

    assert_eq!(test.client.get_event_point_value(&EventType::Donation), 10);
    assert_eq!(
        test.client.get_event_point_value(&EventType::StreakDonation),
        25
    );
    assert_eq!(
        test.client
            .get_event_point_value(&EventType::SuccessfulReferral),
        50
    );
    assert_eq!(
        test.client
            .get_event_point_value(&EventType::NewCategoryDonation),
        15
    );
    assert_eq!(
        test.client
            .get_event_point_value(&EventType::NewCampaignDonation),
        5
    );
    assert_eq!(
        test.client
            .get_event_point_value(&EventType::QuestCompletion),
        30
    );
    assert_eq!(
        test.client.get_event_point_value(&EventType::BoostedProject),
        20
    );
    assert_eq!(
        test.client
            .get_event_point_value(&EventType::OutstandingBooster),
        100
    );
}

#[test]
fn test_default_level_thresholds() {
    let test = TestEnv::new();

    assert_eq!(test.client.get_level_threshold(&Level::Rookie.as_u32()), 0);
    assert_eq!(test.client.get_level_threshold(&Level::Bronze.as_u32()), 200);
    assert_eq!(test.client.get_level_threshold(&Level::Silver.as_u32()), 500);
    assert_eq!(test.client.get_level_threshold(&Level::Gold.as_u32()), 1000);
    assert_eq!(
        test.client.get_level_threshold(&Level::Diamond.as_u32()),
        5000
    );
}
