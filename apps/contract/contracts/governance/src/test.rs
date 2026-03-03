#![cfg(test)]

extern crate std;

use super::*;
use soroban_sdk::{symbol_short, testutils::Address as _, Address, Env, String};

use crate::types::{RoundStatus, VoteType};

// ============================================================================
// Helpers
// ============================================================================

/// Deploy and initialize a fresh Governance contract.
fn setup_governance(env: &Env) -> (GovernanceClient, Address, Address) {
    let admin = Address::generate(env);
    let reputation = Address::generate(env);
    let contract = GovernanceClient::new(env, &env.register_contract(None, Governance));
    contract.__constructor(&admin, &reputation);
    (contract, admin, reputation)
}

/// Deploy and initialize a fresh Governance contract, grant admin role.
fn setup_with_admin_role(env: &Env) -> (GovernanceClient, Address, Address) {
    let (contract, admin, reputation) = setup_governance(env);
    // Grant admin the "admin" role so #[only_role] passes
    contract.grant_role(&admin, &admin, symbol_short!("admin"), &admin);
    (contract, admin, reputation)
}

// ============================================================================
// Initialization Tests
// ============================================================================

#[test]
fn test_constructor_stores_reputation_contract() {
    let env = Env::default();
    let (contract, _admin, reputation) = setup_governance(&env);

    let stored = contract.get_reputation_contract();
    assert_eq!(stored, Some(reputation));
}

#[test]
#[should_panic]
fn test_double_initialization_panics() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let reputation = Address::generate(&env);
    let contract = GovernanceClient::new(&env, &env.register_contract(None, Governance));
    contract.__constructor(&admin, &reputation);
    // Second call must panic with AlreadyInitialized
    contract.__constructor(&admin, &reputation);
}

// ============================================================================
// Round Management Tests
// ============================================================================

#[test]
fn test_create_round_returns_sequential_ids() {
    let env = Env::default();
    let (contract, admin, _reputation) = setup_with_admin_role(&env);

    let id0 = contract.create_round(
        &admin,
        &String::from_str(&env, "Round Alpha"),
        &100,
        &200,
        &0_i128,
    );
    let id1 = contract.create_round(
        &admin,
        &String::from_str(&env, "Round Beta"),
        &300,
        &400,
        &5_000_000_i128,
    );

    assert_eq!(id0, 0);
    assert_eq!(id1, 1);
}

#[test]
fn test_get_round_returns_correct_data() {
    let env = Env::default();
    let (contract, admin, _) = setup_with_admin_role(&env);

    let round_id = contract.create_round(
        &admin,
        &String::from_str(&env, "Test Round"),
        &500,
        &1000,
        &10_000_i128,
    );

    let round = contract.get_round(&round_id).expect("round should exist");
    assert_eq!(round.round_id, round_id);
    assert_eq!(round.fund_amount, 10_000_i128);
    assert_eq!(round.option_count, 0);
    assert!(round.winner_option_id.is_none());
}

#[test]
#[should_panic]
fn test_create_round_with_empty_title_panics() {
    let env = Env::default();
    let (contract, admin, _) = setup_with_admin_role(&env);
    contract.create_round(
        &admin,
        &String::from_str(&env, ""),
        &100,
        &200,
        &0_i128,
    );
}

#[test]
#[should_panic]
fn test_create_round_with_invalid_ledger_range_panics() {
    let env = Env::default();
    let (contract, admin, _) = setup_with_admin_role(&env);
    // start >= end should panic
    contract.create_round(
        &admin,
        &String::from_str(&env, "Bad Range"),
        &200,
        &100,
        &0_i128,
    );
}

// ============================================================================
// Option Management Tests
// ============================================================================

#[test]
fn test_add_option_increments_count() {
    let env = Env::default();
    let (contract, admin, _) = setup_with_admin_role(&env);

    let round_id = contract.create_round(
        &admin,
        &String::from_str(&env, "Fund Round"),
        &100,
        &9_999_999,
        &0_i128,
    );

    let opt0 = contract.add_option(&admin, &round_id, &String::from_str(&env, "Campaign A"));
    let opt1 = contract.add_option(&admin, &round_id, &String::from_str(&env, "Campaign B"));

    assert_eq!(opt0, 0);
    assert_eq!(opt1, 1);

    let round = contract.get_round(&round_id).unwrap();
    assert_eq!(round.option_count, 2);
}

#[test]
fn test_get_option_returns_correct_data() {
    let env = Env::default();
    let (contract, admin, _) = setup_with_admin_role(&env);

    let round_id = contract.create_round(
        &admin,
        &String::from_str(&env, "Round"),
        &100,
        &9_999_999,
        &0_i128,
    );
    let opt_id = contract.add_option(&admin, &round_id, &String::from_str(&env, "My Campaign"));

    let opt = contract.get_option(&round_id, &opt_id).unwrap();
    assert_eq!(opt.option_id, opt_id);
    assert_eq!(opt.round_id, round_id);
    assert_eq!(opt.upvote_weight, 0);
    assert_eq!(opt.downvote_weight, 0);
    assert_eq!(opt.vote_count, 0);
}

// ============================================================================
// NftTier Helpers Tests
// ============================================================================

#[test]
fn test_nft_tier_vote_weight_values() {
    assert_eq!(NftTier::Rookie.vote_weight(), 0);
    assert_eq!(NftTier::Bronze.vote_weight(), 1);
    assert_eq!(NftTier::Silver.vote_weight(), 3);
    assert_eq!(NftTier::Gold.vote_weight(), 5);
    assert_eq!(NftTier::Diamond.vote_weight(), 10);
}

#[test]
fn test_nft_tier_from_level_mapping() {
    assert_eq!(NftTier::from_level(0), NftTier::Rookie);
    assert_eq!(NftTier::from_level(1), NftTier::Bronze);
    assert_eq!(NftTier::from_level(2), NftTier::Silver);
    assert_eq!(NftTier::from_level(3), NftTier::Gold);
    assert_eq!(NftTier::from_level(4), NftTier::Diamond);
    assert_eq!(NftTier::from_level(99), NftTier::Rookie); // unknown → Rookie
}

// ============================================================================
// VoteType Enum Test
// ============================================================================

#[test]
fn test_vote_type_values() {
    // Just ensure the enum variants discriminants are stable
    assert_eq!(VoteType::Up as u32, 0);
    assert_eq!(VoteType::Down as u32, 1);
}

// ============================================================================
// Round Status Query Test
// ============================================================================

#[test]
fn test_get_round_status_upcoming() {
    let env = Env::default();
    let (contract, admin, _) = setup_with_admin_role(&env);

    // Current ledger on testutils starts at a low number; set future start_ledger
    let round_id = contract.create_round(
        &admin,
        &String::from_str(&env, "Future Round"),
        &9_000_000,
        &9_999_999,
        &0_i128,
    );

    let status = contract.get_round_status(&round_id).unwrap();
    assert_eq!(status, RoundStatus::Upcoming);
}

#[test]
fn test_get_round_status_nonexistent() {
    let env = Env::default();
    let (contract, _admin, _) = setup_with_admin_role(&env);
    let status = contract.get_round_status(&99_u32);
    assert!(status.is_none());
}

// ============================================================================
// Voter Count Test
// ============================================================================

#[test]
fn test_voter_count_starts_at_zero() {
    let env = Env::default();
    let (contract, admin, _) = setup_with_admin_role(&env);

    let round_id = contract.create_round(
        &admin,
        &String::from_str(&env, "Round"),
        &100,
        &9_999_999,
        &0_i128,
    );

    assert_eq!(contract.get_voter_count(&round_id), 0);
}

// ============================================================================
// get_vote returns None before voting
// ============================================================================

#[test]
fn test_get_vote_none_before_voting() {
    let env = Env::default();
    let (contract, admin, _) = setup_with_admin_role(&env);

    let round_id = contract.create_round(
        &admin,
        &String::from_str(&env, "Round"),
        &100,
        &9_999_999,
        &0_i128,
    );

    let voter = Address::generate(&env);
    let vote = contract.get_vote(&voter, &round_id);
    assert!(vote.is_none());
}
