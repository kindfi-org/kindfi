#![cfg(test)]

extern crate std;

use super::*;
use soroban_sdk::{symbol_short, testutils::Address as _, Address, Env, String};

/// Deploy Quest with `admin` as contract admin and holder of the "admin" role.
fn setup(env: &Env) -> (QuestClient<'_>, Address) {
    env.mock_all_auths();
    let admin = Address::generate(env);
    let reputation = Address::generate(env);
    let quest_contract = QuestClient::new(env, &env.register(Quest, (&admin, &reputation)));
    quest_contract.grant_role(&admin, &symbol_short!("admin"), &admin);
    (quest_contract, admin)
}

#[test]
fn test_create_quest() {
    let env = Env::default();
    let (quest_contract, admin) = setup(&env);

    // Create a quest
    let quest_id = quest_contract.create_quest(
        &admin,
        &QuestType::MultiRegionDonation,
        &String::from_str(&env, "Donate to 3 Regions"),
        &String::from_str(&env, "Donate to campaigns in 3 different regions"),
        &3,
        &30,
        &0, // No expiration
    );

    // Quest ids start at 1.
    assert_eq!(quest_id, 1);

    // Get quest
    let quest = quest_contract.get_quest(&quest_id).unwrap();
    assert_eq!(quest.quest_type, QuestType::MultiRegionDonation);
    assert_eq!(quest.target_value, 3);
    assert_eq!(quest.reward_points, 30);
    assert!(quest.is_active);
}

#[test]
fn test_update_progress() {
    let env = Env::default();
    let (quest_contract, admin) = setup(&env);
    let recorder = Address::generate(&env);
    let user = Address::generate(&env);

    // Grant recorder role
    quest_contract.grant_role(&recorder, &symbol_short!("recorder"), &admin);

    // Create a quest
    let quest_id = quest_contract.create_quest(
        &admin,
        &QuestType::MultiRegionDonation,
        &String::from_str(&env, "Donate to 3 Regions"),
        &String::from_str(&env, "Donate to campaigns in 3 different regions"),
        &3,
        &30,
        &0,
    );

    // Update progress
    let completed = quest_contract.update_progress(&recorder, &user, &quest_id, &2);
    assert!(!completed);

    let progress = quest_contract.get_user_quest_progress(&user, &quest_id).unwrap();
    assert_eq!(progress.current_value, 2);
    assert!(!progress.is_completed);

    // Complete quest
    let completed = quest_contract.update_progress(&recorder, &user, &quest_id, &3);
    assert!(completed);

    let progress = quest_contract.get_user_quest_progress(&user, &quest_id).unwrap();
    assert_eq!(progress.current_value, 3);
    assert!(progress.is_completed);
}
