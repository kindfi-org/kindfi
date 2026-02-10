#![cfg(test)]

extern crate std;

use super::*;
use soroban_sdk::{symbol_short, testutils::Address as _, Address, Env};

#[test]
fn test_create_streak() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let recorder = Address::generate(&env);
    let user = Address::generate(&env);
    let reputation = Address::generate(&env);

    let streak_contract = env.register_contract(None, Streak);
    
    // Initialize
    streak_contract.__constructor(&admin, &reputation);

    // Grant recorder role
    streak_contract.grant_role(&admin, &admin, symbol_short!("recorder"), &recorder);

    // Record first donation
    let streak = streak_contract.record_donation(
        &recorder,
        &user,
        StreakPeriod::Weekly,
        env.ledger().timestamp(),
    );

    assert_eq!(streak, 1);

    // Get streak
    let streak_info = streak_contract.get_streak(&user, StreakPeriod::Weekly).unwrap();
    assert_eq!(streak_info.current_streak, 1);
    assert_eq!(streak_info.longest_streak, 1);
}
