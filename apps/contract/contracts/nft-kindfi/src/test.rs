#![cfg(test)]
extern crate std;

use soroban_sdk::{
    symbol_short,
    testutils::Address as _,
    Address, Env, String,
};

use crate::types::{NFTAttribute, NFTMetadata};
use crate::{KindfiNFT, KindfiNFTClient};

/// Helper to create a test environment with an initialized contract.
struct TestEnv {
    env: Env,
    admin: Address,
    client: KindfiNFTClient<'static>,
}

impl TestEnv {
    fn new() -> Self {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let name = String::from_str(&env, "KindFi NFT");
        let symbol = String::from_str(&env, "KFNFT");
        let base_uri = String::from_str(&env, "https://api.kindfi.org/nft/");

        let contract_id = env.register(KindfiNFT, (&admin, name, symbol, base_uri));
        let client = KindfiNFTClient::new(&env, &contract_id);

        TestEnv {
            env,
            admin,
            client,
        }
    }

    fn create_metadata(&self, name: &str) -> NFTMetadata {
        NFTMetadata {
            name: String::from_str(&self.env, name),
            description: String::from_str(&self.env, "A KindFi NFT"),
            image_uri: String::from_str(&self.env, "https://example.com/image.png"),
            external_url: String::from_str(&self.env, "https://kindfi.org"),
            attributes: soroban_sdk::vec![
                &self.env,
                NFTAttribute {
                    trait_type: String::from_str(&self.env, "level"),
                    value: String::from_str(&self.env, "bronze"),
                    display_type: None,
                    max_value: None,
                },
                NFTAttribute {
                    trait_type: String::from_str(&self.env, "badge"),
                    value: String::from_str(&self.env, "early_supporter"),
                    display_type: Some(String::from_str(&self.env, "string")),
                    max_value: None,
                },
            ],
        }
    }

    fn grant_minter_role(&self, account: &Address) {
        self.client
            .grant_role(account, &symbol_short!("minter"), &self.admin);
    }

    fn grant_burner_role(&self, account: &Address) {
        self.client
            .grant_role(account, &symbol_short!("burner"), &self.admin);
    }

    fn grant_metadata_manager_role(&self, account: &Address) {
        self.client
            .grant_role(account, &self.client.metadata_manager_role(), &self.admin);
    }
}

// ============================================================================
// Constructor Tests
// ============================================================================

#[test]
fn test_constructor_sets_metadata() {
    let test = TestEnv::new();

    assert_eq!(test.client.name(), String::from_str(&test.env, "KindFi NFT"));
    assert_eq!(test.client.symbol(), String::from_str(&test.env, "KFNFT"));
}

#[test]
fn test_constructor_sets_admin() {
    let test = TestEnv::new();

    // Admin should be able to grant roles
    let minter = Address::generate(&test.env);
    test.grant_minter_role(&minter);

    // Verify role was granted
    let has_role = test.client.has_role(&minter, &symbol_short!("minter"));
    assert!(has_role.is_some());
}

#[test]
fn test_initial_total_supply_is_zero() {
    let test = TestEnv::new();
    assert_eq!(test.client.total_supply(), 0);
}

// ============================================================================
// Minting Tests
// ============================================================================

#[test]
fn test_mint_with_metadata() {
    let test = TestEnv::new();
    let minter = Address::generate(&test.env);
    let recipient = Address::generate(&test.env);

    test.grant_minter_role(&minter);

    let metadata = test.create_metadata("KindFi NFT #0");
    let token_id = test.client.mint_with_metadata(&minter, &recipient, &metadata);

    assert_eq!(token_id, 0);
    assert_eq!(test.client.owner_of(&token_id), recipient);
    assert_eq!(test.client.balance(&recipient), 1);
    assert_eq!(test.client.total_supply(), 1);
}

#[test]
fn test_mint_sequential_token_ids() {
    let test = TestEnv::new();
    let minter = Address::generate(&test.env);
    let recipient = Address::generate(&test.env);

    test.grant_minter_role(&minter);

    let metadata1 = test.create_metadata("KindFi NFT #0");
    let metadata2 = test.create_metadata("KindFi NFT #1");
    let metadata3 = test.create_metadata("KindFi NFT #2");

    let token_id_0 = test.client.mint_with_metadata(&minter, &recipient, &metadata1);
    let token_id_1 = test.client.mint_with_metadata(&minter, &recipient, &metadata2);
    let token_id_2 = test.client.mint_with_metadata(&minter, &recipient, &metadata3);

    assert_eq!(token_id_0, 0);
    assert_eq!(token_id_1, 1);
    assert_eq!(token_id_2, 2);
    assert_eq!(test.client.total_supply(), 3);
    assert_eq!(test.client.balance(&recipient), 3);
}

#[test]
fn test_mint_stores_metadata() {
    let test = TestEnv::new();
    let minter = Address::generate(&test.env);
    let recipient = Address::generate(&test.env);

    test.grant_minter_role(&minter);

    let metadata = test.create_metadata("Special NFT");
    let token_id = test.client.mint_with_metadata(&minter, &recipient, &metadata);

    let stored_metadata = test.client.get_metadata(&token_id);
    assert!(stored_metadata.is_some());

    let stored = stored_metadata.unwrap();
    assert_eq!(stored.name, String::from_str(&test.env, "Special NFT"));
    assert_eq!(stored.description, metadata.description);
    assert_eq!(stored.image_uri, metadata.image_uri);
    assert_eq!(stored.external_url, metadata.external_url);
}

#[test]
#[should_panic(expected = "Error(Contract, #2000)")] // Role check failure
fn test_mint_without_role_fails() {
    let test = TestEnv::new();
    let unauthorized = Address::generate(&test.env);
    let recipient = Address::generate(&test.env);

    let metadata = test.create_metadata("Unauthorized NFT");

    // Should fail - unauthorized doesn't have minter role
    test.client
        .mint_with_metadata(&unauthorized, &recipient, &metadata);
}

// ============================================================================
// Metadata Tests
// ============================================================================

#[test]
fn test_update_metadata() {
    let test = TestEnv::new();
    let minter = Address::generate(&test.env);
    let metadata_manager = Address::generate(&test.env);
    let recipient = Address::generate(&test.env);

    test.grant_minter_role(&minter);
    test.grant_metadata_manager_role(&metadata_manager);

    // Mint NFT
    let initial_metadata = test.create_metadata("Initial Name");
    let token_id = test
        .client
        .mint_with_metadata(&minter, &recipient, &initial_metadata);

    // Update metadata
    let updated_metadata = NFTMetadata {
        name: String::from_str(&test.env, "Updated Name"),
        description: String::from_str(&test.env, "Updated description"),
        image_uri: String::from_str(&test.env, "https://new-image.com/nft.png"),
        external_url: String::from_str(&test.env, "https://kindfi.org/updated"),
        attributes: soroban_sdk::vec![
            &test.env,
            NFTAttribute {
                trait_type: String::from_str(&test.env, "level"),
                value: String::from_str(&test.env, "gold"),
                display_type: None,
                max_value: Some(String::from_str(&test.env, "5")),
            },
            NFTAttribute {
                trait_type: String::from_str(&test.env, "badge"),
                value: String::from_str(&test.env, "veteran"),
                display_type: Some(String::from_str(&test.env, "string")),
                max_value: None,
            },
        ],
    };

    test.client
        .update_metadata(&metadata_manager, &token_id, &updated_metadata);

    // Verify metadata was updated
    let stored = test.client.get_metadata(&token_id).unwrap();
    assert_eq!(stored.name, String::from_str(&test.env, "Updated Name"));
    assert_eq!(
        stored.description,
        String::from_str(&test.env, "Updated description")
    );
}

#[test]
fn test_get_metadata_nonexistent_token() {
    let test = TestEnv::new();

    // Token 999 was never minted
    let metadata = test.client.get_metadata(&999);
    assert!(metadata.is_none());
}

// ============================================================================
// Burn Tests
// ============================================================================

#[test]
fn test_burn_nft() {
    let test = TestEnv::new();
    let minter = Address::generate(&test.env);
    let burner = Address::generate(&test.env);

    test.grant_minter_role(&minter);
    test.grant_burner_role(&burner);

    // Mint NFT to burner
    let metadata = test.create_metadata("Burnable NFT");
    let token_id = test
        .client
        .mint_with_metadata(&minter, &burner, &metadata);

    assert_eq!(test.client.balance(&burner), 1);

    // Burn NFT
    test.client.burn(&burner, &token_id);

    assert_eq!(test.client.balance(&burner), 0);

    // Metadata should be removed
    let stored_metadata = test.client.get_metadata(&token_id);
    assert!(stored_metadata.is_none());
}

#[test]
fn test_burn_from_with_approval() {
    let test = TestEnv::new();
    let minter = Address::generate(&test.env);
    let owner = Address::generate(&test.env);
    let burner = Address::generate(&test.env);

    test.grant_minter_role(&minter);
    test.grant_burner_role(&burner);

    // Mint NFT to owner
    let metadata = test.create_metadata("Owner's NFT");
    let token_id = test.client.mint_with_metadata(&minter, &owner, &metadata);

    // Owner approves burner
    let current_ledger = test.env.ledger().sequence();
    test.client
        .approve(&owner, &burner, &token_id, &(current_ledger + 1000));

    // Burner burns the NFT
    test.client.burn_from(&burner, &owner, &token_id);

    assert_eq!(test.client.balance(&owner), 0);
}

#[test]
#[should_panic(expected = "Error(Contract, #2000)")] // Role check failure
fn test_burn_without_role_fails() {
    let test = TestEnv::new();
    let minter = Address::generate(&test.env);
    let owner = Address::generate(&test.env);

    test.grant_minter_role(&minter);

    // Mint NFT
    let metadata = test.create_metadata("NFT");
    let token_id = test.client.mint_with_metadata(&minter, &owner, &metadata);

    // Owner doesn't have burner role - should fail
    test.client.burn(&owner, &token_id);
}

// ============================================================================
// Transfer Tests
// ============================================================================

#[test]
fn test_transfer() {
    let test = TestEnv::new();
    let minter = Address::generate(&test.env);
    let owner = Address::generate(&test.env);
    let recipient = Address::generate(&test.env);

    test.grant_minter_role(&minter);

    // Mint NFT
    let metadata = test.create_metadata("Transferable NFT");
    let token_id = test.client.mint_with_metadata(&minter, &owner, &metadata);

    // Transfer NFT
    test.client.transfer(&owner, &recipient, &token_id);

    assert_eq!(test.client.owner_of(&token_id), recipient);
    assert_eq!(test.client.balance(&owner), 0);
    assert_eq!(test.client.balance(&recipient), 1);

    // Metadata should still exist
    let stored = test.client.get_metadata(&token_id);
    assert!(stored.is_some());
}

#[test]
fn test_transfer_from_with_approval() {
    let test = TestEnv::new();
    let minter = Address::generate(&test.env);
    let owner = Address::generate(&test.env);
    let operator = Address::generate(&test.env);
    let recipient = Address::generate(&test.env);

    test.grant_minter_role(&minter);

    // Mint NFT
    let metadata = test.create_metadata("NFT");
    let token_id = test.client.mint_with_metadata(&minter, &owner, &metadata);

    // Owner approves operator
    let current_ledger = test.env.ledger().sequence();
    test.client
        .approve(&owner, &operator, &token_id, &(current_ledger + 1000));

    // Operator transfers on behalf of owner
    test.client
        .transfer_from(&operator, &owner, &recipient, &token_id);

    assert_eq!(test.client.owner_of(&token_id), recipient);
}

// ============================================================================
// Approval Tests
// ============================================================================

#[test]
fn test_approve_and_get_approved() {
    let test = TestEnv::new();
    let minter = Address::generate(&test.env);
    let owner = Address::generate(&test.env);
    let approved = Address::generate(&test.env);

    test.grant_minter_role(&minter);

    // Mint NFT
    let metadata = test.create_metadata("NFT");
    let token_id = test.client.mint_with_metadata(&minter, &owner, &metadata);

    // Set approval
    let current_ledger = test.env.ledger().sequence();
    test.client
        .approve(&owner, &approved, &token_id, &(current_ledger + 1000));

    // Verify approval
    let got_approved = test.client.get_approved(&token_id);
    assert!(got_approved.is_some());
    assert_eq!(got_approved.unwrap(), approved);
}

#[test]
fn test_approve_for_all() {
    let test = TestEnv::new();
    let minter = Address::generate(&test.env);
    let owner = Address::generate(&test.env);
    let operator = Address::generate(&test.env);

    test.grant_minter_role(&minter);

    // Mint multiple NFTs
    let metadata = test.create_metadata("NFT");
    test.client.mint_with_metadata(&minter, &owner, &metadata);
    test.client.mint_with_metadata(&minter, &owner, &metadata);

    // Set operator approval for all
    let current_ledger = test.env.ledger().sequence();
    test.client
        .approve_for_all(&owner, &operator, &(current_ledger + 1000));

    // Verify operator approval
    let is_approved = test.client.is_approved_for_all(&owner, &operator);
    assert!(is_approved);
}

// ============================================================================
// Role Management Tests
// ============================================================================

#[test]
fn test_grant_and_revoke_role() {
    let test = TestEnv::new();
    let user = Address::generate(&test.env);

    // Grant minter role
    test.grant_minter_role(&user);
    assert!(test
        .client
        .has_role(&user, &symbol_short!("minter"))
        .is_some());

    // Revoke minter role
    test.client
        .revoke_role(&user, &symbol_short!("minter"), &test.admin);
    assert!(test
        .client
        .has_role(&user, &symbol_short!("minter"))
        .is_none());
}

#[test]
fn test_multiple_roles() {
    let test = TestEnv::new();
    let user = Address::generate(&test.env);

    // Grant multiple roles
    test.grant_minter_role(&user);
    test.grant_burner_role(&user);

    assert!(test
        .client
        .has_role(&user, &symbol_short!("minter"))
        .is_some());
    assert!(test
        .client
        .has_role(&user, &symbol_short!("burner"))
        .is_some());

    // User can now mint and burn
    let recipient = Address::generate(&test.env);
    let metadata = test.create_metadata("NFT");
    let token_id = test
        .client
        .mint_with_metadata(&user, &recipient, &metadata);

    // Transfer to user so they can burn it
    test.client.transfer(&recipient, &user, &token_id);

    // Now burn
    test.client.burn(&user, &token_id);
    assert_eq!(test.client.balance(&user), 0);
}
