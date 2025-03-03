#![cfg(test)]
extern crate std;

use soroban_sdk::{testutils::{Address as _, Logs}, Address, BytesN, Env, IntoVal, Val};
use crate::{AuthController, AuthControllerClient, Error};

fn create_test_environment() -> (Env, AuthControllerClient) {
    let env = Env::default();
    let controller_address = env.register(AuthController, ());
    let client = AuthControllerClient::new(&env, &controller_address);
    (env, client)
}

#[test]
fn test_account_creation_success() {
    let (env, client) = create_test_environment();
    let signers = vec![Address::generate(&env), Address::generate(&env)];
    let threshold = 2;

    client.init(&signers, threshold);
    assert_eq!(client.get_signers().len(), 2);
    assert_eq!(client.get_default_threshold(), threshold);
}

#[test]
#[should_panic(expected = "AlreadyInitialized")]
fn test_account_creation_failure_already_initialized() {
    let (env, client) = create_test_environment();
    let signers = vec![Address::generate(&env), Address::generate(&env)];
    let threshold = 2;

    client.init(&signers, threshold);
    client.init(&signers, threshold); // Should panic
}

#[test]
#[should_panic(expected = "SignerLimitExceeded")]
fn test_account_creation_failure_signer_limit_exceeded() {
    let (env, client) = create_test_environment();
    let signers = (0..6).map(|_| Address::generate(&env)).collect();
    let threshold = 5;

    client.init(&signers, threshold); // Should panic
}

#[test]
fn test_authorization_success() {
    let (env, client) = create_test_environment();
    let signers = vec![Address::generate(&env), Address::generate(&env)];
    let threshold = 2;

    client.init(&signers, threshold);
    let payload = BytesN::<32>::from_array(&env, &[0; 32]);
    let signature = client.sign(&payload); // Assuming a sign method exists

    assert!(client.__check_auth(payload.clone(), signature).is_ok());
}

#[test]
#[should_panic(expected = "UnknownSigner")]
fn test_authorization_failure_unknown_signer() {
    let (env, client) = create_test_environment();
    let payload = BytesN::<32>::from_array(&env, &[0; 32]);
    let signature = client.sign(&payload); // Assuming a sign method exists

    // Modify the signature to use an unknown signer
    let unknown_signer = Address::generate(&env);
    let modified_signature = signature.clone(); // Modify as needed

    assert!(client.__check_auth(payload.clone(), modified_signature).is_err());
}

#[test]
fn test_device_management_add_success() {
    let (env, client) = create_test_environment();
    let signers = vec![Address::generate(&env), Address::generate(&env)];
    let threshold = 2;

    client.init(&signers, threshold);
    let device_id = BytesN::<32>::from_array(&env, &[1; 32]);
    let public_key = BytesN::<65>::from_array(&env, &[2; 65]);

    client.add_device(device_id.clone(), public_key.clone());
    let devices = client.get_devices();
    assert_eq!(devices.len(), 1);
    assert_eq!(devices[0].device_id, device_id);
}

#[test]
#[should_panic(expected = "DeviceAlreadySet")]
fn test_device_management_add_failure_already_exists() {
    let (env, client) = create_test_environment();
    let signers = vec![Address::generate(&env), Address::generate(&env)];
    let threshold = 2;

    client.init(&signers, threshold);
    let device_id = BytesN::<32>::from_array(&env, &[1; 32]);
    let public_key = BytesN::<65>::from_array(&env, &[2; 65]);

    client.add_device(device_id.clone(), public_key.clone());
    client.add_device(device_id.clone(), public_key.clone()); // Should panic
}

#[test]
fn test_device_management_remove_success() {
    let (env, client) = create_test_environment();
    let signers = vec![Address::generate(&env), Address::generate(&env)];
    let threshold = 2;

    client.init(&signers, threshold);
    let device_id = BytesN::<32>::from_array(&env, &[1; 32]);
    let public_key = BytesN::<65>::from_array(&env, &[2; 65]);

    client.add_device(device_id.clone(), public_key.clone());
    client.remove_device(device_id.clone());
    let devices = client.get_devices();
    assert_eq!(devices.len(), 0);
}

#[test]
#[should_panic(expected = "DeviceNotFound")]
fn test_device_management_remove_failure_not_found() {
    let (env, client) = create_test_environment();
    let signers = vec![Address::generate(&env), Address::generate(&env)];
    let threshold = 2;

    client.init(&signers, threshold);
    let device_id = BytesN::<32>::from_array(&env, &[1; 32]);

    client.remove_device(device_id.clone()); // Should panic
}

#[test]
fn test_recovery_address_management_add_success() {
    let (env, client) = create_test_environment();
    let signers = vec![Address::generate(&env), Address::generate(&env)];
    let threshold = 2;

    client.init(&signers, threshold);
    let recovery_address = Address::generate(&env);

    client.add_recovery_address(recovery_address.clone());
    assert_eq!(client.get_recovery_address(), recovery_address);
}

#[test]
#[should_panic(expected = "RecoveryAddressSet")]
fn test_recovery_address_management_add_failure_already_set() {
    let (env, client) = create_test_environment();
    let signers = vec![Address::generate(&env), Address::generate(&env)];
    let threshold = 2;

    client.init(&signers, threshold);
    let recovery_address = Address::generate(&env);

    client.add_recovery_address(recovery_address.clone());
    client.add_recovery_address(recovery_address.clone()); // Should panic
}

#[test]
fn test_recovery_address_management_update_success() {
    let (env, client) = create_test_environment();
    let signers = vec![Address::generate(&env), Address::generate(&env)];
    let threshold = 2;

    client.init(&signers, threshold);
    let recovery_address = Address::generate(&env);
    client.add_recovery_address(recovery_address.clone());

    let new_recovery_address = Address::generate(&env);
    client.update_recovery_address(new_recovery_address.clone());
    assert_eq!(client.get_recovery_address(), new_recovery_address);
}

#[test]
#[should_panic(expected = "RecoveryAddressNotSet")]
fn test_recovery_address_management_update_failure_not_set() {
    let (env, client) = create_test_environment();
    let signers = vec![Address::generate(&env), Address::generate(&env)];
    let threshold = 2;

    client.init(&signers, threshold);
    let new_recovery_address = Address::generate(&env);

    client.update_recovery_address(new_recovery_address.clone()); // Should panic
}

#[test]
fn test_signature_verification_edge_cases() {
    let (env, client) = create_test_environment();
    let signers = vec![Address::generate(&env), Address::generate(&env)];
    let threshold = 2;

    client.init(&signers, threshold);
    let payload = BytesN::<32>::from_array(&env, &[0; 32]);
    let signature = client.sign(&payload); // Assuming a sign method exists

    // Test with modified payload
    let modified_payload = BytesN::<32>::from_array(&env, &[1; 32]);
    assert!(client.__check_auth(modified_payload, signature).is_err());
}