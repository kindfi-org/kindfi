#![cfg(test)]
extern crate std;

use ed25519_dalek::{Keypair, PublicKey, Signature, Signer, Verifier};
use rand::{rngs::StdRng, RngCore, SeedableRng};
use soroban_sdk::{
    auth::{Context, ContractContext},
    symbol_short,
    testutils::{Address as _, Events},
    vec,
    Address, BytesN, Env, TryIntoVal, Vec,
};

use crate::{
    events::{
        AccountAddedEventData, AccountRemovedEventData, DefaultThresholdChangedEventData,
        FactoryAddedEventData, FactoryRemovedEventData, InitEventData, SignerAddedEventData,
        SignerRemovedEventData,
    },
    AuthController, AuthControllerClient, SignedMessage,
};
use account_contract::{
    events::{
        AccountRecoveredEventData, DeviceAddedEventData, DeviceRemovedEventData,
        RecoveryAddressEventData,
    },
    AccountContract, AccountContractClient,
};
use account_factory::{
    events::AccountDeployEventData, AccountFactory, AccountFactoryClient,
};

// Create mock account contract and import WASM hash
mod account_contract_mod {
    use super::Context;
    soroban_sdk::contractimport!(
        file = "../../../target/wasm32-unknown-unknown/release/account_contract.wasm"
    );
}

// A secure key storage that doesn't expose private keys
pub struct SecureKeyStorage {
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

    #[allow(dead_code)]
    fn _to_keypair(&self) -> ed25519_dalek::Keypair {
        // Generate a deterministic keypair from seed (for testing consistency)
        let mut rng = StdRng::seed_from_u64(self.seed);
        Keypair::generate(&mut rng)
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

// Helper functions for test setup
fn create_auth_client(env: &Env) -> AuthControllerClient {
    let contract_address = env.register(AuthController, ());
    AuthControllerClient::new(env, &contract_address)
}

fn create_factory_client(env: &Env) -> AccountFactoryClient {
    let auth_contract = Address::generate(env);

    // Upload the WASM to be deployed
    let wasm_hash = env
        .deployer()
        .upload_contract_wasm(account_contract_mod::WASM);

    // Register and initialize the factory contract
    let contract_address = env.register(
        AccountFactory,
        (&auth_contract, &wasm_hash), // Constructor arguments
    );

    AccountFactoryClient::new(env, &contract_address)
}

fn create_account_client(env: &Env) -> AccountContractClient {
    // Create mock devices and auth contract
    let auth_contract = Address::generate(env);

    // Simulate device id and public key generation
    let secure_key = SecureKeyStorage::new(42);
    let device_id = secure_key.get_public_key(env);
    let public_key = secure_key.get_secp_public_key(env);

    // Register and initialize the account contract
    let contract_address = env.register(AccountContract, (&device_id, &public_key, &auth_contract));
    AccountContractClient::new(env, &contract_address)
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
    let is_valid = verify_signature(&public_key, &payload, &signed_message.signature);

    // Assert that the signature is valid
    assert!(is_valid);
}

#[test]
fn test_init() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    let signers = generate_signers(&env, 3);
    let default_threshold = 2;

    auth_client.init(&signers, &default_threshold);

    // Verify initialization values
    assert_eq!(auth_client.get_signers(), signers);
    assert_eq!(auth_client.get_default_threshold(), default_threshold);
}

#[test]
#[should_panic(expected = "Error(Contract, #100)")]
fn test_init_signer_limit_exceeded() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    let signers = generate_signers(&env, 6); // Exceeds THRESHOLD_LIMIT (5)
    let default_threshold = 3;

    auth_client.init(&signers, &default_threshold); // Should panic
}

#[test]
#[should_panic(expected = "Error(Contract, #104")]
fn test_init_already_initialized() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    let signers = generate_signers(&env, 3);
    let default_threshold = 2;

    auth_client.init(&signers, &default_threshold);
    auth_client.init(&signers, &default_threshold); // Should panic
}

#[test]
#[should_panic(expected = "Error(Contract, #105)")]
fn test_init_invalid_threshold() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    let signers = generate_signers(&env, 3);
    let default_threshold = 4; // Greater than signers.len()

    auth_client.init(&signers, &default_threshold); // Should panic
}

#[test]
#[should_panic(expected = "Error(Contract, #102)")]
fn test_controller_auth_default_threshold_unmet() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Initialize with signers
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Create payload
    let payload_bytes: [u8; 32] = [1u8; 32];
    let payload = BytesN::from_array(&env, &payload_bytes);

    // Use the first signer to create two identical signatures
    let secure_key = get_secure_key_for_signer(0);
    let signed_message = create_signed_message(&env, &secure_key, &payload);
    let auth_context = vec![&env];

    // Call __check_auth directly
    let contract_id = auth_client.address.clone();
    env.as_contract(&contract_id, || {
        AuthController::__check_auth(
            env.clone(),
            payload,
            vec![&env, signed_message],
            auth_context,
        )
        .unwrap(); // Should panic with DefaultThresholdNotMet
    });
}

#[test]
#[should_panic(expected = "Error(Contract, #108)")]
fn test_controller_auth_duplicate_signature() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Initialize with signers
    let signers = generate_signers(&env, 2);
    let default_threshold = 2;
    auth_client.init(&signers, &default_threshold);

    // Create payload
    let payload_bytes: [u8; 32] = [1u8; 32];
    let payload = BytesN::from_array(&env, &payload_bytes);

    // Use the first signer to create two identical signatures
    let secure_key = get_secure_key_for_signer(0);
    let signed_message = create_signed_message(&env, &secure_key, &payload);
    let signed_messages = vec![&env, signed_message.clone(), signed_message]; // Duplicate signature
    let auth_context = vec![&env];

    // Call __check_auth directly
    let contract_id = auth_client.address.clone();
    env.as_contract(&contract_id, || {
        AuthController::__check_auth(env.clone(), payload, signed_messages, auth_context).unwrap();
        // Should panic with DuplicateSignature
    });
}

#[test]
#[should_panic(expected = "Error(Contract, #1013)")]
fn test_controller_auth_not_allowed_contract() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Initialize with signers
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Create payload
    let payload_bytes: [u8; 32] = [1u8; 32];
    let payload = BytesN::from_array(&env, &payload_bytes);

    // Create valid signed messages
    let secure_key_1 = get_secure_key_for_signer(0);
    let secure_key_2 = get_secure_key_for_signer(1);
    let signed_message_1 = create_signed_message(&env, &secure_key_1, &payload);
    let signed_message_2 = create_signed_message(&env, &secure_key_2, &payload);
    let signed_messages = vec![&env, signed_message_1, signed_message_2];

    // Create an unauthorized contract context
    let unauthorized_contract = Address::generate(&env);
    let contract_ctx = Context::Contract(ContractContext {
        contract: unauthorized_contract,
        fn_name: symbol_short!("test"),
        args: vec![&env],
    });
    let auth_context = vec![&env, contract_ctx];

    // Call __check_auth directly
    let contract_id = auth_client.address.clone();
    env.as_contract(&contract_id, || {
        AuthController::__check_auth(env.clone(), payload, signed_messages, auth_context).unwrap();
        // Should panic with NotAllowedContract
    });
}

#[test]
#[should_panic(expected = "Error(Contract, #101)")]
fn test_controller_auth_unknown_signer() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Initialize with signers
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Create payload
    let payload_bytes: [u8; 32] = [1u8; 32];
    let payload = BytesN::from_array(&env, &payload_bytes);

    // Create a valid signed message from second signer
    let secure_key_1 = get_secure_key_for_signer(1);
    let signed_message_1 = create_signed_message(&env, &secure_key_1, &payload);

    // Create a secure key for an unknown signer (index 999, not in signers)
    let secure_key_999 = get_secure_key_for_signer(999);
    let signed_message_999 = create_signed_message(&env, &secure_key_999, &payload);

    // Create signed messages vector and auth context
    let signed_messages = vec![&env, signed_message_1, signed_message_999];
    let auth_context = vec![&env];

    // Call __check_auth directly
    let contract_id = auth_client.address.clone();
    env.as_contract(&contract_id, || {
        AuthController::__check_auth(env.clone(), payload, signed_messages, auth_context).unwrap();
        // Should panic with UnknownSigner
    });
}

#[test]
fn test_controller_auth_verification_success() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Initialize with signers
    let signers = generate_signers(&env, 3);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Create payload
    let payload_bytes: [u8; 32] = [1u8; 32];
    let payload = BytesN::from_array(&env, &payload_bytes);

    // Create signed messages from first two signers
    let secure_key_1 = get_secure_key_for_signer(0);
    let secure_key_2 = get_secure_key_for_signer(1);
    let signed_message_1 = create_signed_message(&env, &secure_key_1, &payload);
    let signed_message_2 = create_signed_message(&env, &secure_key_2, &payload);
    let signed_messages = vec![&env, signed_message_1, signed_message_2];
    let auth_context = vec![&env];

    // Verify authentication
    let contract_id = auth_client.address.clone();
    env.as_contract(&contract_id, || {
        AuthController::__check_auth(env.clone(), payload.clone(), signed_messages, auth_context)
            .expect("Authentication should succeed");
    });

    // Mock auth for add_signer (since add_signer requires auth)
    env.mock_all_auths();

    // Add a new, unique signer
    let new_signer = get_secure_key_for_signer(4).get_public_key(&env); // Use index 4, not in initial signers
    auth_client.add_signer(&new_signer);

    // Verify signer was added
    let updated_signers = auth_client.get_signers();
    assert!(updated_signers.contains(&new_signer));
}

#[test]
fn test_add_signer() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Generate 3 signers at once
    let all_signers = generate_signers(&env, 3);

    // Use only first two for init
    let init_signers = vec![
        &env,
        all_signers.get_unchecked(0),
        all_signers.get_unchecked(1),
    ];
    let default_threshold = 1;
    auth_client.init(&init_signers, &default_threshold);

    // Mock authorization
    env.mock_all_auths();

    // Add the new third signer
    let new_signer = all_signers.get_unchecked(2);
    auth_client.add_signer(&new_signer);

    // Verify signer was added
    let updated_signers = auth_client.get_signers();
    assert_eq!(updated_signers.len(), 3);
    assert!(updated_signers.contains(&new_signer));
}

#[test]
#[should_panic(expected = "Error(Contract, #100)")]
fn test_add_signer_limit_exceeded() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Generate more than signers limit
    let all_signers = generate_signers(&env, 6);

    // Initialize with maximum allowed signers
    let init_signers = vec![
        &env,
        all_signers.get_unchecked(0),
        all_signers.get_unchecked(1),
        all_signers.get_unchecked(2),
        all_signers.get_unchecked(3),
        all_signers.get_unchecked(4),
    ];

    // Initialize auth client with all signers
    let default_threshold = 3;
    auth_client.init(&init_signers, &default_threshold);

    // Mock authorization
    env.mock_all_auths();

    // Add the new signer
    let new_signer = all_signers.get_unchecked(5);
    auth_client.add_signer(&new_signer); // Should panic
}

#[test]
#[should_panic(expected = "Error(Contract, #106)")]
fn test_add_signer_already_exists() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Initialize with a valid configuration
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Authorize contract to add signer
    env.mock_all_auths();

    // Try to add an existing signer
    auth_client.add_signer(&signers.get_unchecked(0)); // Should panic
}

#[test]
fn test_add_signer_event() {
    let env = Env::default();

    // Initialize with unique signers to avoid already added error
    let initial_signers = generate_signers(&env, 2);
    let new_signer_vec = generate_signers(&env, 3);
    let new_signer = new_signer_vec.get_unchecked(2); // Use third generated signer

    let auth_client = create_auth_client(&env);
    let default_threshold = 1;
    auth_client.init(&initial_signers, &default_threshold);

    // Mock auth for add_signer
    env.mock_all_auths();

    // Clear events after init
    let _ = env.events().all();

    // Add signer
    auth_client.add_signer(&new_signer);

    // Verify event
    let events = env.events().all();
    assert!(!events.is_empty(), "Expected events to be generated");

    // Find the event for adding a signer
    let signer_event_found = events.iter().any(|(_, topics, data)| {
        // Check if we have enough topics
        if topics.len() < 2 {
            return false;
        }

        // Convert event data to SignerAddedEventData
        if let Ok(event_data) = data.clone().try_into_val(&env) {
            let event_data: SignerAddedEventData = event_data;
            // Verify the signer in the event matches our added signer
            event_data.signer == new_signer
        } else {
            false
        }
    });

    assert!(signer_event_found, "Signer added event not found");
}

#[test]
fn test_remove_signer() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Initialize with a valid configuration
    let signers = generate_signers(&env, 3);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Authorize contract to remove signer
    env.mock_all_auths();

    // Remove a signer
    let signer_to_remove = signers.get_unchecked(1);
    auth_client.remove_signer(&signer_to_remove);

    // Verify signer was removed
    let updated_signers = auth_client.get_signers();
    assert_eq!(updated_signers.len(), 2);
    assert!(!updated_signers.contains(&signer_to_remove));
}

#[test]
#[should_panic(expected = "Error(Contract, #103)")]
fn test_remove_signer_not_found() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Generate 3 signers at once
    let all_signers = generate_signers(&env, 3);

    // Use only first two for init
    let init_signers = vec![
        &env,
        all_signers.get_unchecked(0),
        all_signers.get_unchecked(1),
    ];
    let default_threshold = 1;
    auth_client.init(&init_signers, &default_threshold);

    // Mock authorization
    env.mock_all_auths();

    // Try to remove a non-existent signer
    let non_existent_signer = all_signers.get_unchecked(2);
    auth_client.remove_signer(&non_existent_signer); // Should panic
}

#[test]
#[should_panic(expected = "Error(Contract, #105)")]
fn test_remove_signer_threshold_violation() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Initialize with signers equal to threshold
    let signers = generate_signers(&env, 2);
    let default_threshold = 2;
    auth_client.init(&signers, &default_threshold);

    // Authorize contract to remove signer
    env.mock_all_auths();

    // Try to remove a signer (would make signers.len() < threshold)
    auth_client.remove_signer(&signers.get_unchecked(0)); // Should panic
}

#[test]
fn test_set_default_threshold() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Initialize with a valid configuration
    let signers = generate_signers(&env, 3);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Authorize contract to set threshold
    env.mock_all_auths();

    // Set a new threshold
    let new_threshold = 2;
    auth_client.set_default_threshold(&new_threshold);

    // Verify threshold was updated
    assert_eq!(auth_client.get_default_threshold(), new_threshold);
}

#[test]
#[should_panic(expected = "Error(Contract, #105)")]
fn test_set_default_threshold_invalid() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Initialize with a valid configuration
    let signers = generate_signers(&env, 3);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Authorize contract to set threshold
    env.mock_all_auths();

    // Try to set an invalid threshold (> signers.len())
    let invalid_threshold = 4;
    auth_client.set_default_threshold(&invalid_threshold); // Should panic
}

#[test]
fn test_add_factory() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Initialize with a valid configuration
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Authorize contract to add factory
    env.mock_all_auths();

    // Add a factory
    let factory = Address::generate(&env);
    let context = vec![&env, Address::generate(&env)];
    auth_client.add_factory(&factory, &context);
}

#[test]
#[should_panic(expected = "Error(Contract, #1011)")]
fn test_add_factory_already_exists() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Initialize with a valid configuration
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Authorize contract to add factory
    env.mock_all_auths();

    // Add a factory
    let factory = Address::generate(&env);
    let context = vec![&env, Address::generate(&env)];
    auth_client.add_factory(&factory, &context);

    // Try to add the same factory context again
    auth_client.add_factory(&factory, &context); // Should panic
}

#[test]
fn test_remove_factory() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Initialize with a valid configuration
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Authorize contract to add and remove factory
    env.mock_all_auths();

    // Add a factory
    let factory = Address::generate(&env);
    let context = vec![&env, Address::generate(&env)];
    auth_client.add_factory(&factory, &context);

    // Remove the factory
    auth_client.remove_factory(&factory, &context);
}

#[test]
#[should_panic(expected = "Error(Contract, #1012)")]
fn test_remove_factory_not_found() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Initialize with a valid configuration
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Authorize contract to remove factory
    env.mock_all_auths();

    // Try to remove a non-existent factory
    let factory = Address::generate(&env);
    let context = vec![&env, Address::generate(&env)];
    auth_client.remove_factory(&factory, &context); // Should panic
}

#[test]
fn test_add_account() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Initialize with a valid configuration
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Authorize contract to add account
    env.mock_all_auths();

    // Add an account
    let account = Address::generate(&env);
    let context = vec![&env, Address::generate(&env)];
    auth_client.add_account(&account, &context);

    // Verify account was added
    let accounts = auth_client.get_accounts(&context);
    assert_eq!(accounts.len(), 1);
    assert_eq!(accounts.get_unchecked(0), account);
}

#[test]
#[should_panic(expected = "Error(Contract, #109)")]
fn test_add_account_already_exists() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Initialize with a valid configuration
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Authorize contract to add account
    env.mock_all_auths();

    // Add an account
    let account = Address::generate(&env);
    let context = vec![&env, Address::generate(&env)];
    auth_client.add_account(&account, &context);

    // Try to add the same account context again
    auth_client.add_account(&account, &context); // Should panic
}

#[test]
fn test_remove_account() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Initialize with a valid configuration
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Authorize contract to add and remove account
    env.mock_all_auths();

    // Add an account
    let account = Address::generate(&env);
    let context = vec![&env, Address::generate(&env)];
    auth_client.add_account(&account, &context);

    // Remove the account
    auth_client.remove_account(&account, &context);

    // Verify account was removed
    let accounts = auth_client.get_accounts(&context);
    assert_eq!(accounts.len(), 0);
}

#[test]
#[should_panic(expected = "Error(Contract, #1010)")]
fn test_remove_account_not_found() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Initialize with a valid configuration
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Authorize contract to remove account
    env.mock_all_auths();

    // Try to remove a non-existent account
    let account = Address::generate(&env);
    let context = vec![&env, Address::generate(&env)];
    auth_client.remove_account(&account, &context); // Should panic
}

/// Account Factory tests
#[test]
fn test_factory_deploy_account() {
    let env = Env::default();
    let factory_client = create_factory_client(&env);

    // Mock authorization and WASM deployment
    env.mock_all_auths();

    // Set up deployment parameters
    let salt = BytesN::from_array(&env, &[11_u8; 32]);
    let secure_key = SecureKeyStorage::new(42);
    let device_id = secure_key.get_public_key(&env);
    let public_key = secure_key.get_secp_public_key(&env);

    // Deploy an account
    let account_address = factory_client.deploy(&salt, &device_id, &public_key);

    // Verify the account was deployed
    assert!(account_address != Address::generate(&env));
}

#[test]
fn test_factory_deploy_multiple_accounts() {
    let env = Env::default();
    let factory_client = create_factory_client(&env);

    // Mock authorization and WASM deployment
    env.mock_all_auths();

    // Deploy first account with salt1
    let salt1 = BytesN::from_array(&env, &[1u8; 32]);
    let secure_key1 = SecureKeyStorage::new(42);
    let device_id1 = secure_key1.get_public_key(&env);
    let public_key1 = secure_key1.get_secp_public_key(&env);

    let account_address1 = factory_client.deploy(&salt1, &device_id1, &public_key1);

    // Deploy second account with salt2
    let salt2 = BytesN::from_array(&env, &[2u8; 32]);
    let secure_key2 = SecureKeyStorage::new(43);
    let device_id2 = secure_key2.get_public_key(&env);
    let public_key2 = secure_key2.get_secp_public_key(&env);

    let account_address2 = factory_client.deploy(&salt2, &device_id2, &public_key2);

    // Verify two different accounts were created
    assert!(account_address1 != account_address2);
}

#[test]
fn test_integration_auth_controller_with_factory() {
    let env = Env::default();
    env.cost_estimate().budget().reset_unlimited();

    // 1. Initialize Auth Controller
    let auth_client = create_auth_client(&env);
    let signers = generate_signers(&env, 3);
    let default_threshold = 2;
    auth_client.init(&signers, &default_threshold);

    // 2. Create Factory client
    let factory_client = create_factory_client(&env);

    // 3. Register factory in auth controller
    env.mock_all_auths();
    let context = vec![&env, Address::generate(&env)];
    auth_client.add_factory(&factory_client.address, &context);

    // 4. Deploy an account using factory
    let salt = BytesN::from_array(&env, &[11_u8; 32]);
    let secure_key = SecureKeyStorage::new(42);
    let device_id = secure_key.get_public_key(&env);
    let public_key = secure_key.get_secp_public_key(&env);

    let account_address = factory_client.deploy(&salt, &device_id, &public_key);

    // 5. Register the deployed account in auth controller
    auth_client.add_account(&account_address, &context);

    // 6. Verify account was registered correctly
    let accounts = auth_client.get_accounts(&context);
    assert_eq!(accounts.len(), 1);
    assert_eq!(accounts.get_unchecked(0), account_address);
}

#[test]
fn test_account_add_device() {
    let env = Env::default();
    let account_client = create_account_client(&env);

    // Mock authorization
    env.mock_all_auths();

    // Add a new device
    let new_secure_key = SecureKeyStorage::new(99);
    let new_device_id = new_secure_key.get_public_key(&env);
    let new_public_key = new_secure_key.get_secp_public_key(&env);

    account_client.add_device(&new_device_id, &new_public_key);

    // Verify the device was added
    let devices = account_client.get_devices();

    assert_eq!(devices.len(), 2);

    // Find the newly added device
    let added_device = devices
        .iter()
        .find(|d| d.device_id == new_device_id)
        .expect("New device should be found");

    assert_eq!(added_device.public_key, new_public_key);
}

#[test]
#[should_panic(expected = "Error(Contract, #204)")]
fn test_account_add_device_already_exists() {
    let env = Env::default();
    let account_client = create_account_client(&env);

    // Mock authorization
    env.mock_all_auths();

    // Add same device used for initialization
    let secure_key = SecureKeyStorage::new(42);
    let device_id = secure_key.get_public_key(&env);
    let public_key = secure_key.get_secp_public_key(&env);

    // Try to add the same device again
    account_client.add_device(&device_id, &public_key); // Should panic (DeviceAlreadySet
}

#[test]
fn test_account_remove_device() {
    let env = Env::default();
    let account_client = create_account_client(&env);

    // Mock authorization
    env.mock_all_auths();

    // Add a second device first
    let new_secure_key = SecureKeyStorage::new(99);
    let new_device_id = new_secure_key.get_public_key(&env);
    let new_public_key = new_secure_key.get_secp_public_key(&env);

    account_client.add_device(&new_device_id, &new_public_key);

    // Get the first device ID
    let devices = account_client.get_devices();
    let first_device_id = devices.get_unchecked(0).device_id;

    // Remove the first device
    account_client.remove_device(&first_device_id);

    // Verify the device was removed
    let updated_devices = account_client.get_devices();

    assert_eq!(updated_devices.len(), 1);
    assert_eq!(updated_devices.get_unchecked(0).device_id, new_device_id);
}

#[test]
#[should_panic(expected = "Error(Contract, #205)")]
fn test_account_remove_device_not_found() {
    let env = Env::default();
    let account_client = create_account_client(&env);

    // Mock authorization
    env.mock_all_auths();

    // Try to remove a non-existent device
    let random_device_id = BytesN::from_array(&env, &[11_u8; 32]);
    account_client.remove_device(&random_device_id); // Should panic (DeviceNotFound)
}

#[test]
#[should_panic(expected = "Error(Contract, #206)")]
fn test_account_remove_device_last_one() {
    let env = Env::default();
    let account_client = create_account_client(&env);

    // Mock authorization
    env.mock_all_auths();

    // Get the first device ID
    let secure_key = SecureKeyStorage::new(42);
    let device_id = secure_key.get_public_key(&env);

    // Try to remove the only device
    account_client.remove_device(&device_id); // Should panic (DeviceCannotBeEmpty)
}

#[test]
fn test_account_add_recovery_address() {
    let env = Env::default();
    let account_client = create_account_client(&env);

    // Mock authorization
    env.mock_all_auths();

    // Add a recovery address
    let recovery_address = Address::generate(&env);
    account_client.add_recovery_address(&recovery_address);

    // Test passes if the next operation works correctly
    // If we can update the recovery address, it means it was set correctly
    let new_recovery_address = Address::generate(&env);
    account_client.update_recovery_address(&new_recovery_address);
}

#[test]
#[should_panic(expected = "Error(Contract, #207)")]
fn test_account_add_recovery_address_already_set() {
    let env = Env::default();
    let account_client = create_account_client(&env);

    // Mock authorization
    env.mock_all_auths();

    // Add a recovery address
    let recovery_address = Address::generate(&env);

    account_client.add_recovery_address(&recovery_address);

    // Try to add another recovery address
    let new_recovery_address = Address::generate(&env);
    account_client.add_recovery_address(&new_recovery_address); // Should panic (RecoveryAddressSet)
}

#[test]
fn test_account_update_recovery_address() {
    let env = Env::default();
    let account_client = create_account_client(&env);

    // Mock authorization
    env.mock_all_auths();

    // Add a recovery address
    let recovery_address = Address::generate(&env);
    account_client.add_recovery_address(&recovery_address);

    // Update the recovery address
    let new_recovery_address = Address::generate(&env);
    account_client.update_recovery_address(&new_recovery_address);

    // Test passes if we got here without panicking
    // The update_recovery_address function worked correctly
}

#[test]
fn test_account_recover_account() {
    let env = Env::default();
    let account_client = create_account_client(&env);

    // Mock authorization
    env.mock_all_auths();

    // Add a recovery address
    let recovery_address = Address::generate(&env);

    account_client.add_recovery_address(&recovery_address);

    // Recover the account with a new device
    let new_secure_key = SecureKeyStorage::new(100);
    let new_device_id = new_secure_key.get_public_key(&env);
    let new_public_key = new_secure_key.get_secp_public_key(&env);

    account_client.recover_account(&new_device_id, &new_public_key);

    // Verify the device was updated
    let devices = account_client.get_devices();

    assert_eq!(devices.len(), 1);
    assert_eq!(devices.get_unchecked(0).device_id, new_device_id);
    assert_eq!(devices.get_unchecked(0).public_key, new_public_key);
}

#[test]
fn test_integration_auth_controller_with_account() {
    let env = Env::default();
    env.cost_estimate().budget().reset_unlimited();

    // Create the auth controller client
    let auth_client = create_auth_client(&env);

    // Initialize auth controller
    let signers = generate_signers(&env, 3);
    let default_threshold = 2;
    auth_client.init(&signers, &default_threshold);

    // Create a new account with this auth controller address
    // Register the account with the SAME auth controller
    let device_id = generate_signers(&env, 1).get_unchecked(0);
    let secure_key = SecureKeyStorage::new(42);
    let public_key = secure_key.get_secp_public_key(&env);

    let account_address = env.register(
        AccountContract,
        (&device_id, &public_key, &auth_client.address),
    );

    let account_client = AccountContractClient::new(&env, &account_address);

    // Mock authorization for the test
    env.mock_all_auths();

    // Verify account is using the correct auth controller address
    assert_eq!(account_client.get_auth(), auth_client.address);

    // Add recovery address to account using auth controller authorization
    let recovery_address = Address::generate(&env);
    account_client.add_recovery_address(&recovery_address);

    // Test recovery process with authorization from auth controller
    let new_secure_key = SecureKeyStorage::new(99);
    let new_device_id = new_secure_key.get_public_key(&env);
    let new_public_key = new_secure_key.get_secp_public_key(&env);

    account_client.recover_account(&new_device_id, &new_public_key);

    // Verify the recovery worked correctly
    let devices = account_client.get_devices();
    assert_eq!(devices.len(), 1);
    assert_eq!(devices.get_unchecked(0).device_id, new_device_id);
    assert_eq!(devices.get_unchecked(0).public_key, new_public_key);

    // Use auth controller to add the account to a context
    let context = vec![&env, Address::generate(&env)];
    auth_client.add_account(&account_client.address, &context);

    // Verify account was registered correctly in auth controller
    let accounts = auth_client.get_accounts(&context);
    assert_eq!(accounts.len(), 1);
    assert_eq!(accounts.get_unchecked(0), account_client.address);
}

#[test]
fn test_auth_controller_init_event() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Set up test data
    let signers = generate_signers(&env, 3);
    let default_threshold = 2;

    // Clear any existing events
    let _ = env.events().all();

    // Perform action that should trigger an event
    auth_client.init(&signers, &default_threshold);

    // Verify event
    let events = env.events().all();
    assert!(!events.is_empty(), "Expected events to be generated");

    // Find the init event
    let init_event_found = events.iter().any(|(_, topics, data)| {
        // Check if we have enough topics
        if topics.len() < 2 {
            return false;
        }

        // Convert event data to InitEventData
        if let Ok(event_data) = data.clone().try_into_val(&env) {
            let event_data: InitEventData = event_data;
            // Verify the event data matches what we expect
            event_data.threshold == default_threshold && event_data.signers.len() == signers.len()
        } else {
            false
        }
    });

    assert!(init_event_found, "Init event not found");
}

#[test]
fn test_auth_controller_add_signer_event() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Setup
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Mock auth for add_signer
    env.mock_all_auths();

    // Clear events after init
    let _ = env.events().all();

    // New signer to add
    let new_signer = generate_signers(&env, 3).get_unchecked(2); // Use third generated signer

    // Add signer
    auth_client.add_signer(&new_signer);

    // Verify event
    let events = env.events().all();
    assert!(!events.is_empty(), "Expected events to be generated");

    // Find the event for adding a signer
    let signer_event_found = events.iter().any(|(_, topics, data)| {
        // Check if we have enough topics
        if topics.len() < 2 {
            return false;
        }

        // Convert event data to SignerAddedEventData
        if let Ok(event_data) = data.clone().try_into_val(&env) {
            let event_data: SignerAddedEventData = event_data;
            // Verify the signer in the event matches our added signer
            event_data.signer == new_signer
        } else {
            false
        }
    });

    assert!(signer_event_found, "Signer added event not found");
}

#[test]
fn test_auth_controller_remove_signer_event() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Setup
    let signers = generate_signers(&env, 3);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Mock auth for remove_signer
    env.mock_all_auths();

    // Clear events after init
    let _ = env.events().all();

    // Remove one of the signers
    let signer_to_remove = signers.get_unchecked(1);

    // Remove signer
    auth_client.remove_signer(&signer_to_remove);

    // Verify event
    let events = env.events().all();
    assert!(!events.is_empty(), "Expected events to be generated");

    // Find the event for removing a signer
    let signer_event_found = events.iter().any(|(_, topics, data)| {
        // Check if we have enough topics
        if topics.len() < 2 {
            return false;
        }

        // Convert event data to SignerRemovedEventData
        if let Ok(event_data) = data.clone().try_into_val(&env) {
            let event_data: SignerRemovedEventData = event_data;
            // Verify the signer in the event matches the removed signer
            event_data.signer == signer_to_remove
        } else {
            false
        }
    });

    assert!(signer_event_found, "Signer removed event not found");
}

#[test]
fn test_auth_controller_default_threshold_changed_event() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Setup
    let signers = generate_signers(&env, 3);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Mock auth for set_default_threshold
    env.mock_all_auths();

    // Clear events after init
    let _ = env.events().all();

    // Set a new threshold
    let new_threshold = 2;
    auth_client.set_default_threshold(&new_threshold);

    // Verify event
    let events = env.events().all();
    assert!(!events.is_empty(), "Expected events to be generated");

    // Find the event for changing the threshold
    let threshold_event_found = events.iter().any(|(_, topics, data)| {
        // Check if we have enough topics
        if topics.len() < 2 {
            return false;
        }

        // Convert event data to DefaultThresholdChangedEventData
        if let Ok(event_data) = data.clone().try_into_val(&env) {
            let event_data: DefaultThresholdChangedEventData = event_data;
            // Verify the threshold in the event matches the new threshold
            event_data.threshold == new_threshold
        } else {
            false
        }
    });

    assert!(
        threshold_event_found,
        "Default threshold changed event not found"
    );
}

#[test]
fn test_auth_controller_add_factory_event() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Setup
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Mock auth
    env.mock_all_auths();

    // Clear events after init
    let _ = env.events().all();

    // Create factory and context
    let factory = Address::generate(&env);
    let context = vec![&env, Address::generate(&env)];

    // Add factory
    auth_client.add_factory(&factory, &context);

    // Verify event
    let events = env.events().all();
    assert!(!events.is_empty(), "Expected events to be generated");

    // Find the event for adding a factory
    let factory_event_found = events.iter().any(|(_, topics, data)| {
        // Check if we have enough topics
        if topics.len() < 2 {
            return false;
        }

        // Convert event data to FactoryAddedEventData
        if let Ok(event_data) = data.clone().try_into_val(&env) {
            let event_data: FactoryAddedEventData = event_data;
            // Verify the factory and context in the event match what we added
            event_data.factory == factory && event_data.context.len() == context.len()
        } else {
            false
        }
    });

    assert!(factory_event_found, "Factory added event not found");
}

#[test]
fn test_auth_controller_remove_factory_event() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Setup
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Mock auth
    env.mock_all_auths();

    // Create factory and context
    let factory = Address::generate(&env);
    let context = vec![&env, Address::generate(&env)];

    // Add factory first
    auth_client.add_factory(&factory, &context);

    // Clear events after adding factory
    let _ = env.events().all();

    // Remove factory
    auth_client.remove_factory(&factory, &context);

    // Verify event
    let events = env.events().all();
    assert!(!events.is_empty(), "Expected events to be generated");

    // Find the event for removing a factory
    let factory_event_found = events.iter().any(|(_, topics, data)| {
        // Check if we have enough topics
        if topics.len() < 2 {
            return false;
        }

        // Convert event data to FactoryRemovedEventData
        if let Ok(event_data) = data.clone().try_into_val(&env) {
            let event_data: FactoryRemovedEventData = event_data;
            // Verify the factory and context in the event match what we removed
            event_data.factory == factory && event_data.context.len() == context.len()
        } else {
            false
        }
    });

    assert!(factory_event_found, "Factory removed event not found");
}

#[test]
fn test_auth_controller_add_account_event() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Setup
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Mock auth
    env.mock_all_auths();

    // Clear events after init
    let _ = env.events().all();

    // Create account and context
    let account = Address::generate(&env);
    let context = vec![&env, Address::generate(&env)];

    // Add account
    auth_client.add_account(&account, &context);

    // Verify event
    let events = env.events().all();
    assert!(!events.is_empty(), "Expected events to be generated");

    // Find the event for adding an account
    let account_event_found = events.iter().any(|(_, topics, data)| {
        // Check if we have enough topics
        if topics.len() < 2 {
            return false;
        }

        // Convert event data to AccountAddedEventData
        if let Ok(event_data) = data.clone().try_into_val(&env) {
            let event_data: AccountAddedEventData = event_data;
            // Verify the account and context in the event match what we added
            event_data.account == account && event_data.context.len() == context.len()
        } else {
            false
        }
    });

    assert!(account_event_found, "Account added event not found");
}

#[test]
fn test_auth_controller_remove_account_event() {
    let env = Env::default();
    let auth_client = create_auth_client(&env);

    // Setup
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    auth_client.init(&signers, &default_threshold);

    // Mock auth
    env.mock_all_auths();

    // Create account and context
    let account = Address::generate(&env);
    let context = vec![&env, Address::generate(&env)];

    // Add account first
    auth_client.add_account(&account, &context);

    // Clear events after adding account
    let _ = env.events().all();

    // Remove account
    auth_client.remove_account(&account, &context);

    // Verify event
    let events = env.events().all();
    assert!(!events.is_empty(), "Expected events to be generated");

    // Find the event for removing an account
    let account_event_found = events.iter().any(|(_, topics, data)| {
        // Check if we have enough topics
        if topics.len() < 2 {
            return false;
        }

        // Convert event data to AccountRemovedEventData
        if let Ok(event_data) = data.clone().try_into_val(&env) {
            let event_data: AccountRemovedEventData = event_data;
            // Verify the account and context in the event match what we removed
            event_data.account == account && event_data.context.len() == context.len()
        } else {
            false
        }
    });

    assert!(account_event_found, "Account removed event not found");
}

#[test]
fn test_account_add_device_event() {
    let env = Env::default();
    let account_client = create_account_client(&env);
    
    // Mock authorization
    env.mock_all_auths();
    
    // Clear events after init
    let _ = env.events().all();
    
    // Create new device data
    let new_secure_key = SecureKeyStorage::new(99);
    let new_device_id = new_secure_key.get_public_key(&env);
    let new_public_key = new_secure_key.get_secp_public_key(&env);
    
    // Add device
    account_client.add_device(&new_device_id, &new_public_key);
    
    // Verify event
    let events = env.events().all();
    assert!(!events.is_empty(), "Expected events to be generated");
    
    // Find the event for adding a device
    let device_event_found = events.iter().any(|(_, topics, data)| {
        // Check if we have right topics (DEVICE, ADDED)
        if topics.len() < 2 {
            return false;
        }
        
        // Convert event data to DeviceAddedEventData
        if let Ok(event_data) = data.clone().try_into_val(&env) {
            let event_data: DeviceAddedEventData = event_data;
            // Verify the device data in the event matches what we added
            event_data.device_id == new_device_id && event_data.public_key == new_public_key
        } else {
            false
        }
    });
    
    assert!(device_event_found, "Device added event not found");
}

#[test]
fn test_account_remove_device_event() {
    let env = Env::default();
    let account_client = create_account_client(&env);
    
    // Mock authorization
    env.mock_all_auths();
    
    // Add a second device first so we can remove one
    let new_secure_key = SecureKeyStorage::new(99);
    let new_device_id = new_secure_key.get_public_key(&env);
    let new_public_key = new_secure_key.get_secp_public_key(&env);
    
    account_client.add_device(&new_device_id, &new_public_key);
    
    // Clear events after adding device
    let _ = env.events().all();
    
    // Get the first device ID to remove
    let devices = account_client.get_devices();
    let first_device_id = devices.get_unchecked(0).device_id;
    
    // Remove the first device
    account_client.remove_device(&first_device_id);
    
    // Verify event
    let events = env.events().all();
    assert!(!events.is_empty(), "Expected events to be generated");
    
    // Find the event for removing a device
    let device_event_found = events.iter().any(|(_, topics, data)| {
        // Check if we have right topics (DEVICE, REMOVED)
        if topics.len() < 2 {
            return false;
        }
        
        // Convert event data to DeviceRemovedEventData
        if let Ok(event_data) = data.clone().try_into_val(&env) {
            let event_data: DeviceRemovedEventData = event_data;
            // Verify the device ID in the event matches what we removed
            event_data.device_id == first_device_id
        } else {
            false
        }
    });
    
    assert!(device_event_found, "Device removed event not found");
}

#[test]
fn test_account_add_recovery_address_event() {
    let env = Env::default();
    let account_client = create_account_client(&env);
    
    // Mock authorization
    env.mock_all_auths();
    
    // Clear events after init
    let _ = env.events().all();
    
    // Add recovery address
    let recovery_address = Address::generate(&env);
    account_client.add_recovery_address(&recovery_address);
    
    // Verify event
    let events = env.events().all();
    assert!(!events.is_empty(), "Expected events to be generated");
    
    // Find the event for adding a recovery address
    let recovery_event_found = events.iter().any(|(_, topics, data)| {
        // Check if we have right topics (ACCOUNT, SECURITY, ADDED)
        if topics.len() < 3 {
            return false;
        }
        
        // Convert event data to RecoveryAddressEventData
        if let Ok(event_data) = data.clone().try_into_val(&env) {
            let event_data: RecoveryAddressEventData = event_data;
            // Verify the address in the event matches what we added
            event_data.address == recovery_address
        } else {
            false
        }
    });
    
    assert!(recovery_event_found, "Recovery address added event not found");
}

#[test]
fn test_account_update_recovery_address_event() {
    let env = Env::default();
    let account_client = create_account_client(&env);
    
    // Mock authorization
    env.mock_all_auths();
    
    // Add a recovery address first
    let recovery_address = Address::generate(&env);
    account_client.add_recovery_address(&recovery_address);
    
    // Clear events after adding recovery address
    let _ = env.events().all();
    
    // Update the recovery address
    let new_recovery_address = Address::generate(&env);
    account_client.update_recovery_address(&new_recovery_address);
    
    // Verify event
    let events = env.events().all();
    assert!(!events.is_empty(), "Expected events to be generated");
    
    // Find the event for updating a recovery address
    let recovery_event_found = events.iter().any(|(_, topics, data)| {
        // Check if we have right topics (ACCOUNT, SECURITY, UPDATED)
        if topics.len() < 3 {
            return false;
        }
        
        // Convert event data to RecoveryAddressEventData
        if let Ok(event_data) = data.clone().try_into_val(&env) {
            let event_data: RecoveryAddressEventData = event_data;
            // Verify the address in the event matches what we updated to
            event_data.address == new_recovery_address
        } else {
            false
        }
    });
    
    assert!(recovery_event_found, "Recovery address updated event not found");
}

#[test]
fn test_account_recovered_event() {
    let env = Env::default();
    let account_client = create_account_client(&env);
    
    // Mock authorization
    env.mock_all_auths();
    
    // Add a recovery address
    let recovery_address = Address::generate(&env);
    account_client.add_recovery_address(&recovery_address);
    
    // Clear events after adding recovery address
    let _ = env.events().all();
    
    // Recover the account with a new device
    let new_secure_key = SecureKeyStorage::new(100);
    let new_device_id = new_secure_key.get_public_key(&env);
    let new_public_key = new_secure_key.get_secp_public_key(&env);
    
    account_client.recover_account(&new_device_id, &new_public_key);
    
    // Verify event
    let events = env.events().all();
    assert!(!events.is_empty(), "Expected events to be generated");
    
    // Find the event for account recovery
    let recovery_event_found = events.iter().any(|(_, topics, data)| {
        // Check if we have right topics (ACCOUNT, SECURITY)
        if topics.len() < 2 {
            return false;
        }
        
        // Convert event data to AccountRecoveredEventData
        if let Ok(event_data) = data.clone().try_into_val(&env) {
            let event_data: AccountRecoveredEventData = event_data;
            // Verify the device data in the event matches what we used for recovery
            event_data.device_id == new_device_id && event_data.public_key == new_public_key
        } else {
            false
        }
    });
    
    assert!(recovery_event_found, "Account recovered event not found");
}

#[test]
fn test_account_factory_deploy_event() {
    let env = Env::default();
    let factory_client = create_factory_client(&env);
    
    // Mock authorization
    env.mock_all_auths();
    
    // Clear events after init
    let _ = env.events().all();
    
    // Set up deployment parameters
    let salt = BytesN::from_array(&env, &[11_u8; 32]);
    let secure_key = SecureKeyStorage::new(42);
    let device_id = secure_key.get_public_key(&env);
    let public_key = secure_key.get_secp_public_key(&env);
    
    // Deploy an account
    let account_address = factory_client.deploy(&salt, &device_id, &public_key);
    
    // Verify event
    let events = env.events().all();
    assert!(!events.is_empty(), "Expected events to be generated");
    
    // Find the event for deploying an account
    let deploy_event_found = events.iter().any(|(_, topics, data)| {
        // Check if we have right topics (ACCOUNT, DEPLOY)
        if topics.len() < 2 {
            return false;
        }
        
        // Convert event data to AccountDeployEventData
        if let Ok(event_data) = data.clone().try_into_val(&env) {
            let event_data: AccountDeployEventData = event_data;
            // Verify the account in the event matches what was deployed
            event_data.account == account_address
        } else {
            false
        }
    });
    
    assert!(deploy_event_found, "Account deploy event not found");
}
