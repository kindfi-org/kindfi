#![cfg(test)]

extern crate std;

use p256::ecdsa::{signature::Signer, Signature as P256Signature, SigningKey, VerifyingKey};
use rand::rngs::OsRng;
use rand::RngCore;
use soroban_sdk::{log, symbol_short};

// use soroban_sdk::auth::{Context, ContractContext};
use soroban_sdk::testutils::{Address as _, BytesN as _, Events as _};
use soroban_sdk::{Address, Bytes, BytesN, Env, IntoVal, Val};

// use crate::errors::Error;
use crate::{AccountContract, AccountContractClient, Signature};

fn sign(env: &Env, device_id: BytesN<32>, signing_key: SigningKey) -> Val {
    let authenticator_data = Bytes::from_slice(&env, b"auth_data");
    let client_json_data = Bytes::from_slice(&env, b"client_data");

    let hashed_client_data = env.crypto().sha256(&client_json_data);

    let mut payload = Bytes::new(&env);

    payload.append(&authenticator_data);
    payload.extend_from_array(&hashed_client_data.to_array());

    let hashed_payload = env.crypto().sha256(&payload);

    let signature: P256Signature = signing_key.sign(&hashed_payload.to_array());

    let mut signature_bytes = [0u8; 64];
    signature_bytes.copy_from_slice(&signature.to_bytes());

    Signature {
        authenticator_data: authenticator_data.clone(),
        client_data_json: client_json_data.clone(),
        device_id: device_id.clone(),
        signature: BytesN::from_array(&env, &signature_bytes),
    }
    .into_val(env)
}

fn generate_keypair(env: &Env) -> (SigningKey, VerifyingKey, BytesN<65>) {
    let signing_key = SigningKey::random(&mut OsRng);
    let verifying_key = VerifyingKey::from(&signing_key);
    let vk_bytes = verifying_key.to_sec1_bytes();

    let mut pubkey_bytes = [0u8; 65];
    pubkey_bytes.copy_from_slice(&vk_bytes);

    let public_key = BytesN::from_array(&env, &pubkey_bytes);

    (signing_key, verifying_key, public_key)
}

fn generate_device_id(env: &Env) -> BytesN<32> {
    let mut rng = OsRng;
    let mut random_bytes = [0u8; 32];
    rng.try_fill_bytes(&mut random_bytes)
        .expect("unable to fill bytes");

    BytesN::from_array(env, &random_bytes)
}

struct Account {
    env: Env,
    account_address: Address,
    client: AccountContractClient<'static>,
    init_device_id: BytesN<32>,
    init_signing_key: SigningKey,
    init_verifying_key: VerifyingKey,
    init_public_key: BytesN<65>,
    auth_contract: Address,
}

impl Account {
    fn new() -> Self {
        let env = Env::default();
        let auth_contract = Address::generate(&env);
        let init_device_id = generate_device_id(&env);

        env.cost_estimate().budget().reset_unlimited();
        env.mock_all_auths();

        let (sk, vk, pk) = generate_keypair(&env);
        log!(&env, "a log entry", pk, symbol_short!("another"));
        // let account_address = env.register(AccountContract, (&init_device_id, &pk, &auth_contract));
        let account_address = env.register(AccountContract, (&init_device_id, &pk, &auth_contract));

        let client = AccountContractClient::new(&env, &account_address);

        Account {
            env,
            account_address,
            client,
            init_device_id,
            init_signing_key: sk,
            init_verifying_key: vk,
            init_public_key: pk,
            auth_contract,
        }
    }
}

#[test]
fn test_constructor() {
    let Account { client, .. } = Account::new();
    assert_eq!(client.get_devices().len(), 1);
}

#[test]
fn test_add_device() {
    let Account { env, client, .. } = Account::new();

    assert_eq!(client.get_devices().len(), 1);

    let device_id: BytesN<32> = generate_device_id(&env); // Fake device ID

    let (_, _, public_key) = generate_keypair(&env);

    client.add_device(&device_id, &public_key);

    assert_eq!(client.get_devices().len(), 2);
}

#[test]
#[should_panic(expected = "#204")]
fn test_add_device_fails_if_add_same_device() {
    let Account {
        client,
        init_public_key,
        init_device_id,
        ..
    } = Account::new();

    assert_eq!(client.get_devices().len(), 1);

    client.add_device(&init_device_id, &init_public_key);
}

#[test]
fn test_remove_device() {
    let Account {
        env,
        client,
        init_device_id,
        ..
    } = Account::new();

    assert_eq!(client.get_devices().len(), 1);

    let device_id = generate_device_id(&env);

    let (_, _, public_key) = generate_keypair(&env);

    client.add_device(&device_id, &public_key);

    assert_eq!(client.get_devices().len(), 2);

    client.remove_device(&init_device_id);

    assert_eq!(client.get_devices().len(), 1);
}

#[test]
#[should_panic(expected = "#209")]
fn test_remove_device_fails_if_only_one_device() {
    let Account {
        client,
        init_device_id,
        ..
    } = Account::new();
    assert_eq!(client.get_devices().len(), 1);
    client.remove_device(&init_device_id);
}

#[test]
#[should_panic(expected = "#205")]
fn test_remove_device_fails_for_unknown_device() {
    let Account { env, client, .. } = Account::new();
    assert_eq!(client.get_devices().len(), 1);
    let device_id = generate_device_id(&env);
    client.remove_device(&device_id);
}

#[test]
fn test_add_recovery_address() {
    let Account { env, client, .. } = Account::new();

    assert_eq!(client.get_devices().len(), 1);

    let recovery = Address::generate(&env);

    client.add_recovery_address(&recovery);

    assert_eq!(env.events().all().len(), 1);
}
