#![cfg(test)]

use crate::datatypes::BadgeType;
use crate::events::{BADGE, BadgeMintedEventData};
use crate::{AcademyBadgeTracker, AcademyBadgeTrackerArgs, AcademyBadgeTrackerClient};
use soroban_sdk::{
    testutils::{Address as _, Events},
    vec, Address, Env, IntoVal, String,
};

mod progress {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32-unknown-unknown/release/academy_progress_tracker.wasm"
    );
}

// Macro to simplify event assertion across tests
macro_rules! assert_event {
    ($env:expr, $contract_id:expr, $topic:expr, $data:expr) => {
        assert_eq!(
            $env.events().all(),
            vec![
                &$env,
                (
                    $contract_id.clone(),
                    ($topic,).into_val(&$env),
                    $data.into_val(&$env)
                )
            ]
        );
    };
}

/// Helper function to set up environment, user and contract client for tests
// Generalized setup function for both contracts and user
fn setup<'a>() -> (Env, Address, Address, AcademyBadgeTrackerClient<'a>, progress::Client<'a>) {
    let env = Env::default();

    // Register progress tracker contract
    let progress_id = env.register(progress::WASM, ());
    let progress_client = progress::Client::new(&env, &progress_id);

    // Register badge tracker contract
    let badge_id = env.register(
        AcademyBadgeTracker,
        AcademyBadgeTrackerArgs::__constructor(&progress_id),
    );
    let badge_client = AcademyBadgeTrackerClient::new(&env, &badge_id);

    let user = Address::generate(&env);
    env.mock_all_auths();

    (env, user, badge_id, badge_client, progress_client)
}

/// Test minting a badge and retrieving it via get_user_badges
#[test]
fn test_mint_and_query_badge() {
    let (env, user, contract_id, badge_client, progress_client) = setup();

    progress_client.set_chapter_lessons(&1, &1);
    progress_client.mark_lesson_complete(&user, &1, &1);

    let metadata = String::from_str(&env, "{\"chapter\":1}");
    badge_client.mint_badge(&user, &BadgeType::Chapter, &1u32, &metadata);
    assert_event!(env, contract_id, BADGE, BadgeMintedEventData {
        user: user.clone(),
        badge: badge_client.get_user_badges(&user).get(0).unwrap()
    });

    let badges = badge_client.get_user_badges(&user);
    assert_eq!(badges.len(), 1);
    assert_eq!(badges.get(0).unwrap().badge_id, 1u32);
}

/// Test minting the same badge twice fails (should panic with AlreadyMinted)
#[test]
#[should_panic(expected = "HostError: Error(Contract, #1)")]
fn test_prevent_duplicate_badge() {
    let (env, user, contract_id, badge_client, _) = setup();
    let metadata = String::from_str(&env, "{}");

    badge_client.mint_badge(&user, &BadgeType::Quest, &42u32, &metadata);
    assert_event!(env, contract_id, BADGE, BadgeMintedEventData {
        user: user.clone(),
        badge: badge_client.get_user_badges(&user).get(0).unwrap()
    });
    badge_client.mint_badge(&user, &BadgeType::Quest, &42u32, &metadata); // Should panic
}

/// Test has_badge returns correct state before and after minting
#[test]
fn test_has_badge() {
    let (env, user, contract_id, badge_client, _) = setup();
    let metadata = String::from_str(&env, "{}");

    assert!(!badge_client.has_badge(&user, &BadgeType::Streak, &5u32));
    badge_client.mint_badge(&user, &BadgeType::Streak, &5u32, &metadata);
    assert_event!(env, contract_id, BADGE, BadgeMintedEventData {
        user: user.clone(),
        badge: badge_client.get_user_badges(&user).get(0).unwrap()
    });
    assert!(badge_client.has_badge(&user, &BadgeType::Streak, &5u32));
}

/// Test minting with an invalid reference ID (should panic)
#[test]
#[should_panic(expected = "HostError: Error(Contract, #2)")]
fn test_invalid_reference_id() {
    let (env, user, _, badge_client, _) = setup();
    let metadata = String::from_str(&env, "Invalid ref id");

    badge_client.mint_badge(&user, &BadgeType::Chapter, &0u32, &metadata); // Should panic
}

/// Test minting with empty metadata (should panic)
#[test]
#[should_panic(expected = "HostError: Error(Contract, #3)")]
fn test_invalid_metadata() {
    let (env, user, _, badge_client, _) = setup();
    let empty_metadata = String::from_str(&env, "");

    badge_client.mint_badge(&user, &BadgeType::Chapter, &1u32, &empty_metadata); // Should panic
}

/// Test minting different badges and verify they are stored correctly
#[test]
fn test_multiple_badges() {
    let (env, user, contract_id, badge_client, progress_client) = setup();

    progress_client.set_chapter_lessons(&1, &1);
    progress_client.mark_lesson_complete(&user, &1, &1);

    let meta1 = String::from_str(&env, "First badge");
    let meta2 = String::from_str(&env, "Second badge");

    badge_client.mint_badge(&user, &BadgeType::Chapter, &1u32, &meta1);
    assert_event!(env, contract_id, BADGE, BadgeMintedEventData {
        user: user.clone(),
        badge: badge_client.get_user_badges(&user).get(0).unwrap()
    });

    badge_client.mint_badge(&user, &BadgeType::Quest, &2u32, &meta2);
    assert_event!(env, contract_id, BADGE, BadgeMintedEventData {
        user: user.clone(),
        badge: badge_client.get_user_badges(&user).get(1).unwrap()
    });

    let badges = badge_client.get_user_badges(&user);
    assert_eq!(badges.len(), 2);
}

/// Test has_badge with multiple badge types
#[test]
fn test_has_badge_multiple() {
    let (env, user, contract_id, badge_client, _) = setup();

    let meta = String::from_str(&env, "Testing badge");
    badge_client.mint_badge(&user, &BadgeType::Quest, &99u32, &meta);
    assert_event!(env, contract_id, BADGE, BadgeMintedEventData {
        user: user.clone(),
        badge: badge_client.get_user_badges(&user).get(0).unwrap()
    });

    assert!(badge_client.has_badge(&user, &BadgeType::Quest, &99u32));
    assert!(!badge_client.has_badge(&user, &BadgeType::Chapter, &1u32));
}

/// Test minting a Chapter badge without completing progress (should panic)
#[test]
#[should_panic(expected = "HostError: Error(Contract, #4)")]
fn test_mint_without_progress_should_fail() {
    let (env, user, _, badge_client, progress_client) = setup();

    progress_client.set_chapter_lessons(&22, &1);

    let metadata = String::from_str(&env, "metadata");
    badge_client.mint_badge(&user, &BadgeType::Chapter, &22u32, &metadata);
}
