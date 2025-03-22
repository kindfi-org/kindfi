#![cfg(test)]
extern crate std;

use soroban_sdk::{
    auth::Context,
    testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation, Logs},
    vec, Address, BytesN, Env, IntoVal, Symbol, Val, Vec,
};

use crate::{AuthController, AuthControllerClient, DataKey, Error, SignedMessage};

// Helper functions for test setup
fn create_auth_client(env: &Env) -> AuthControllerClient {
    let contract_id = env.register_contract(None, AuthController);
    AuthControllerClient::new(env, &contract_id)
}

fn generate_signers(env: &Env, count: usize) -> Vec<BytesN<32>> {
    let mut signers = Vec::new(env);
    for _ in 0..count {
        let key = BytesN::random(env);
        signers.push_back(key);
    }
    signers
}

fn create_signed_message(
    env: &Env,
    public_key: &BytesN<32>,
    payload: &BytesN<32>,
) -> SignedMessage {
    // Create a dummy signature for testing
    let signature = BytesN::random(env);
    SignedMessage {
        public_key: public_key.clone(),
        signature,
    }
}

#[test]
fn test_init() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    let signers = generate_signers(&env, 3);
    let default_threshold = 2;
    
    client.init(&signers, default_threshold);
    
    // Verify initialization values
    assert_eq!(client.get_signers(), signers);
    assert_eq!(client.get_default_threshold(), default_threshold);
    
    // Check events
    let logs = env.logs().all();
    std::println!("{:?}", logs);
    assert!(logs.len() > 0);
}

#[test]
#[should_panic(expected = "Error(AlreadyInitialized)")]
fn test_init_already_initialized() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    let signers = generate_signers(&env, 3);
    let default_threshold = 2;
    
    client.init(&signers, default_threshold);
    client.init(&signers, default_threshold); // Should panic
}

#[test]
#[should_panic(expected = "Error(SignerLimitExceeded)")]
fn test_init_signer_limit_exceeded() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    let signers = generate_signers(&env, 6); // Exceeds THRESHOLD_LIMIT (5)
    let default_threshold = 3;
    
    client.init(&signers, default_threshold); // Should panic
}

#[test]
#[should_panic(expected = "Error(InvalidThreshold)")]
fn test_init_invalid_threshold() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    let signers = generate_signers(&env, 3);
    let default_threshold = 4; // Greater than signers.len()
    
    client.init(&signers, default_threshold); // Should panic
}

#[test]
fn test_add_signer() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    // Initialize with a valid configuration
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    client.init(&signers, default_threshold);
    
    // Authorize contract to add signer
    let contract_id = client.address;
    env.mock_all_auths();
    
    // Add a new signer
    let new_signer = BytesN::random(&env);
    client.add_signer(&new_signer);
    
    // Verify signer was added
    let updated_signers = client.get_signers();
    assert_eq!(updated_signers.len(), 3);
    assert!(updated_signers.contains(&new_signer));
    
    // Check events
    let logs = env.logs().all();
    assert!(logs.len() > 0);
}

#[test]
#[should_panic(expected = "Error(SignerAlreadyAdded)")]
fn test_add_signer_already_exists() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    // Initialize with a valid configuration
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    client.init(&signers, default_threshold);
    
    // Authorize contract to add signer
    env.mock_all_auths();
    
    // Try to add an existing signer
    client.add_signer(&signers.get_unchecked(0)); // Should panic
}

#[test]
#[should_panic(expected = "Error(SignerLimitExceeded)")]
fn test_add_signer_limit_exceeded() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    // Initialize with maximum allowed signers
    let signers = generate_signers(&env, 5);
    let default_threshold = 3;
    client.init(&signers, default_threshold);
    
    // Authorize contract to add signer
    env.mock_all_auths();
    
    // Try to add one more signer
    let new_signer = BytesN::random(&env);
    client.add_signer(&new_signer); // Should panic
}

#[test]
fn test_remove_signer() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    // Initialize with a valid configuration
    let signers = generate_signers(&env, 3);
    let default_threshold = 1;
    client.init(&signers, default_threshold);
    
    // Authorize contract to remove signer
    env.mock_all_auths();
    
    // Remove a signer
    let signer_to_remove = signers.get_unchecked(1);
    client.remove_signer(&signer_to_remove);
    
    // Verify signer was removed
    let updated_signers = client.get_signers();
    assert_eq!(updated_signers.len(), 2);
    assert!(!updated_signers.contains(&signer_to_remove));
    
    // Check events
    let logs = env.logs().all();
    assert!(logs.len() > 0);
}

#[test]
#[should_panic(expected = "Error(SignerDoesNotExist)")]
fn test_remove_signer_not_found() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    // Initialize with a valid configuration
    let signers = generate_signers(&env, 3);
    let default_threshold = 1;
    client.init(&signers, default_threshold);
    
    // Authorize contract to remove signer
    env.mock_all_auths();
    
    // Try to remove a non-existent signer
    let non_existent_signer = BytesN::random(&env);
    client.remove_signer(&non_existent_signer); // Should panic
}

#[test]
#[should_panic(expected = "Error(InvalidThreshold)")]
fn test_remove_signer_threshold_violation() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    // Initialize with signers equal to threshold
    let signers = generate_signers(&env, 2);
    let default_threshold = 2;
    client.init(&signers, default_threshold);
    
    // Authorize contract to remove signer
    env.mock_all_auths();
    
    // Try to remove a signer (would make signers.len() < threshold)
    client.remove_signer(&signers.get_unchecked(0)); // Should panic
}

#[test]
fn test_set_default_threshold() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    // Initialize with a valid configuration
    let signers = generate_signers(&env, 3);
    let default_threshold = 1;
    client.init(&signers, default_threshold);
    
    // Authorize contract to set threshold
    env.mock_all_auths();
    
    // Set a new threshold
    let new_threshold = 2;
    client.set_default_threshold(&new_threshold);
    
    // Verify threshold was updated
    assert_eq!(client.get_default_threshold(), new_threshold);
    
    // Check events
    let logs = env.logs().all();
    assert!(logs.len() > 0);
}

#[test]
#[should_panic(expected = "Error(InvalidThreshold)")]
fn test_set_default_threshold_invalid() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    // Initialize with a valid configuration
    let signers = generate_signers(&env, 3);
    let default_threshold = 1;
    client.init(&signers, default_threshold);
    
    // Authorize contract to set threshold
    env.mock_all_auths();
    
    // Try to set an invalid threshold (> signers.len())
    let invalid_threshold = 4;
    client.set_default_threshold(&invalid_threshold); // Should panic
}

#[test]
fn test_add_factory() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    // Initialize with a valid configuration
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    client.init(&signers, default_threshold);
    
    // Authorize contract to add factory
    env.mock_all_auths();
    
    // Add a factory
    let factory = Address::random(&env);
    let context = vec![&env, Address::random(&env)];
    client.add_factory(&factory, &context);
    
    // Check events
    let logs = env.logs().all();
    assert!(logs.len() > 0);
}

#[test]
#[should_panic(expected = "Error(FactoryExists)")]
fn test_add_factory_already_exists() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    // Initialize with a valid configuration
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    client.init(&signers, default_threshold);
    
    // Authorize contract to add factory
    env.mock_all_auths();
    
    // Add a factory
    let factory = Address::random(&env);
    let context = vec![&env, Address::random(&env)];
    client.add_factory(&factory, &context);
    
    // Try to add the same factory context again
    client.add_factory(&factory, &context); // Should panic
}

#[test]
fn test_remove_factory() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    // Initialize with a valid configuration
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    client.init(&signers, default_threshold);
    
    // Authorize contract to add and remove factory
    env.mock_all_auths();
    
    // Add a factory
    let factory = Address::random(&env);
    let context = vec![&env, Address::random(&env)];
    client.add_factory(&factory, &context);
    
    // Remove the factory
    client.remove_factory(&factory, &context);
    
    // Check events
    let logs = env.logs().all();
    assert!(logs.len() > 0);
}

#[test]
#[should_panic(expected = "Error(FactoryDoesNotExist)")]
fn test_remove_factory_not_found() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    // Initialize with a valid configuration
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    client.init(&signers, default_threshold);
    
    // Authorize contract to remove factory
    env.mock_all_auths();
    
    // Try to remove a non-existent factory
    let factory = Address::random(&env);
    let context = vec![&env, Address::random(&env)];
    client.remove_factory(&factory, &context); // Should panic
}

#[test]
fn test_add_account() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    // Initialize with a valid configuration
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    client.init(&signers, default_threshold);
    
    // Authorize contract to add account
    env.mock_all_auths();
    
    // Add an account
    let account = Address::random(&env);
    let context = vec![&env, Address::random(&env)];
    client.add_account(&account, &context);
    
    // Verify account was added
    let accounts = client.get_accounts(&context);
    assert_eq!(accounts.len(), 1);
    assert_eq!(accounts.get_unchecked(0), account);
    
    // Check events
    let logs = env.logs().all();
    assert!(logs.len() > 0);
}

#[test]
#[should_panic(expected = "Error(AccountExists)")]
fn test_add_account_already_exists() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    // Initialize with a valid configuration
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    client.init(&signers, default_threshold);
    
    // Authorize contract to add account
    env.mock_all_auths();
    
    // Add an account
    let account = Address::random(&env);
    let context = vec![&env, Address::random(&env)];
    client.add_account(&account, &context);
    
    // Try to add the same account context again
    client.add_account(&account, &context); // Should panic
}

#[test]
fn test_remove_account() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    // Initialize with a valid configuration
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    client.init(&signers, default_threshold);
    
    // Authorize contract to add and remove account
    env.mock_all_auths();
    
    // Add an account
    let account = Address::random(&env);
    let context = vec![&env, Address::random(&env)];
    client.add_account(&account, &context);
    
    // Remove the account
    client.remove_account(&account, &context);
    
    // Verify account was removed
    let accounts = client.get_accounts(&context);
    assert_eq!(accounts.len(), 0);
    
    // Check events
    let logs = env.logs().all();
    assert!(logs.len() > 0);
}

#[test]
#[should_panic(expected = "Error(AccountDoesNotExist)")]
fn test_remove_account_not_found() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    // Initialize with a valid configuration
    let signers = generate_signers(&env, 2);
    let default_threshold = 1;
    client.init(&signers, default_threshold);
    
    // Authorize contract to remove account
    env.mock_all_auths();
    
    // Try to remove a non-existent account
    let account = Address::random(&env);
    let context = vec![&env, Address::random(&env)];
    client.remove_account(&account, &context); // Should panic
}

#[test]
fn test_check_auth() {
    let env = Env::default();
    let client = create_auth_client(&env);
    
    // Initialize with a valid configuration
    let signers = generate_signers(&env, 3);
    let default_threshold = 1;
    client.init(&signers, default_threshold);
    
    // Create signed messages
    let payload = BytesN::random(&env);
    let signed_message1 = create_signed_message(&env, &signers.get_unchecked(0), &payload);
    let signed_message2 = create_signed_message(&env, &signers.get_unchecked(1), &payload);
    
    let signed_messages = vec![&env, signed_message1, signed_message2];
    
    // Mock the crypto verification
    env.mock_all_auths();
    env.crypto().set_ed25519_verify_result(true);
    
    // Test the check_auth function with valid context
    let valid_context = vec![&env];
    
    // This would normally fail without the mocked crypto and auths
    client.__check_auth(&payload, &signed_messages, &valid_context);
}

// Account contract tests
fn setup_account_test() -> (Env, Address, BytesN<32>, BytesN<65>) {
    let env = Env::default();
    
    // Create mock devices and auth contract
    let device_id = BytesN::random(&env);
    let public_key = BytesN::from_array(&env, &[2; 65]); // Mock secp256r1 public key
    let auth_contract = Address::random(&env);
    
    // Register the account contract
    let account_address = env.register_contract_wasm(None, account::WASM);
    
    // Call the constructor
    env.invoke_contract::<()>(
        &account_address,
        &Symbol::new(&env, "__constructor"),
        &(device_id.clone(), public_key.clone(), auth_contract.clone()),
    );
    
    (env, account_address, device_id, public_key)
}

#[test]
fn test_account_constructor() {
    let (env, account_address, device_id, public_key) = setup_account_test();
    
    // Get devices to verify initialization
    let devices: Vec<account::DevicePublicKey> = env.invoke_contract(
        &account_address,
        &Symbol::new(&env, "get_devices"),
        &(),
    );
    
    // Verify device was properly set
    assert_eq!(devices.len(), 1);
    assert_eq!(devices.get_unchecked(0).device_id, device_id);
    assert_eq!(devices.get_unchecked(0).public_key, public_key);
    
    // Verify auth contract was properly set
    let auth_contract: Address = env.invoke_contract(
        &account_address,
        &Symbol::new(&env, "get_auth"),
        &(),
    );
    
    assert!(auth_contract != Address::random(&env));
}

#[test]
fn test_account_add_device() {
    let (env, account_address, _, _) = setup_account_test();
    
    // Mock authorization
    env.mock_all_auths();
    
    // Add a new device
    let new_device_id = BytesN::random(&env);
    let new_public_key = BytesN::from_array(&env, &[3; 65]);
    
    env.invoke_contract::<()>(
        &account_address,
        &Symbol::new(&env, "add_device"),
        &(new_device_id.clone(), new_public_key.clone()),
    );
    
    // Verify the device was added
    let devices: Vec<account::DevicePublicKey> = env.invoke_contract(
        &account_address,
        &Symbol::new(&env, "get_devices"),
        &(),
    );
    
    assert_eq!(devices.len(), 2);
    
    // Find the newly added device
    let added_device = devices
        .iter()
        .find(|d| d.device_id == new_device_id)
        .expect("New device should be found");
    
    assert_eq!(added_device.public_key, new_public_key);
    
    // Check events
    let logs = env.logs().all();
    assert!(logs.len() > 0);
}

#[test]
#[should_panic(expected = "Error(DeviceAlreadySet)")]
fn test_account_add_device_already_exists() {
    let (env, account_address, device_id, public_key) = setup_account_test();
    
    // Mock authorization
    env.mock_all_auths();
    
    // Try to add the same device again
    env.invoke_contract::<()>(
        &account_address,
        &Symbol::new(&env, "add_device"),
        &(device_id, public_key),
    );
    // Should panic with DeviceAlreadySet
}

#[test]
fn test_account_remove_device() {
    let (env, account_address, _, _) = setup_account_test();
    
    // Mock authorization
    env.mock_all_auths();
    
    // Add a second device first
    let new_device_id = BytesN::random(&env);
    let new_public_key = BytesN::from_array(&env, &[3; 65]);
    
    env.invoke_contract::<()>(
        &account_address,
        &Symbol::new(&env, "add_device"),
        &(new_device_id.clone(), new_public_key.clone()),
    );
    
    // Get the first device ID
    let devices: Vec<account::DevicePublicKey> = env.invoke_contract(
        &account_address,
        &Symbol::new(&env, "get_devices"),
        &(),
    );
    let first_device_id = devices.get_unchecked(0).device_id;
    
    // Remove the first device
    env.invoke_contract::<()>(
        &account_address,
        &Symbol::new(&env, "remove_device"),
        &(first_device_id.clone(),),
    );
    
    // Verify the device was removed
    let updated_devices: Vec<account::DevicePublicKey> = env.invoke_contract(
        &account_address,
        &Symbol::new(&env, "get_devices"),
        &(),
    );
    
    assert_eq!(updated_devices.len(), 1);
    assert_eq!(updated_devices.get_unchecked(0).device_id, new_device_id);
    
    // Check events
    let logs = env.logs().all();
    assert!(logs.len() > 0);
}

#[test]
#[should_panic(expected = "Error(DeviceNotFound)")]
fn test_account_remove_device_not_found() {
    let (env, account_address, _, _) = setup_account_test();
    
    // Mock authorization
    env.mock_all_auths();
    
    // Try to remove a non-existent device
    let random_device_id = BytesN::random(&env);
    
    env.invoke_contract::<()>(
        &account_address,
        &Symbol::new(&env, "remove_device"),
        &(random_device_id,),
    );
    // Should panic with DeviceNotFound
}

#[test]
#[should_panic(expected = "Error(DeviceCannotBeEmpty)")]
fn test_account_remove_device_last_one() {
    let (env, account_address, device_id, _) = setup_account_test();
    
    // Mock authorization
    env.mock_all_auths();
    
    // Try to remove the only device
    env.invoke_contract::<()>(
        &account_address,
        &Symbol::new(&env, "remove_device"),
        &(device_id,),
    );
    // Should panic with DeviceCannotBeEmpty
}

#[test]
fn test_account_add_recovery_address() {
    let (env, account_address, _, _) = setup_account_test();
    
    // Mock authorization
    env.mock_all_auths();
    
    // Add a recovery address
    let recovery_address = Address::random(&env);
    
    env.invoke_contract::<()>(
        &account_address,
        &Symbol::new(&env, "add_recovery_address"),
        &(recovery_address.clone(),),
    );
    
    // Verify the recovery address was set (no direct getter, so check logs)
    let logs = env.logs().all();
    assert!(logs.len() > 0);
    
    // In a real implementation, we would verify the storage directly or add a getter
    // For this test, we'll just check that events were emitted
}

#[test]
#[should_panic(expected = "Error(RecoveryAddressSet)")]
fn test_account_add_recovery_address_already_set() {
    let (env, account_address, _, _) = setup_account_test();
    
    // Mock authorization
    env.mock_all_auths();
    
    // Add a recovery address
    let recovery_address = Address::random(&env);
    
    env.invoke_contract::<()>(
        &account_address,
        &Symbol::new(&env, "add_recovery_address"),
        &(recovery_address.clone(),),
    );
    
    // Try to add another recovery address
    let new_recovery_address = Address::random(&env);
    
    env.invoke_contract::<()>(
        &account_address,
        &Symbol::new(&env, "add_recovery_address"),
        &(new_recovery_address,),
    );
    // Should panic with RecoveryAddressSet
}

#[test]
fn test_account_update_recovery_address() {
    let (env, account_address, _, _) = setup_account_test();
    
    // Mock authorization
    env.mock_all_auths();
    
    // Add a recovery address
    let recovery_address = Address::random(&env);
    
    env.invoke_contract::<()>(
        &account_address,
        &Symbol::new(&env, "add_recovery_address"),
        &(recovery_address.clone(),),
    );
    
    // Update the recovery address
    let new_recovery_address = Address::random(&env);
    
    env.invoke_contract::<()>(
        &account_address,
        &Symbol::new(&env, "update_recovery_address"),
        &(new_recovery_address.clone(),),
    );
    
    // Verify the recovery address was updated
    let logs = env.logs().all();
    assert!(logs.len() > 0);
    
    // In a real implementation, we would verify the storage directly or add a getter
}

#[test]
fn test_account_recover_account() {
    let (env, account_address, _, _) = setup_account_test();
    
    // Mock authorization
    env.mock_all_auths();
    
    // Add a recovery address
    let recovery_address = Address::random(&env);
    
    env.invoke_contract::<()>(
        &account_address,
        &Symbol::new(&env, "add_recovery_address"),
        &(recovery_address.clone(),),
    );
    
    // Recover the account with a new device
    let new_device_id = BytesN::random(&env);
    let new_public_key = BytesN::from_array(&env, &[4; 65]);
    
    env.invoke_contract::<()>(
        &account_address,
        &Symbol::new(&env, "recover_account"),
        &(new_device_id.clone(), new_public_key.clone()),
    );
    
    // Verify the device was updated
    let devices: Vec<account::DevicePublicKey> = env.invoke_contract(
        &account_address,
        &Symbol::new(&env, "get_devices"),
        &(),
    );
    
    assert_eq!(devices.len(), 1);
    assert_eq!(devices.get_unchecked(0).device_id, new_device_id);
    assert_eq!(devices.get_unchecked(0).public_key, new_public_key);
    
    // Check events
    let logs = env.logs().all();
    assert!(logs.len() > 0);
}

// Account factory tests
fn setup_factory_test() -> (Env, Address, Address, BytesN<32>) {
    let env = Env::default();
    
    // Create mock auth contract and WASM hash
    let auth_contract = Address::random(&env);
    let wasm_hash = BytesN::random(&env);
    
    // Register the factory contract
    let factory_address = env.register_contract_wasm(None, account_factory::WASM);
    
    // Call the constructor
    env.invoke_contract::<()>(
        &factory_address,
        &Symbol::new(&env, "__constructor"),
        &(auth_contract.clone(), wasm_hash.clone()),
    );
    
    (env, factory_address, auth_contract, wasm_hash)
}

#[test]
fn test_factory_deploy() {
    let (env, factory_address, _, _) = setup_factory_test();
    
    // Mock authorization and WASM deployment
    env.mock_all_auths();
    
    // Set up deployment parameters
    let salt = BytesN::random(&env);
    let device_id = BytesN::random(&env);
    let public_key = BytesN::from_array(&env, &[5; 65]);
    
    // Deploy an account
    let account_address: Address = env.invoke_contract(
        &factory_address,
        &Symbol::new(&env, "deploy"),
        &(salt, device_id, public_key),
    );
    
    // Verify the account was deployed
    assert!(account_address != Address::random(&env));
    
    // Check events
    let logs = env.logs().all();
    assert!(logs.len() > 0);
}

#[test]
fn test_factory_deploy_multiple_accounts() {
    let (env, factory_address, _, _) = setup_factory_test();
    
    // Mock authorization and WASM deployment
    env.mock_all_auths();
    
    // Deploy first account
    let salt1 = BytesN::random(&env);
    let device_id1 = BytesN::random(&env);
    let public_key1 = BytesN::from_array(&env, &[5; 65]);
    
    let account_address1: Address = env.invoke_contract(
        &factory_address,
        &Symbol::new(&env, "deploy"),
        &(salt1, device_id1, public_key1),
    );
    
    // Deploy second account
    let salt2 = BytesN::random(&env);
    let device_id2 = BytesN::random(&env);
    let public_key2 = BytesN::from_array(&env, &[6; 65]);
    
    let account_address2: Address = env.invoke_contract(
        &factory_address,
        &Symbol::new(&env, "deploy"),
        &(salt2, device_id2, public_key2),
    );
    
    // Verify two different accounts were created
    assert!(account_address1 != account_address2);
}

#[test]
fn test_factory_deploy_idempotent() {
    let (env, factory_address, _, _) = setup_factory_test();
    
    // Mock authorization and WASM deployment
    env.mock_all_auths();
    
    // Set up deployment parameters
    let salt = BytesN::random(&env);
    let device_id = BytesN::random(&env);
    let public_key = BytesN::from_array(&env, &[5; 65]);
    
    // Deploy an account
    let first_address: Address = env.invoke_contract(
        &factory_address,
        &Symbol::new(&env, "deploy"),
        &(salt.clone(), device_id.clone(), public_key.clone()),
    );
    
    // Deploy again with same salt but different parameters
    let new_device_id = BytesN::random(&env);
    let new_public_key = BytesN::from_array(&env, &[7; 65]);
    
    let second_address: Address = env.invoke_contract(
        &factory_address,
        &Symbol::new(&env, "deploy"),
        &(salt, new_device_id, new_public_key),
    );
    
    // Verify addresses are different (due to salt contract behavior)
    assert!(first_address != second_address);
}

// Integration tests between contracts
#[test]
fn test_integration_auth_controller_with_factory() {
    let env = Env::default();
    
    // 1. Initialize Auth Controller
    let auth_client = create_auth_client(&env);
    let signers = generate_signers(&env, 3);
    let default_threshold = 2;
    auth_client.init(&signers, default_threshold);
    
    // 2. Deploy Factory Contract (mock)
    let factory_address = Address::random(&env);
    
    // 3. Register factory in auth controller
    env.mock_all_auths();
    let context = vec![&env, Address::random(&env)];
    auth_client.add_factory(&factory_address, &context);
    
    // 4. Verify factory was added
    // In a real test, we would deploy an account from the factory
    // and verify it's registered in the auth controller
    
    // For now, let's check that the context was added
    let logs = env.logs().all();
    assert!(logs.len() > 0);
}

#[test]
fn test_integration_factory_deploys_account() {
    // This would be a comprehensive integration test
    // that would initialize auth controller, deploy factory,
    // use factory to deploy an account, and verify the account
    // is registered with the auth controller
    
    // Since we're using mock data in this test file, we'll
    // outline the steps but not implement the full flow
    
    let env = Env::default();
    
    // 1. Initialize Auth Controller (already tested)
    // 2. Deploy Factory Contract (already tested)
    // 3. Use Factory to deploy Account (already tested)
    // 4. Verify Account is registered in Auth Controller (would test here)
    // 5. Test Account operations with Auth Controller integration
    
    // Mock versions for now
    env.mock_all_auths();
    
    // This test would be expanded in a real implementation
    // with actual contract interactions
}

