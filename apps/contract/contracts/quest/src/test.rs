#![cfg(test)]

extern crate std;

use super::*;
use soroban_sdk::{symbol_short, testutils::Address as _, Address, Env, String};

#[test]
fn test_create_quest() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let reputation = Address::generate(&env);

    let quest_contract = env.register_contract(None, Quest);
    
    // Initialize
    quest_contract.__constructor(&admin, &reputation);

    // Create a quest
    let quest_id = quest_contract.create_quest(
        &admin,
        QuestType::MultiRegionDonation,
        String::from_str(&env, "Donate to 3 Regions"),
        String::from_str(&env, "Donate to campaigns in 3 different regions"),
        3,
        30,
        0, // No expiration
    );

    assert_eq!(quest_id, 0);

    // Get quest
    let quest = quest_contract.get_quest(quest_id).unwrap();
    assert_eq!(quest.quest_type, QuestType::MultiRegionDonation);
    assert_eq!(quest.target_value, 3);
    assert_eq!(quest.reward_points, 30);
    assert!(quest.is_active);
}

#[test]
fn test_update_progress() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let recorder = Address::generate(&env);
    let user = Address::generate(&env);
    let reputation = Address::generate(&env);

    let quest_contract = env.register_contract(None, Quest);
    
    // Initialize
    quest_contract.__constructor(&admin, &reputation);

    // Grant recorder role
    quest_contract.grant_role(&admin, &admin, symbol_short!("recorder"), &recorder);

    // Create a quest
    let quest_id = quest_contract.create_quest(
        &admin,
        QuestType::MultiRegionDonation,
        String::from_str(&env, "Donate to 3 Regions"),
        String::from_str(&env, "Donate to campaigns in 3 different regions"),
        3,
        30,
        0,
    );

    // Update progress
    let completed = quest_contract.update_progress(&recorder, &user, quest_id, 2);
    assert!(!completed);

    let progress = quest_contract.get_user_quest_progress(&user, quest_id).unwrap();
    assert_eq!(progress.current_value, 2);
    assert!(!progress.is_completed);

    // Complete quest
    let completed = quest_contract.update_progress(&recorder, &user, quest_id, 3);
    assert!(completed);

    let progress = quest_contract.get_user_quest_progress(&user, quest_id).unwrap();
    assert_eq!(progress.current_value, 3);
    assert!(progress.is_completed);
}
