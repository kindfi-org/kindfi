# AuthController Test Suite Documentation

The AuthController contract is a core component of the KindFi authentication system, providing robust multi-signature authentication and account management functionality. This document provides a comprehensive guide to the test suite for the AuthController.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Test_Auth Documentation](#test_auth-documentation)
- [Test Categories](#test-categories)
- [Test Setup and Fixtures](#test-setup-and-fixtures)
- [Key Test Utilities](#key-test-utilities)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [Security Considerations](#security-considerations)
- [Common Testing Patterns](#common-testing-patterns)
- [Running the Tests](#running-the-tests)
- [Troubleshooting](#troubleshooting)

## Overview

The AuthController test suite verifies the correct functioning of the AuthController contract, which is responsible for:

- Managing multiple signers with a configurable threshold for multi-signature authentication
- Authorizing operations through signature verification
- Managing accounts and factories within specific contexts
- Providing a secure authentication mechanism for the KindFi ecosystem

The tests ensure the contract functions correctly under normal conditions and handles edge cases appropriately with clear error messages.

## Test Structure

The test suite is organized into two main files:

1. **test.rs**: Contains unit tests focused on the core functionality of the AuthController contract
2. **test_auth.rs**: Contains more comprehensive integration tests covering authentication scenarios and interactions with other contracts

## Test_Auth Documentation

This section provides a comprehensive overview of all test cases for the auth contracts to help developers understand the expected behavior and test coverage.

### Auth Controller Tests

#### Auth Controller Initialization Tests

- **test_init**: Verifies proper initialization with valid signers and thresholds
- **test_init_signer_limit_exceeded**: Tests rejection when exceeding maximum signer limit
- **test_init_already_initialized**: Verifies prevention of multiple initializations
- **test_init_invalid_threshold**: Tests rejection of invalid threshold values

#### Auth Controller Authentication Tests

- **test_controller_auth_verification_success**: Verifies successful authentication when valid signatures meet the threshold
- **test_controller_auth_default_threshold_unmet**: Tests rejection when signatures don't meet the default threshold
- **test_controller_auth_duplicate_signature**: Confirms rejection of duplicate signatures
- **test_controller_auth_unknown_signer**: Verifies rejection of signatures from unknown signers
- **test_controller_auth_invalid_contract**: Tests rejection when unauthorized contracts attempt to perform actions

#### Signer Management Tests

- **test_add_signer**: Verifies proper addition of a new signer
- **test_add_signer_limit_exceeded**: Tests rejection when exceeding maximum signer limit
- **test_add_signer_already_exists**: Confirms rejection when adding an existing signer
- **test_remove_signer**: Verifies proper removal of an existing signer
- **test_remove_signer_not_found**: Tests rejection when removing a non-existent signer
- **test_remove_signer_threshold_violation**: Confirms rejection when removal would violate threshold requirements

#### Threshold Management Tests

- **test_set_default_threshold**: Verifies proper updating of the default threshold
- **test_set_default_threshold_invalid**: Tests rejection of invalid threshold values

#### Account Factory Management Tests

- **test_add_factory**: Verifies proper addition of a new factory
- **test_add_factory_already_exists**: Confirms rejection when adding an existing factory
- **test_remove_factory**: Verifies proper removal of an existing factory
- **test_remove_factory_not_found**: Tests rejection when removing a non-existent factory

#### Account Management Tests

- **test_add_account**: Verifies proper addition of a new account
- **test_add_account_already_exists**: Confirms rejection when adding an existing account
- **test_remove_account**: Verifies proper removal of an existing account
- **test_remove_account_not_found**: Tests rejection when removing a non-existent account

#### Auth Controller Event Tests

- **test_auth_controller_init_event**: Verifies events emitted during initialization
- **test_auth_controller_add_signer_event**: Tests events emitted when adding a signer
- **test_auth_controller_remove_signer_event**: Verifies events emitted when removing a signer
- **test_auth_controller_default_threshold_changed_event**: Tests events emitted when changing threshold
- **test_auth_controller_add_factory_event**: Verifies events emitted when adding a factory
- **test_auth_controller_remove_factory_event**: Tests events emitted when removing a factory
- **test_auth_controller_add_account_event**: Verifies events emitted when adding an account
- **test_auth_controller_remove_account_event**: Tests events emitted when removing an account

### Account Factory Tests

#### Deployment Tests

- **test_factory_deploy_account**: Verifies successful deployment of a new account
- **test_factory_deploy_multiple_accounts**: Tests deployment of multiple unique accounts
- **test_integration_auth_controller_with_factory**: Verifies integration between Auth Controller and Factory contract

#### Account Factory Event Tests

- **test_account_factory_deploy_event**: Tests events emitted during account deployment

### Account Contract Tests

#### Device Management Tests

- **test_account_add_device**: Tests successful addition of a new device
- **test_account_add_device_already_exists**: Confirms rejection when adding a duplicate device
- **test_account_remove_device**: Verifies proper removal of a device
- **test_remove_device\_\_not_found**: Verifies rejection when removing a non-existent device
- **test_account_remove_device_last_one**: Tests rejection when attempting to remove the last device

#### Recovery Management Tests

- **test_account_add_recovery_address**: Tests adding a recovery address
- **test_account_add_recovery_address_already_set**: Tests adding a recovery address when it has already been set
- **test_account_update_recovery_address**: Verifies updating an existing recovery address
- **test_account_recover_account**: Tests the account recovery process with a new device

#### Account Event Tests

- **test_account_add_device_event**: Verifies events emitted when adding a device
- **test_account_remove_device_event**: Tests events emitted when removing a device
- **test_account_add_recovery_address_event**: Verifies events emitted when adding a recovery address
- **test_account_update_recovery_address_event**: Tests events emitted when updating a recovery address
- **test_account_recovered_event**: Verifies events emitted during account recovery

### Signature Verification Tests

- **test_signature_verification**: Verifies ed25519 signatures in the auth controller

## Test Categories

The test suite covers the following categories:

- **Initialization Tests**: Verify the contract initializes correctly with the specified signers and threshold
- **Authentication Tests**: Verify the signature validation and threshold enforcement for authorization
- **Signer Management Tests**: Verify adding and removing signers works correctly
- **Threshold Management Tests**: Verify updating the default threshold works correctly
- **Account Management Tests**: Verify adding and removing accounts within contexts
- **Factory Management Tests**: Verify adding and removing factories within contexts
- **Integration Tests**: Verify interactions between AuthController and other contracts (AccountFactory, Account)
- **Event Tests**: Verify events are emitted correctly for all operations
- **Cryptography Tests**: Confirm signature generation and verification

## Test Setup and Fixtures

Most tests use common setup patterns. The various helper functions in `test_auth.rs` simplify test setup:

```rust
// From test_auth.rs - Helper function for creating AuthController client
fn create_auth_client(env: &Env) -> AuthControllerClient {
    let contract_address = env.register(AuthController, ());
    AuthControllerClient::new(env, &contract_address)
}
```

## Key Test Utilities

The test suite includes several utility classes and functions to simplify testing:

### SecureKeyStorage

This class encapsulates cryptographic key management for testing:

```rust
pub struct SecureKeyStorage {
    seed: u64,
}

impl SecureKeyStorage {
    fn new(seed: u64) -> Self { ... }
    fn get_public_key(&self, env: &Env) -> BytesN<32> { ... }
    fn sign(&self, env: &Env, payload: &BytesN<32>) -> BytesN<64> { ... }
    fn get_secp_public_key(&self, env: &Env) -> BytesN<65> { ... }
}
```

### Signature Creation and Verification

The test suite includes helper functions for creating and verifying signatures:

```rust
pub fn create_signed_message(env: &Env, secure_key: &SecureKeyStorage, payload: &BytesN<32>) -> SignedMessage { ... }
pub fn verify_signature(public_key: &BytesN<32>, payload: &BytesN<32>, signature: &BytesN<64>) -> bool { ... }
```

### Signer Generation

Helper functions to generate deterministic signers for testing:

```rust
fn generate_signers(env: &Env, count: usize) -> Vec<BytesN<32>> { ... }
fn get_secure_key_for_signer(signer_index: usize) -> SecureKeyStorage { ... }
```

## Unit Tests

Unit tests focus on testing individual functions in isolation. Some key unit tests include:

### Initialization Tests

```rust
#[test]
fn test_init() {
    // Verify contract initializes correctly with valid parameters
}

#[test]
#[should_panic(expected = "Error(Contract, #104)")]
fn test_init_already_initialized() {
    // Verify contract cannot be initialized twice
}
```

### Account Signer Management Tests

```rust
#[test]
fn test_add_signer() {
    // Verify adding a signer works correctly
}

#[test]
fn test_remove_signer() {
    // Verify removing a signer works correctly
}
```

### Authentication Tests

Authentication tests verify the signature validation and threshold enforcement:

```rust
#[test]
#[should_panic(expected = "Error(Contract, #102)")]
fn test_controller_auth_default_threshold_unmet() {
    // Verify authentication fails when threshold is not met
}

#[test]
#[should_panic(expected = "Error(Contract, #108)")]
fn test_controller_auth_duplicate_signature() {
    // Verify authentication fails with duplicate signatures
}
```

### Account and Factory Management Tests

These tests verify account and factory management functionality:

```rust
#[test]
fn test_add_factory() {
    // Verify adding a factory works correctly
}

#[test]
fn test_remove_account() {
    // Verify removing an account works correctly
}
```

### Event Testing

These tests verify events are emitted correctly:

```rust
#[test]
fn test_auth_controller_init_event() {
    // Verify init event is emitted with correct data
}

#[test]
fn test_account_recovered_event() {
    // Verify add_signer event is emitted with correct data
}
```

### Cryptography Testing

The auth contracts system employs two different cryptographic schemes:

1. **Ed25519** used by the Auth Controller for multi-sig operations
2. **Secp256r1** (P256) used by Account Contract for device authentication (WebAuthn compatibility)

- **verify_signature**: Helper function that implements proper cryptographic verification
- **sign**: Helper function that generates cryptographically secure signatures

```rust
#[test]
fn test_signature_veriication() {
    // Verify a signer is authorized to make call using public-key cryptography
}
```

## Integration Tests

Integration tests verify interactions between AuthController and other contracts:

```rust
#[test]
fn test_integration_auth_controller_with_factory() {
    // Tests integration between AuthController and AccountFactory contracts
}

#[test]
fn test_integration_auth_controller_with_account() {
    // Tests integration between AuthController and Account contracts
}
```

### Security Considerations

- The system enforces authentication thresholds to prevent single-point-of-failure
- Duplicate signatures are rejected to prevent replay attacks
- Devices cannot be reduced below 1 to prevent account lockout
- Recovery mechanisms are protected by multi-signature authorization
- Events are emitted for all security-sensitive operations for auditability
- Authorization contexts are validated to prevent unauthorized contract calls

## Common Testing Patterns

The test suite follows several common patterns:

1. **Setup, Act, Assert**: Tests follow the Arrange-Act-Assert pattern
2. **Happy Path and Error Cases**: Tests cover both successful and error scenarios
3. **Mock Authentication**: Uses `env.mock_all_auths()` to bypass authentication for setup
4. **Expected Panics**: Uses `#[should_panic]` to test error conditions

## Running the Tests

To run the AuthController tests:

```bash
cd apps/contract/contracts/auth-contracts/auth-controller
cargo test
```

To run individual tests:

```bash
cargo test -p -- test_init
```

To run tests with detailed output:

```bash
cargo test -p -- --nocapture -vvvv
```

## Troubleshooting

If tests are failing, check the following:

1. **Environment Setup**: Ensure the Soroban SDK is installed and configured correctly
2. **Contract Changes**: If the AuthController contract has changed, tests may need to be updated
3. **WASM Compilation**: Ensure the contract WASMs have been compiled successfully, especially for the AccountFactory contract.
4. **Test Dependencies**: Some tests may depend on other contracts being compiled first

### Common Deployment Issues

**Error: "parsing argument context: expected value at line 1 column 2"**

- This error occurs when the `--context` parameter is not properly formatted as a JSON array
- **Solution**: Ensure contract addresses are quoted and wrapped in a JSON array: `--context "[\"$CONTRACT_ID\"]"`
- **Example**: `--context "[\"CA...XYZ\"]"` for a single context, or `--context "[\"CA...XYZ\",\"CB...ABC\"]"` for multiple

**Error: "Factory deployment failed: Auth controller contract function not found"**

- This indicates the auth-controller contract is not properly deployed or initialized
- **Solution**:
  1. Verify the auth-controller contract is deployed with `stellar contract info --id $AUTH_CONTROLLER_ID`
  2. Ensure it's initialized with admin signers using `stellar contract invoke ... -- init`
  3. Register the factory contract using `stellar contract invoke ... -- add_factory`

**Error: "Invalid context address format"**

- Context addresses must be valid Stellar contract addresses starting with 'C'
- **Solution**: Verify all context addresses are properly formatted contract IDs (not account public keys starting with 'G')

For more details, refer to the [Soroban SDK documentation](https://soroban.stellar.org/docs) and the [KindFi Contracts Documentation](../../../README.md).
