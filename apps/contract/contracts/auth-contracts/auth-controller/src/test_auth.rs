#![cfg(test)]
extern crate std;

use ed25519_dalek::{Keypair, PublicKey, Signature, Signer, Verifier};
use rand::{rngs::StdRng, RngCore, SeedableRng};
use sha3::{Digest, Keccak256};
use soroban_sdk::{
    auth::Context,
    testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation, Logs},
    vec, Address, BytesN, Env, IntoVal, Symbol, Val, Vec,
};

// Import the contracts directly
use crate::{AuthController, AuthControllerClient, DataKey, Error, SignedMessage};
use account_contract::{AccountContract, AccountContractClient, DevicePublicKey};
use account_factory::{AccountFactory, AccountFactoryClient, Error as FactoryError};

// Helper functions for test setup
fn create_auth_client(env: &Env) -> AuthControllerClient {
    let contract_id = env.register_contract(None, AuthController);
    AuthControllerClient::new(env, &contract_id)
}

fn create_account_client(env: &Env) -> AccountContractClient {
    let contract_id = env.register_contract(None, AccountContract);
    AccountContractClient::new(env, &contract_id)
}

fn create_factory_client(env: &Env) -> AccountFactoryClient {
    let contract_id = env.register_contract(None, AccountFactory);
    AccountFactoryClient::new(env, &contract_id)
}

// A secure key storage that doesn't expose private keys
struct SecureKeyStorage {
    // Store only the seed, not the actual keypair
    seed: u64,
}

impl SecureKeyStorage {
    fn new(seed: u64) -> Self {
        Self { seed }
    }

    // Generate a public key from the stored seed
    fn get_public_key(&self, env: &Env) -> BytesN<32> {
        // Generate a deterministic keypair from seed (for testing consistency)
        let mut rng = StdRng::seed_from_u64(self.seed);
        let keypair = Keypair::generate(&mut rng);

        // Return the public key bytes
        BytesN::from_array(env, &keypair.public.to_bytes())
    }

    // Sign a message using proper Ed25519 signature generation
    fn sign(&self, env: &Env, payload: &BytesN<32>) -> BytesN<64> {
        // Generate a deterministic keypair from seed (for testing consistency)
        let mut rng = StdRng::seed_from_u64(self.seed);
        let keypair = Keypair::generate(&mut rng);

        // Sign the payload using proper Ed25519 signing
        let payload_bytes = payload.to_array();
        let signature = keypair.sign(&payload_bytes);

        // Return the signature bytes
        BytesN::from_array(env, &signature.to_bytes())
    }

    // Generate secp256r1 public key for account device (65 bytes)
    fn get_secp_public_key(&self, env: &Env) -> BytesN<65> {
        let mut rng = StdRng::seed_from_u64(self.seed);
        let mut key_data = [0u8; 65];
        rng.fill_bytes(&mut key_data);

        // First byte is header byte in secp256r1
        key_data[0] = 0x04; // Uncompressed public key format

        BytesN::from_array(env, &key_data)
    }
}

// Function to create signed messages without exposing private keys
pub fn create_signed_message(
    env: &Env,
    secure_key: &SecureKeyStorage,
    payload: &BytesN<32>,
) -> SignedMessage {
    // Get the public key
    let public_key = secure_key.get_public_key(env);

    // Sign the payload without exposing private key
    let signature = secure_key.sign(env, payload);

    SignedMessage {
        public_key,
        signature,
    }
}

// Function to verify signatures using proper cryptographic verification
pub fn verify_signature(
    env: &Env,
    public_key: &BytesN<32>,
    payload: &BytesN<32>,
    signature: &BytesN<64>,
) -> bool {
    // Convert the BytesN inputs to arrays
    let public_key_bytes: [u8; 32] = public_key.to_array();
    let signature_bytes: [u8; 64] = signature.to_array();

    // Attempt to parse the public key - production ready code handles errors
    let ed25519_public_key = match PublicKey::from_bytes(&public_key_bytes) {
        Ok(pk) => pk,
        Err(_) => return false, // Invalid public key
    };

    // Attempt to parse the signature - production ready code handles errors
    let ed25519_signature = match Signature::from_bytes(&signature_bytes) {
        Ok(sig) => sig,
        Err(_) => return false, // Invalid signature
    };

    // Hash the payload using sha256 (or another appropriate hash for your use case)
    // This is equivalent to the Soroban SDK BytesN wrapper
    let payload_bytes = payload.to_array();

    // Perform actual cryptographic verification - production ready
    match ed25519_public_key.verify(&payload_bytes, &ed25519_signature) {
        Ok(_) => true,
        Err(_) => false,
    }
}

// Helper function to extract a seed from a public key (for testing only)
fn extract_seed_from_public_key(public_key: &BytesN<32>) -> u64 {
    // This is a mock function that pretends to extract the seed
    // In real scenarios, this would be impossible

    // Use the first 8 bytes of the public key as a mock seed
    let mut seed_bytes = [0u8; 8];
    let key_bytes = public_key.to_array();
    for i in 0..8 {
        seed_bytes[i] = key_bytes[i];
    }
    u64::from_le_bytes(seed_bytes)
}

// Function to generate signers for testing that's compatible with init
fn generate_signers(env: &Env, count: usize) -> Vec<BytesN<32>> {
    let mut signers = Vec::new(env);

    for i in 0..count {
        // Create a secure key using a deterministic seed
        let secure_key = SecureKeyStorage::new(i as u64);
        let public_key = secure_key.get_public_key(env);
        signers.push_back(public_key);
    }

    signers
}

// Helper to get a SecureKeyStorage for a specific signer
fn get_secure_key_for_signer(signer_index: usize) -> SecureKeyStorage {
    SecureKeyStorage::new(signer_index as u64)
}

/// Auth Controller Tests
#[test]
fn test_signature_verification() {
    let env = Env::default();

    // Create a secure key with deterministic seed
    let secure_key = SecureKeyStorage::new(42);
    let public_key = secure_key.get_public_key(&env);

    // Create a payload
    let payload_bytes: [u8; 32] = [1u8; 32];
    let payload = BytesN::from_array(&env, &payload_bytes);

    // Create a signed message
    let signed_message = create_signed_message(&env, &secure_key, &payload);

    // Verify the signature
    let is_valid = verify_signature(&env, &public_key, &payload, &signed_message.signature);

    // Assert that the signature is valid
    assert!(is_valid);
}

// #[test]
// fn test_init() {
//     let env = Env::default();
//     let client = create_auth_client(&env);

//     let signers = generate_signers(&env, 3);
//     let default_threshold = 2;

//     client.init(&signers, &default_threshold);

//     // Verify initialization values
//     assert_eq!(client.get_signers(), signers);
//     assert_eq!(client.get_default_threshold(), default_threshold);
// }

// #[test]
// #[should_panic(expected = "Error(Contract, #104")]
// fn test_init_already_initialized() {
//     let env = Env::default();
//     let client = create_auth_client(&env);

//     let signers = generate_signers(&env, 3);
//     let default_threshold = 2;

//     client.init(&signers, &default_threshold);
//     client.init(&signers, &default_threshold); // Should panic
// }

// #[test]
// #[should_panic(expected = "Error(Contract, #100)")]
// fn test_init_signer_limit_exceeded() {
//     let env = Env::default();
//     let client = create_auth_client(&env);

//     let signers = generate_signers(&env, 6); // Exceeds THRESHOLD_LIMIT (5)
//     let default_threshold = 3;

//     client.init(&signers, &default_threshold); // Should panic
// }

// #[test]
// #[should_panic(expected = "Error(Contract, #105)")]
// fn test_init_invalid_threshold() {
//     let env = Env::default();
//     let client = create_auth_client(&env);

//     let signers = generate_signers(&env, 3);
//     let default_threshold = 4; // Greater than signers.len()

//     client.init(&signers, &default_threshold); // Should panic
// }

// // #[test]
// // fn test_check_auth() {
// //     let env = Env::default();
// //     let client = create_auth_client(&env);

// //     // Initialize with a valid configuration
// //     let signers = generate_signers(&env, 3);
// //     let default_threshold = 1;
// //     client.init(&signers, &default_threshold);

// //     // Create secure keys for signing that correspond to the generated signers
// //     let secure_key1 = get_secure_key_for_signer(0);
// //     let secure_key2 = get_secure_key_for_signer(1);

// //     // Create a payload
// //     let payload_bytes: [u8; 32] = [1u8; 32];
// //     let payload = BytesN::from_array(&env, &payload_bytes);

// //     // Create signed messages
// //     let signed_message1 = create_signed_message(&env, &secure_key1, &payload);
// //     let signed_message2 = create_signed_message(&env, &secure_key2, &payload);

// //     let signed_messages = vec![&env, signed_message1, signed_message2];

// //     // Mock the crypto verification
// //     env.mock_all_auths();
// //     env.crypto().set_ed25519_verify_result(true);

// //     // Test the check_auth function with valid context
// //     let valid_context = vec![&env];

// //     // This would normally fail without the mocked crypto and auths
// //     client.__check_auth(env, &payload, &signed_messages, &valid_context);
// // }

// #[test]
// fn test_add_signer() {
//     let env = Env::default();
//     let client = create_auth_client(&env);

//     // Generate 3 signers at once
//     let all_signers = generate_signers(&env, 3);

//     // Use only first two for init
//     let init_signers = vec![
//         &env,
//         all_signers.get_unchecked(0),
//         all_signers.get_unchecked(1),
//     ];
//     let default_threshold = 1;
//     client.init(&init_signers, &default_threshold);

//     // Mock authorization
//     env.mock_all_auths();

//     // Add the new third signer
//     let new_signer = all_signers.get_unchecked(2);
//     client.add_signer(&new_signer);

//     // Verify signer was added
//     let updated_signers = client.get_signers();
//     assert_eq!(updated_signers.len(), 3);
//     assert!(updated_signers.contains(&new_signer));
// }

// #[test]
// #[should_panic(expected = "Error(Contract, #106)")]
// fn test_add_signer_already_exists() {
//     let env = Env::default();
//     let client = create_auth_client(&env);

//     // Initialize with a valid configuration
//     let signers = generate_signers(&env, 2);
//     let default_threshold = 1;
//     client.init(&signers, &default_threshold);

//     // Authorize contract to add signer
//     env.mock_all_auths();

//     // Try to add an existing signer
//     client.add_signer(&signers.get_unchecked(0)); // Should panic
// }

// #[test]
// #[should_panic(expected = "Error(Contract, #100)")]
// fn test_add_signer_limit_exceeded() {
//     let env = Env::default();
//     let client = create_auth_client(&env);

//     // Generate more than signers limit
//     let all_signers = generate_signers(&env, 6);
    
//     // Initialize with maximum allowed signers
//     let init_signers = vec![
//         &env,
//         all_signers.get_unchecked(0),
//         all_signers.get_unchecked(1),
//         all_signers.get_unchecked(2),
//         all_signers.get_unchecked(3),
//         all_signers.get_unchecked(4),
//     ];

//     // Initialize client with all signers
//     let default_threshold = 3;
//     client.init(&init_signers, &default_threshold);

//     // Mock authorization
//     env.mock_all_auths();

//     // Add the new signer
//     let new_signer = all_signers.get_unchecked(5);
//     client.add_signer(&new_signer); // Should panic
// }

// #[test]
// fn test_remove_signer() {
//     let env = Env::default();
//     let client = create_auth_client(&env);

//     // Initialize with a valid configuration
//     let signers = generate_signers(&env, 3);
//     let default_threshold = 1;
//     client.init(&signers, &default_threshold);

//     // Authorize contract to remove signer
//     env.mock_all_auths();

//     // Remove a signer
//     let signer_to_remove = signers.get_unchecked(1);
//     client.remove_signer(&signer_to_remove);

//     // Verify signer was removed
//     let updated_signers = client.get_signers();
//     assert_eq!(updated_signers.len(), 2);
//     assert!(!updated_signers.contains(&signer_to_remove));
// }

// #[test]
// #[should_panic(expected = "Error(Contract, #103)")]
// fn test_remove_signer_not_found() {
//     let env = Env::default();
//     let client = create_auth_client(&env);

//      // Generate 3 signers at once
//     let all_signers = generate_signers(&env, 3);

//     // Use only first two for init
//     let init_signers = vec![
//         &env,
//         all_signers.get_unchecked(0),
//         all_signers.get_unchecked(1),
//     ];
//     let default_threshold = 1;
//     client.init(&init_signers, &default_threshold);

//     // Mock authorization
//     env.mock_all_auths();
    
//     // Try to remove a non-existent signer
//     let non_existent_signer = all_signers.get_unchecked(2);
//     client.remove_signer(&non_existent_signer); // Should panic
// }

// #[test]
// #[should_panic(expected = "Error(Contract, #105)")]
// fn test_remove_signer_threshold_violation() {
//     let env = Env::default();
//     let client = create_auth_client(&env);

//     // Initialize with signers equal to threshold
//     let signers = generate_signers(&env, 2);
//     let default_threshold = 2;
//     client.init(&signers, &default_threshold);

//     // Authorize contract to remove signer
//     env.mock_all_auths();

//     // Try to remove a signer (would make signers.len() < threshold)
//     client.remove_signer(&signers.get_unchecked(0)); // Should panic
// }

// #[test]
// fn test_set_default_threshold() {
//     let env = Env::default();
//     let client = create_auth_client(&env);

//     // Initialize with a valid configuration
//     let signers = generate_signers(&env, 3);
//     let default_threshold = 1;
//     client.init(&signers, &default_threshold);

//     // Authorize contract to set threshold
//     env.mock_all_auths();

//     // Set a new threshold
//     let new_threshold = 2;
//     client.set_default_threshold(&new_threshold);

//     // Verify threshold was updated
//     assert_eq!(client.get_default_threshold(), new_threshold);
// }

// #[test]
// #[should_panic(expected = "Error(Contract, #105)")]
// fn test_set_default_threshold_invalid() {
//     let env = Env::default();
//     let client = create_auth_client(&env);

//     // Initialize with a valid configuration
//     let signers = generate_signers(&env, 3);
//     let default_threshold = 1;
//     client.init(&signers, &default_threshold);

//     // Authorize contract to set threshold
//     env.mock_all_auths();

//     // Try to set an invalid threshold (> signers.len())
//     let invalid_threshold = 4;
//     client.set_default_threshold(&invalid_threshold); // Should panic
// }

// #[test]
// fn test_add_factory() {
//     let env = Env::default();
//     let client = create_auth_client(&env);

//     // Initialize with a valid configuration
//     let signers = generate_signers(&env, 2);
//     let default_threshold = 1;
//     client.init(&signers, &default_threshold);

//     // Authorize contract to add factory
//     env.mock_all_auths();

//     // Add a factory
//     let factory = Address::generate(&env);
//     let context = vec![&env, Address::generate(&env)];
//     client.add_factory(&factory, &context);
// }

// #[test]
// #[should_panic(expected = "Error(Contract, #1011)")]
// fn test_add_factory_already_exists() {
//     let env = Env::default();
//     let client = create_auth_client(&env);

//     // Initialize with a valid configuration
//     let signers = generate_signers(&env, 2);
//     let default_threshold = 1;
//     client.init(&signers, &default_threshold);

//     // Authorize contract to add factory
//     env.mock_all_auths();

//     // Add a factory
//     let factory = Address::generate(&env);
//     let context = vec![&env, Address::generate(&env)];
//     client.add_factory(&factory, &context);

//     // Try to add the same factory context again
//     client.add_factory(&factory, &context); // Should panic
// }

// #[test]
// fn test_remove_factory() {
//     let env = Env::default();
//     let client = create_auth_client(&env);

//     // Initialize with a valid configuration
//     let signers = generate_signers(&env, 2);
//     let default_threshold = 1;
//     client.init(&signers, &default_threshold);

//     // Authorize contract to add and remove factory
//     env.mock_all_auths();

//     // Add a factory
//     let factory = Address::generate(&env);
//     let context = vec![&env, Address::generate(&env)];
//     client.add_factory(&factory, &context);

//     // Remove the factory
//     client.remove_factory(&factory, &context);
// }

// #[test]
// #[should_panic(expected = "Error(Contract, #1012)")]
// fn test_remove_factory_not_found() {
//     let env = Env::default();
//     let client = create_auth_client(&env);

//     // Initialize with a valid configuration
//     let signers = generate_signers(&env, 2);
//     let default_threshold = 1;
//     client.init(&signers, &default_threshold);

//     // Authorize contract to remove factory
//     env.mock_all_auths();

//     // Try to remove a non-existent factory
//     let factory = Address::generate(&env);
//     let context = vec![&env, Address::generate(&env)];
//     client.remove_factory(&factory, &context); // Should panic
// }

// #[test]
// fn test_add_account() {
//     let env = Env::default();
//     let client = create_auth_client(&env);

//     // Initialize with a valid configuration
//     let signers = generate_signers(&env, 2);
//     let default_threshold = 1;
//     client.init(&signers, &default_threshold);

//     // Authorize contract to add account
//     env.mock_all_auths();

//     // Add an account
//     let account = Address::generate(&env);
//     let context = vec![&env, Address::generate(&env)];
//     client.add_account(&account, &context);

//     // Verify account was added
//     let accounts = client.get_accounts(&context);
//     assert_eq!(accounts.len(), 1);
//     assert_eq!(accounts.get_unchecked(0), account);
// }

// #[test]
// #[should_panic(expected = "Error(Contract, #109)")]
// fn test_add_account_already_exists() {
//     let env = Env::default();
//     let client = create_auth_client(&env);

//     // Initialize with a valid configuration
//     let signers = generate_signers(&env, 2);
//     let default_threshold = 1;
//     client.init(&signers, &default_threshold);

//     // Authorize contract to add account
//     env.mock_all_auths();

//     // Add an account
//     let account = Address::generate(&env);
//     let context = vec![&env, Address::generate(&env)];
//     client.add_account(&account, &context);

//     // Try to add the same account context again
//     client.add_account(&account, &context); // Should panic
// }

// #[test]
// fn test_remove_account() {
//     let env = Env::default();
//     let client = create_auth_client(&env);

//     // Initialize with a valid configuration
//     let signers = generate_signers(&env, 2);
//     let default_threshold = 1;
//     client.init(&signers, &default_threshold);

//     // Authorize contract to add and remove account
//     env.mock_all_auths();

//     // Add an account
//     let account = Address::generate(&env);
//     let context = vec![&env, Address::generate(&env)];
//     client.add_account(&account, &context);

//     // Remove the account
//     client.remove_account(&account, &context);

//     // Verify account was removed
//     let accounts = client.get_accounts(&context);
//     assert_eq!(accounts.len(), 0);
// }

// #[test]
// #[should_panic(expected = "Error(Contract, #1010)")]
// fn test_remove_account_not_found() {
//     let env = Env::default();
//     let client = create_auth_client(&env);

//     // Initialize with a valid configuration
//     let signers = generate_signers(&env, 2);
//     let default_threshold = 1;
//     client.init(&signers, &default_threshold);

//     // Authorize contract to remove account
//     env.mock_all_auths();

//     // Try to remove a non-existent account
//     let account = Address::generate(&env);
//     let context = vec![&env, Address::generate(&env)];
//     client.remove_account(&account, &context); // Should panic
// }

/// Account contract tests
// fn setup_account_test() -> (Env, AccountContractClient, BytesN<32>, BytesN<65>) {
//     let env = Env::default();

//     // Create mock devices and auth contract
//     let secure_key = SecureKeyStorage::new(42);
//     let device_id = secure_key.get_public_key(&env);
//     let public_key = secure_key.get_secp_public_key(&env); // secp256r1 public key
//     let auth_contract = Address::generate(&env);

//     // Create the account client
//     let account_client = create_account_client(&env);

//     // Call the constructor
//     account_client.__constructor(&device_id, &public_key, &auth_contract);

//     (env, account_client, device_id, public_key)
// }

// #[test]
// fn test_account_constructor() {
//     let (env, account_client, device_id, public_key) = setup_account_test();

//     // Get devices to verify initialization
//     let devices = account_client.get_devices();

//     // Verify device was properly set
//     assert_eq!(devices.len(), 1);
//     assert_eq!(devices.get_unchecked(0).device_id, device_id);
//     assert_eq!(devices.get_unchecked(0).public_key, public_key);

//     // Verify auth contract was properly set
//     let auth_contract = account_client.get_auth();

//     assert!(auth_contract != Address::generate(&env));
// }

// #[test]
// fn test_account_add_device() {
//     let (env, account_client, _, _) = setup_account_test();

//     // Mock authorization
//     env.mock_all_auths();

//     // Add a new device
//     let new_secure_key = SecureKeyStorage::new(99);
//     let new_device_id = new_secure_key.get_public_key(&env);
//     let new_public_key = new_secure_key.get_secp_public_key(&env);

//     account_client.add_device(&new_device_id, &new_public_key);

//     // Verify the device was added
//     let devices = account_client.get_devices();

//     assert_eq!(devices.len(), 2);

//     // Find the newly added device
//     let added_device = devices
//         .iter()
//         .find(|d| d.device_id == new_device_id)
//         .expect("New device should be found");

//     assert_eq!(added_device.public_key, new_public_key);
// }

// #[test]
// #[should_panic(expected = "Error(DeviceAlreadySet)")]
// fn test_account_add_device_already_exists() {
//     let (env, account_client, device_id, public_key) = setup_account_test();

//     // Mock authorization
//     env.mock_all_auths();

//     // Try to add the same device again
//     account_client.add_device(&device_id, &public_key);
//     // Should panic with DeviceAlreadySet
// }

// #[test]
// fn test_account_remove_device() {
//     let (env, account_client, _, _) = setup_account_test();

//     // Mock authorization
//     env.mock_all_auths();

//     // Add a second device first
//     let new_secure_key = SecureKeyStorage::new(99);
//     let new_device_id = new_secure_key.get_public_key(&env);
//     let new_public_key = new_secure_key.get_secp_public_key(&env);

//     account_client.add_device(&new_device_id, &new_public_key);

//     // Get the first device ID
//     let devices = account_client.get_devices();
//     let first_device_id = devices.get_unchecked(0).device_id;

//     // Remove the first device
//     account_client.remove_device(&first_device_id);

//     // Verify the device was removed
//     let updated_devices = account_client.get_devices();

//     assert_eq!(updated_devices.len(), 1);
//     assert_eq!(updated_devices.get_unchecked(0).device_id, new_device_id);
// }

// #[test]
// #[should_panic(expected = "Error(DeviceNotFound)")]
// fn test_account_remove_device_not_found() {
//     let (env, account_client, _, _) = setup_account_test();

//     // Mock authorization
//     env.mock_all_auths();

//     // Try to remove a non-existent device
//     let random_device_id = BytesN::random(&env);

//     account_client.remove_device(&random_device_id);
//     // Should panic with DeviceNotFound
// }

// #[test]
// #[should_panic(expected = "Error(DeviceCannotBeEmpty)")]
// fn test_account_remove_device_last_one() {
//     let (env, account_client, device_id, _) = setup_account_test();

//     // Mock authorization
//     env.mock_all_auths();

//     // Try to remove the only device
//     account_client.remove_device(&device_id);
//     // Should panic with DeviceCannotBeEmpty
// }

// #[test]
// fn test_account_add_recovery_address() {
//     let (env, account_client, _, _) = setup_account_test();

//     // Mock authorization
//     env.mock_all_auths();

//     // Add a recovery address
//     let recovery_address = Address::generate(&env);

//     account_client.add_recovery_address(&recovery_address);

//     // Verify the recovery address was set (no direct getter, so check logs)
//     let logs = env.logs().all();
//     assert!(logs.len() > 0);
// }

// #[test]
// #[should_panic(expected = "Error(RecoveryAddressSet)")]
// fn test_account_add_recovery_address_already_set() {
//     let (env, account_client, _, _) = setup_account_test();

//     // Mock authorization
//     env.mock_all_auths();

//     // Add a recovery address
//     let recovery_address = Address::generate(&env);

//     account_client.add_recovery_address(&recovery_address);

//     // Try to add another recovery address
//     let new_recovery_address = Address::generate(&env);

//     account_client.add_recovery_address(&new_recovery_address);
//     // Should panic with RecoveryAddressSet
// }

// #[test]
// fn test_account_update_recovery_address() {
//     let (env, account_client, _, _) = setup_account_test();

//     // Mock authorization
//     env.mock_all_auths();

//     // Add a recovery address
//     let recovery_address = Address::generate(&env);

//     account_client.add_recovery_address(&recovery_address);

//     // Update the recovery address
//     let new_recovery_address = Address::generate(&env);

//     account_client.update_recovery_address(&new_recovery_address);

//     // Verify the recovery address was updated
//     let logs = env.logs().all();
//     assert!(logs.len() > 0);
// }

// #[test]
// fn test_account_recover_account() {
//     let (env, account_client, _, _) = setup_account_test();

//     // Mock authorization
//     env.mock_all_auths();

//     // Add a recovery address
//     let recovery_address = Address::generate(&env);

//     account_client.add_recovery_address(&recovery_address);

//     // Recover the account with a new device
//     let new_secure_key = SecureKeyStorage::new(100);
//     let new_device_id = new_secure_key.get_public_key(&env);
//     let new_public_key = new_secure_key.get_secp_public_key(&env);

//     account_client.recover_account(&new_device_id, &new_public_key);

//     // Verify the device was updated
//     let devices = account_client.get_devices();

//     assert_eq!(devices.len(), 1);
//     assert_eq!(devices.get_unchecked(0).device_id, new_device_id);
//     assert_eq!(devices.get_unchecked(0).public_key, new_public_key);
// }

// // Account factory tests
// fn setup_factory_test() -> (Env, AccountFactoryClient, Address, BytesN<32>) {
//     let env = Env::default();

//     // Create mock auth contract and WASM hash
//     let auth_contract = Address::generate(&env);
//     let wasm_hash = BytesN::random(&env);

//     // Create the factory client
//     let factory_client = create_factory_client(&env);

//     // Call the constructor
//     factory_client.__constructor(&auth_contract, &wasm_hash);

//     (env, factory_client, auth_contract, wasm_hash)
// }

// #[test]
// fn test_factory_deploy() {
//     let (env, factory_client, _, _) = setup_factory_test();

//     // Mock authorization and WASM deployment
//     env.mock_all_auths();

//     // Set up deployment parameters
//     let salt = BytesN::random(&env);
//     let secure_key = SecureKeyStorage::new(42);
//     let device_id = secure_key.get_public_key(&env);
//     let public_key = secure_key.get_secp_public_key(&env);

//     // Deploy an account
//     let account_address = factory_client.deploy(&salt, &device_id, &public_key);

//     // Verify the account was deployed
//     assert!(account_address != Address::generate(&env));
// }

// #[test]
// fn test_factory_deploy_multiple_accounts() {
//     let (env, factory_client, _, _) = setup_factory_test();

//     // Mock authorization and WASM deployment
//     env.mock_all_auths();

//     // Deploy first account
//     let salt1 = BytesN::random(&env);
//     let secure_key1 = SecureKeyStorage::new(42);
//     let device_id1 = secure_key1.get_public_key(&env);
//     let public_key1 = secure_key1.get_secp_public_key(&env);

//     let account_address1 = factory_client.deploy(&salt1, &device_id1, &public_key1);

//     // Deploy second account
//     let salt2 = BytesN::random(&env);
//     let secure_key2 = SecureKeyStorage::new(43);
//     let device_id2 = secure_key2.get_public_key(&env);
//     let public_key2 = secure_key2.get_secp_public_key(&env);

//     let account_address2 = factory_client.deploy(&salt2, &device_id2, &public_key2);

//     // Verify two different accounts were created
//     assert!(account_address1 != account_address2);
// }

// #[test]
// fn test_factory_deploy_idempotent() {
//     let (env, factory_client, _, _) = setup_factory_test();

//     // Mock authorization and WASM deployment
//     env.mock_all_auths();

//     // Set up deployment parameters
//     let salt = BytesN::random(&env);
//     let secure_key = SecureKeyStorage::new(42);
//     let device_id = secure_key.get_public_key(&env);
//     let public_key = secure_key.get_secp_public_key(&env);

//     // Deploy an account
//     let first_address = factory_client.deploy(&salt, &device_id, &public_key);

//     // Deploy again with same salt but different parameters
//     let new_secure_key = SecureKeyStorage::new(100);
//     let new_device_id = new_secure_key.get_public_key(&env);
//     let new_public_key = new_secure_key.get_secp_public_key(&env);

//     let second_address = factory_client.deploy(&salt, &new_device_id, &new_public_key);

//     // Verify addresses are different (due to salt contract behavior)
//     assert!(first_address != second_address);
// }

// // Integration tests between contracts
// #[test]
// fn test_integration_auth_controller_with_factory() {
//     let env = Env::default();

//     // 1. Initialize Auth Controller
//     let auth_client = create_auth_client(&env);
//     let signers = generate_signers(&env, 3);
//     let default_threshold = 2;
//     auth_client.init(&signers, &default_threshold);

//     // 2. Create Factory Client
//     let (_, factory_client, _, _) = setup_factory_test();

//     // 3. Register factory in auth controller
//     env.mock_all_auths();
//     let context = vec![&env, Address::generate(&env)];
//     auth_client.add_factory(&factory_client.address, &context);
// }

// #[test]
// fn test_integration_auth_controller_account_factory() {
//     let env = Env::default();

//     // 1. Initialize Auth Controller
//     let auth_client = create_auth_client(&env);
//     let signers = generate_signers(&env, 3);
//     let default_threshold = 2;
//     auth_client.init(&signers, &default_threshold);

//     // 2. Setup Factory with Auth Controller
//     let auth_address = auth_client.address.clone();
//     let wasm_hash = BytesN::random(&env);
//     let factory_client = create_factory_client(&env);
//     factory_client.__constructor(&auth_address, &wasm_hash);

//     // 3. Register factory in auth controller
//     env.mock_all_auths();
//     let context = vec![&env, Address::generate(&env)];
//     auth_client.add_factory(&factory_client.address, &context);

//     // 4. Deploy an account using factory
//     let salt = BytesN::random(&env);
//     let secure_key = SecureKeyStorage::new(42);
//     let device_id = secure_key.get_public_key(&env);
//     let public_key = secure_key.get_secp_public_key(&env);

//     let account_address = factory_client.deploy(&salt, &device_id, &public_key);

//     // 5. Register the deployed account in auth controller
//     auth_client.add_account(&account_address, &context);

//     // Verify account was registered
//     let accounts = auth_client.get_accounts(&context);
//     assert_eq!(accounts.len(), 1);
//     assert_eq!(accounts.get_unchecked(0), account_address);
// }
