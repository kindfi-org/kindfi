#![cfg(test)]

use soroban_sdk::{
    testutils::Address as _,
    Address, Env,
};
use crate::testutils::{register_test_contract, ProgressTrackerClient};

#[test]
fn test_basic_progress() {
    // 1. Setup environment
    let env = Env::default();
    // Mock all authorizations for this test
    env.mock_all_auths();
    let contract_id = register_test_contract(&env);
    let client = ProgressTrackerClient::new(&env, &contract_id);

    // 2. Create admin and user addresses
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let chapter_id = 1;
    let lesson_id = 1;

    // 3. Configure chapter with one lesson (authorized as admin)
    client.set_chapter_lessons(&admin, &chapter_id, &1);

    // 4. Mark lesson as completed by user
    client.mark_lesson_complete(&user, &chapter_id, &lesson_id);

    // 5. Verify lesson is in completed list
    let completed = client.get_completed_lessons(&user, &chapter_id);
    assert_eq!(completed.len(), 1);
    assert_eq!(completed.get(0).unwrap(), lesson_id);
} 