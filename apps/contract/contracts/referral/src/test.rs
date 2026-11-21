#![cfg(test)]

extern crate std;

use super::*;
use soroban_sdk::{symbol_short, testutils::Address as _, Address, Env};

#[test]
fn test_create_referral() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let recorder = Address::generate(&env);
    let referrer = Address::generate(&env);
    let referred = Address::generate(&env);
    let reputation = Address::generate(&env);

    let referral_contract =
        ReferralClient::new(&env, &env.register(Referral, (&admin, &reputation)));

    // Grant recorder role
    referral_contract.grant_role(&recorder, &symbol_short!("recorder"), &admin);

    // Create referral
    referral_contract.create_referral(&recorder, &referrer, &referred);

    // Get referral
    let referral = referral_contract.get_referral(&referred).unwrap();
    assert_eq!(referral.referrer, referrer);
    assert_eq!(referral.referred, referred);
    assert_eq!(referral.status, ReferralStatus::Pending);
}
