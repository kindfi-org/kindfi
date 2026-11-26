#![cfg(test)]
extern crate std;

use rand::rngs::OsRng;
use rand::RngCore;

use soroban_sdk::{testutils::Address as _, Address, BytesN, Env};

use crate::{AccountFactory, AccountFactoryClient};

fn gen_random_bytes<const N: usize>(env: &Env) -> BytesN<N> {
    let mut rng = OsRng;
    let mut random_bytes = [0u8; N];
    rng.try_fill_bytes(&mut random_bytes)
        .expect("unable to fill bytes");

    BytesN::from_array(env, &random_bytes)
}

// The contract that will be deployed by the deployer contract.
mod contract {
    soroban_sdk::contractimport!(
        file = "../../../target/wasm32v1-none/release/account_contract.wasm"
    );
}

#[test]
fn test_deploy() {
    let env = Env::default();
    let auth_contract = Address::generate(&env);
    let native_token = Address::generate(&env);

    env.cost_estimate().budget().reset_unlimited();
    env.mock_all_auths();

    // Upload the Wasm to be deployed from the deployer contract.
    // This can also be called from within a contract if needed.
    let wasm_hash = env.deployer().upload_contract_wasm(contract::WASM);

    let factory_client = AccountFactoryClient::new(
        &env,
        &env.register(AccountFactory, (&auth_contract, &wasm_hash, &native_token)),
    );

    let id = gen_random_bytes::<32>(&env);
    let pk = gen_random_bytes::<65>(&env);

    // Deploy contract using deployer, and include an init function to call.
    let salt = gen_random_bytes::<32>(&env);

    let contract_id = factory_client.deploy(&salt, &id, &pk);

    // `deploy` does not require auth from the auth contract (see the note in `deploy`).
    assert!(env.auths().iter().all(|(address, _)| *address != auth_contract));

    // Invoke contract to check that it is initialized.
    let client = contract::Client::new(&env, &contract_id);
    let devices = client.get_devices();
    assert_eq!(devices.len(), 1);
}

#[test]
#[should_panic]
fn test_duplicate_deployment() {
    let env = Env::default();

    env.cost_estimate().budget().reset_unlimited();
    env.mock_all_auths();

    let auth_contract = Address::generate(&env);
    let native_token = Address::generate(&env);
    let wasm_hash = env.deployer().upload_contract_wasm(contract::WASM);

    let factory_client = AccountFactoryClient::new(
        &env,
        &env.register(AccountFactory, (&auth_contract, &wasm_hash, &native_token)),
    );

    let id = gen_random_bytes::<32>(&env);
    let pk = gen_random_bytes::<65>(&env);
    let salt = BytesN::from_array(&env, &[0; 32]);

    // First deployment
    factory_client.deploy(&salt, &id, &pk);
    // Should fail on duplicate deployment
    factory_client.deploy(&salt, &id, &pk);
}
