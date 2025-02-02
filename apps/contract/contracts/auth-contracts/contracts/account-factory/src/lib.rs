#![no_std]
use soroban_sdk::{contract, contractimpl, vec, Env, String, Vec};
use stellar_strkey::ed25519::{MuxedAccount, PublicKey};
// use stellar_xdr::
use sha2::{Digest, Sha256};

#[contract]
pub struct AccountFactory;

#[contractimpl]
impl AccountFactory {
    pub fn create_account(
        env: Env,
        auth_contract: Address,
        id: u128,
        public_key: Vec<u8>,
    ) -> Vec<u8> {
        let mut storage = env.storage().persistent();

        // Hash the device public key to get a unique sub-account ID
        let mut hasher = Sha256::new();
        hasher.update(&public_key);
        let hash_result = hasher.finalize();
        let sub_account_id = u64::from_le_bytes(
            hash_result[..8]
                .try_into()
                .expect("Invalid hash conversion"),
        );

        // Convert the AuthContract address into a Stellar-compatible public key
        let g_address = auth_contract_address.to_bytes();

        // Create a Muxed Account (M-address)
        let muxed_account = MuxedAccount {
            ed25519: g_address,
            id: sub_account_id,
        };

        // Convert Muxed Account to bytes for storage
        let muxed_bytes = muxed_account
            .to_bytes()
            .expect("Failed to serialize muxed account");

        // Store the Muxed Account using the WebAuthn id as a lookup key
        storage.set(&id, &muxed_bytes);

        // Return the created Muxed Account
        muxed_bytes
    }

    pub fn get_account(env: Env, id: Vec<u8>) -> Option<Vec<u8>> {
        let storage = env.storage().persistent();
        storage.get(&id)
    }
}

mod test;
