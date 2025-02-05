#![no_std]
#![cfg(test)]

use core::ops::Add;

use hex::decode;

extern crate std; // Allow using std in tests

use p256::ecdsa::{
    signature::Signer, signature::Verifier, Signature as P256Signature, SigningKey, VerifyingKey,
};
use rand::rngs::OsRng;

use soroban_sdk::auth::{Context, ContractContext};
use soroban_sdk::testutils::{Address as _, BytesN as _, Events as _};
use soroban_sdk::{Address, Bytes, BytesN, Env, IntoVal, Val};

use crate::errors::Error;
use crate::{AccountContract, AccountContractClient, Signature};

fn sign(e: &Env, device_id: BytesN, signing_key: SigningKey) -> Val {
    let authenticator_data = Bytes::from_slice(&e, b"auth_data");
    let client_json_data = Bytes::from_slice(&e, b"client_data");

    let hashed_client_data = e.crypto().sha256(&client_json_data);

    let mut payload = Bytes::new(&env);

    payload.append(&authenticator_data);
    payload.extend_from_array(&hashed_client_data.to_array());

    let hashed_payload = env.crypto().sha256(&payload);

    let signature: P256Signature = signing_key.sign(hashed_payload.as_slice());

    let mut signature_bytes = [0u8; 64];
    signature_bytes.copy_from_slice(signature.as_bytes());

    Signature {
        authenticator_data: authenticator_data.clone(),
        client_data_json: client_data_json.clone(),
        device_id: device_id.clone(),
        signature: BytesN::from_array(&env, &signature_bytes),
    }
    .into_val(e)
}

struct Account {
    env: Env,
    account_address: Address,
    client: AccountContractClient<'static>,
}

const INIT_DEVICE_ID: BytesN<32> = BytesN::from_array(&env, &[1u8; 32]);
const INIT_SIGNING_KEY: SigningKey = SigningKey::random(&mut OsRng);
const INIT_VERIFYING_KEY: VerifyingKey = VerifyingKey::from(&INIT_SIGNING_KEY);

impl Account {
    fn new(auth_contract: Address) -> Self {
        let env = Env::default();
        env.budget().reset_unlimited();
        env.mock_all_auths();

        let public_key = BytesN::from_array(&env, &INIT_VERIFYING_KEY.to_sec1_bytes());

        let account_address = env.register(
            AccountContract,
            (&INIT_DEVICE_ID, &public_key, auth_contract),
        );
        let client = AccountContractClient::new(&env, &account_address);

        Account {
            env,
            account_address,
            client,
        }
    }
}

#[test]
fn test_constructor() {
    let auth_contract = Address::random(&env);
    let Account { client, .. } = Account::new(auth_contract);
    assert_eq!(client.get_devices().len(), 1);
}

#[test]
fn test_add_device() {
    let auth_contract = Address::random(&env);
    let Account { env, client, .. } = Account::new(auth_contract);

    assert_eq!(client.get_devices().len(), 1);

    let signing_key = SigningKey::random(&mut OsRng);
    let verifying_key = VerifyingKey::from(&signing_key);

    let device_id: BytesN<32> = BytesN::from_array(&env, &[1u8; 32]); // Fake device ID
    let public_key: BytesN<64> = BytesN::from_array(&env, &verifying_key.to_sec1_bytes());

    client.add_device(&device_id, &public_key);

    assert_eq!(client.get_devices().len(), 2);
}

#[test]
#[should_panic(expected = "#204")]
fn test_add_device_fails_if_add_same_device() {
    let auth_contract = Address::random(&env);
    let Account { env, client, .. } = Account::new(auth_contract);

    assert_eq!(client.get_devices().len(), 1);

    let public_key = BytesN::from_array(&env, &INIT_VERIFYING_KEY.to_sec1_bytes());

    client.add_device(&INIT_DEVICE_ID, &public_key);
}

#[test]
fn test_remove_device() {
    let auth_contract = Address::random(&env);
    let Account { env, client, .. } = Account::new(auth_contract);

    assert_eq!(client.get_devices().len(), 1);

    let signing_key_v2 = SigningKey::random(&mut OsRng);
    let verifying_key_v2 = VerifyingKey::from(&signing_key_v2);

    let device_id: BytesN<32> = BytesN::from_array(&env, &[1u8; 32]); // Fake device ID
    let public_key: BytesN<64> = BytesN::from_array(&env, &verifying_key_v2.to_sec1_bytes());

    client.add_device(&device_id, &public_key);

    assert_eq!(client.get_devices().len(), 2);

    client.remove_device(&device_id);

    assert_eq!(client.get_devices().len(), 1);
}

#[test]
#[should_panic(expected = "#2010")]
fn test_remove_device_fails_if_only_one_device() {
    let auth_contract = Address::random(&env);
    let Account { env, client, .. } = Account::new(auth_contract);
    assert_eq!(client.get_devices().len(), 1);
    client.remove_device(&INIT_DEVICE_ID);
}

#[test]
#[should_panic(expected = "#205")]
fn test_remove_device_fails_for_unknown_device() {
    let auth_contract = Address::random(&env);
    let Account { env, client, .. } = Account::new(auth_contract);
    assert_eq!(client.get_devices().len(), 1);
    let device_id: BytesN<32> = BytesN::from_array(&env, &[1u8; 32]); // Fake device ID
    client.remove_device(&device_id);
}

#[test]
fn test_add_recovery_address() {
    let auth_contract = Address::random(&env);
    let Account { env, client, .. } = Account::new(auth_contract);

    assert_eq!(client.get_devices().len(), 1);

    let recovery = Address::random(&env);

    client.add_recovery_address(&recovery);

    assert_eq!(env.events().all().len(), 2);
}
