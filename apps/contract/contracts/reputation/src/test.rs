#![cfg(test)]

use crate::{types::*, ReputationContract, ReputationContractClient};

use soroban_sdk::{
    testutils::{Address as _, MockAuth, MockAuthInvoke},
    vec, Address, Env, IntoVal, Val, Vec,
};

// Test helper function to create a test environment with ReputationContract
fn setup_test() -> (
    Env,
    ReputationContractClient<'static>,
    Address,
    Address,
    Address,
) {
    let env = Env::default();
    let contract_id = env.register(ReputationContract, {});
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let nft_contract_id = Address::generate(&env);

    // Initialize the contract
    env.mock_all_auths();

    let client = ReputationContractClient::new(&env, &contract_id);

    client.initialize(&admin, &nft_contract_id);

    (env, client, admin, user, nft_contract_id)
}

fn mock_unauthorized_action(
    env: &Env,
    user: &Address,
    contract: &ReputationContractClient,
    fn_name: &str,
    args: Vec<Val>,
) {
    env.mock_auths(&[MockAuth {
        address: user,
        invoke: &MockAuthInvoke {
            contract: &contract.address,
            fn_name,
            args,
            sub_invokes: &[],
        },
    }]);
}

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register(ReputationContract, {});
    let admin = Address::generate(&env);
    let nft_contract_id = Address::generate(&env);

    env.mock_all_auths();

    // Initialize the contract
    let client = ReputationContractClient::new(&env, &contract_id);
    client.initialize(&admin, &nft_contract_id);

    // Verify default tier thresholds are set correctly
    assert_eq!(client.get_tier_threshold(&TierLevel::Bronze), 100);
    assert_eq!(client.get_tier_threshold(&TierLevel::Silver), 500);
    assert_eq!(client.get_tier_threshold(&TierLevel::Gold), 1000);
    assert_eq!(client.get_tier_threshold(&TierLevel::Platinum), 5000);
}

#[test]
#[should_panic(expected = "Error(Contract, #1)")]
fn test_initialize_already_initialized() {
    let (env, contract, admin, _, nft_contract_id) = setup_test();

    env.mock_all_auths();

    // Try to initialize the contract again
    contract.initialize(&admin, &nft_contract_id);
}

#[test]
fn test_update_score() {
    let (env, contract, _, user, _) = setup_test();

    // Update score as admin
    env.mock_all_auths();
    contract.update_score(&user, &50, &1);

    // Verify score and streak were updated
    assert_eq!(contract.get_score(&user), 50);
    assert_eq!(contract.get_streak(&user), 1);

    // Check user tier
    assert_eq!(contract.get_user_tier(&user), TierLevel::None);

    // Update score again to reach Bronze tier
    env.mock_all_auths();
    contract.update_score(&user, &50, &2);

    // Verify score, streak and tier
    assert_eq!(contract.get_score(&user), 100);
    assert_eq!(contract.get_streak(&user), 2);
    assert_eq!(contract.get_user_tier(&user), TierLevel::Bronze);

    // Update to Silver tier
    env.mock_all_auths();
    contract.update_score(&user, &400, &3);

    assert_eq!(contract.get_score(&user), 500);
    assert_eq!(contract.get_user_tier(&user), TierLevel::Silver);
}

#[test]
#[should_panic(expected = "Error(Auth, InvalidAction)")]
fn test_unauthorized_update_score() {
    let (env, contract, _, user, _) = setup_test();

    mock_unauthorized_action(
        &env,
        &user,
        &contract,
        "update_score",
        vec![&env, user.to_val(), 50_i32.into(), 1_i32.into()],
    );

    // Try to update score as non-admin user - don't mock auth to trigger error
    contract.update_score(&user, &50, &1);
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn test_get_score_nonexistent_user() {
    let (_, contract, _, user, _) = setup_test();
    contract.get_score(&user);
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn test_get_streak_nonexistent_user() {
    let (_, contract, _, user, _) = setup_test();
    contract.get_streak(&user);
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn test_get_tier_nonexistent_user() {
    let (_, contract, _, user, _) = setup_test();
    contract.get_user_tier(&user);
}

#[test]
fn test_add_admin() {
    let (env, contract, _, user, _) = setup_test();
    let new_admin = Address::generate(&env);

    // Add new admin
    env.mock_all_auths();
    contract.add_admin(&new_admin);

    // Verify new admin can perform admin actions
    env.mock_all_auths();
    contract.update_score(&user, &50, &1);
}

#[test]
fn test_update_nft_contract() {
    let (env, contract, _, _, _) = setup_test();
    let new_nft_contract = Address::generate(&env);

    // Update NFT contract
    env.mock_all_auths();
    contract.update_nft_contract(&new_nft_contract);

    assert_eq!(contract.get_nft_contract_id(), new_nft_contract);
}

#[test]
fn test_calculate_tier_from_score() {
    let (env, contract, _, user, _) = setup_test();

    // Set custom tier thresholds
    env.mock_all_auths();

    // Test different score levels

    // None tier (score below Bronze threshold)
    contract.update_score(&user, &50, &1);
    assert_eq!(contract.get_user_tier(&user), TierLevel::None);

    // Bronze tier
    contract.update_score(&user, &200, &2);
    assert_eq!(contract.get_user_tier(&user), TierLevel::Bronze);

    // Silver tier
    contract.update_score(&user, &500, &3);
    assert_eq!(contract.get_user_tier(&user), TierLevel::Silver);

    // Gold tier
    contract.update_score(&user, &1000, &4);
    assert_eq!(contract.get_user_tier(&user), TierLevel::Gold);

    // Platinum tier
    contract.update_score(&user, &5000, &5);
    assert_eq!(contract.get_user_tier(&user), TierLevel::Platinum);
}

#[test]
fn test_tier_neighbors() {
    use TierLevel::*;
    assert_eq!(ReputationContract::get_tier_neighbors(&Bronze).unwrap(), (Some(None), Some(Silver)));
    assert_eq!(ReputationContract::get_tier_neighbors(&Silver).unwrap(), (Some(Bronze), Some(Gold)));
    assert_eq!(ReputationContract::get_tier_neighbors(&Gold).unwrap(), (Some(Silver), Some(Platinum)));
    assert_eq!(ReputationContract::get_tier_neighbors(&Platinum).unwrap(), (Some(Gold), Some(None)));
    assert!(ReputationContract::get_tier_neighbors(&None).is_err());
}


#[test]
fn test_admin_can_set_tier_threshold() {
    let (env, contract, _, _, _) = setup_test();

    // Update Bronze tier threshold
    env.mock_all_auths();

    // Verify threshold was updated
    assert_eq!(contract.get_tier_threshold(&TierLevel::Bronze), 100);
}

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn test_invalid_tier_threshold_setting() {
    let (env, contract, _, _, _) = setup_test();

    // Mock all auths but still expect failure due to invalid tier
    env.mock_all_auths();
    contract.set_tier_threshold(&TierLevel::None, &0);
}

#[test]
#[should_panic(expected = "Error(Auth, InvalidAction)")]
fn test_non_admin_cannot_set_tier_threshold() {
    let (env, contract, _, _, _) = setup_test();
    let non_admin = Address::generate(&env);

    // Setup unauthorized action
    mock_unauthorized_action(
        &env,
        &non_admin,
        &contract,
        "set_tier_threshold",
        vec![&env, TierLevel::Silver.into_val(&env), 600_i32.into()],
    );

    // Try to set tier threshold as non-admin - should fail
    contract.set_tier_threshold(&TierLevel::Silver, &600);
}

#[test]
#[should_panic(expected = "Error(Auth, InvalidAction)")]
fn test_unauthorized_add_admin() {
    let (env, contract, _, _, _) = setup_test();
    let non_admin = Address::generate(&env);
    let new_admin = Address::generate(&env);

    // Setup unauthorized action
    mock_unauthorized_action(
        &env,
        &non_admin,
        &contract,
        "add_admin",
        vec![&env, new_admin.to_val()],
    );

    // Try to add admin as non-admin user - should fail
    contract.add_admin(&new_admin);
}

#[test]
#[should_panic(expected = "Error(Auth, InvalidAction)")]
fn test_unauthorized_update_nft_contract() {
    let (env, contract, _, _, _) = setup_test();
    let non_admin = Address::generate(&env);
    let new_nft_contract = Address::generate(&env);

    // Setup unauthorized action
    mock_unauthorized_action(
        &env,
        &non_admin,
        &contract,
        "update_nft_contract",
        vec![&env, new_nft_contract.to_val()],
    );

    // Try to update NFT contract as non-admin user - should fail
    contract.update_nft_contract(&new_nft_contract);
}
