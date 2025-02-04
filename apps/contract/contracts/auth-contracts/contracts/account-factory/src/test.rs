#![cfg(test)]
extern crate alloc;
extern crate std;

use crate::{AccountFactory, AccountFactoryClient};
use alloc::vec;
use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation},
    Address, BytesN, Env, IntoVal, Val, Vec,
};

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct DevicePublicKey {
    pub device_id: BytesN<32>,
    pub public_key: BytesN<65>,
}

// The contract that will be deployed by the deployer contract.
mod contract {
    soroban_sdk::contractimport!(
        file = "../../../../target/wasm32-unknown-unknown/release/account_contract.wasm"
    );
}

#[test]
fn test() {
    let env = Env::default();
    let auth_contract = Address::generate(&env);
    // Upload the Wasm to be deployed from the deployer contract.
    // This can also be called from within a contract if needed.
    let wasm_hash = env.deployer().upload_contract_wasm(contract::WASM);

    let factory_client = AccountFactoryClient::new(
        &env,
        &env.register(AccountFactory, (&auth_contract, &wasm_hash)),
    );

    let id = BytesN::random(&env);
    let pk = BytesN::random(&env);

    // Deploy contract using deployer, and include an init function to call.
    let salt = BytesN::from_array(&env, &[0; 32]);
    // let constructor_args: Vec<Val> = vec![&env, (id).into_val(&env), (pk).into_val(&env)];
    env.mock_all_auths();
    let contract_id = factory_client.deploy(&salt, &id, &pk);

    // An authorization from the auth_contract is required.
    let expected_auth = AuthorizedInvocation {
        // Top-level authorized function is `deploy` with all the arguments.
        function: AuthorizedFunction::Contract((
            factory_client.address,
            symbol_short!("deploy"),
            (salt, id, pk).into_val(&env),
        )),
        sub_invocations: vec![],
    };
    assert_eq!(env.auths(), vec![(auth_contract, expected_auth)]);

    // Invoke contract to check that it is initialized.
    let client = contract::Client::new(&env, &contract_id);
    let devices: Vec<DevicePublicKey> = client.get_devices();
    assert_eq!(devices.len(), 1);
}
