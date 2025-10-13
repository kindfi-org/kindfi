#![no_std]
use core::cmp::min;
use soroban_sdk::auth::Context;
use soroban_sdk::{
    contract, contractimpl, contracttype, panic_with_error, Address, BytesN, Bytes, Env, IntoVal, Val, Vec,
};

mod errors;
mod events;

use crate::events::{
    AccountAddedEventData, AccountRemovedEventData, DefaultThresholdChangedEventData,
    FactoryAddedEventData, FactoryRemovedEventData, InitEventData, SignerAddedEventData,
    SignerRemovedEventData, ACCOUNT, ADDED, FACTORY, INIT, REMOVED, SECURITY, SIGNER, UPDATED,
};

use crate::errors::Error;

#[derive(serde::Deserialize)]
struct ClientDataJson<'a> {
    challenge: &'a str,
}

/// Declares the SignedMessage structure, containing the public key and signature.
#[contracttype]
#[derive(Clone)]
pub struct SignedMessage {
    pub public_key: BytesN<32>,
    pub signature: BytesN<64>,
}

/// Enum to represent different keys used in storage for the contract.
#[contracttype]
#[derive(Clone)]
enum DataKey {
    DefaultThreshold,
    Signers,
    Account(Address),
    Factory(Address),
}

pub const THRESHOLD_LIMIT: u32 = 5;

#[contract]
pub struct AuthController;

#[contractimpl]
impl AuthController {
    pub fn init(env: Env, signers: Vec<BytesN<65>>, default_threshold: u32) {
        if env
            .storage()
            .instance()
            .has::<Val>(&DataKey::Signers.into_val(&env))
        {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }

        if signers.len() > THRESHOLD_LIMIT {
            panic_with_error!(&env, Error::SignerLimitExceeded);
        }

        let valid_thresholds = 0..signers.len() + 1;
        if !valid_thresholds.contains(&default_threshold) {
            panic_with_error!(&env, Error::InvalidThreshold);
        }

        env.storage()
            .instance()
            .set::<Val, Vec<BytesN<65>>>(&DataKey::Signers.into_val(&env), &signers);

        env.storage().instance().set::<Val, u32>(
            &DataKey::DefaultThreshold.into_val(&env),
            &default_threshold,
        );

        env.events().publish(
            (SECURITY, INIT),
            InitEventData {
                threshold: default_threshold,
                signers,
            },
        );
    }

    pub fn add_signer(env: Env, signer: BytesN<65>) {
        env.current_contract_address().require_auth();
        let mut signers = env
            .storage()
            .instance()
            .get::<Val, Vec<BytesN<65>>>(&DataKey::Signers.into_val(&env))
            .unwrap();

        if signers.contains(&signer) {
            panic_with_error!(&env, Error::SignerAlreadyAdded);
        }

        if signers.len() == THRESHOLD_LIMIT {
            panic_with_error!(&env, Error::SignerLimitExceeded);
        }

        signers.push_back(signer.clone());
        env.storage()
            .instance()
            .set::<Val, Vec<BytesN<65>>>(&DataKey::Signers.into_val(&env), &signers);

        env.events()
            .publish((SIGNER, ADDED), SignerAddedEventData { signer });
    }

    pub fn remove_signer(env: Env, signer: BytesN<65>) {
        env.current_contract_address().require_auth();

        let mut signers = env
            .storage()
            .instance()
            .get::<Val, Vec<BytesN<65>>>(&DataKey::Signers.into_val(&env))
            .unwrap();

        let threshold = env
            .storage()
            .instance()
            .get::<Val, u32>(&DataKey::DefaultThreshold.into_val(&env))
            .unwrap_or(0);

        if signers.len() == threshold {
            panic_with_error!(&env, Error::InvalidThreshold);
        }

        match signers.first_index_of(&signer) {
            None => panic_with_error!(&env, Error::SignerDoesNotExist),
            Some(index) => signers.remove(index),
        };

        env.storage()
            .instance()
            .set::<Val, Vec<BytesN<65>>>(&DataKey::Signers.into_val(&env), &signers);

        env.events()
            .publish((SIGNER, REMOVED), SignerRemovedEventData { signer });
    }

    pub fn get_signers(env: Env) -> Vec<BytesN<65>> {
        env.storage()
            .instance()
            .get::<Val, Vec<BytesN<65>>>(&DataKey::Signers.into_val(&env))
            .unwrap()
    }

    pub fn set_default_threshold(env: Env, threshold: u32) {
        env.current_contract_address().require_auth();

        let signers = env
            .storage()
            .instance()
            .get::<Val, Vec<BytesN<32>>>(&DataKey::Signers.into_val(&env))
            .unwrap();
        let valid_thresholds = 0..min(signers.len() + 1, THRESHOLD_LIMIT + 1);

        if !valid_thresholds.contains(&threshold) {
            panic_with_error!(&env, Error::InvalidThreshold);
        }

        env.storage()
            .instance()
            .set::<Val, u32>(&DataKey::DefaultThreshold.into_val(&env), &threshold);

        env.events().publish(
            (SECURITY, UPDATED),
            DefaultThresholdChangedEventData { threshold },
        );
    }

    pub fn get_default_threshold(env: Env) -> u32 {
        env.storage()
            .instance()
            .get::<Val, u32>(&DataKey::DefaultThreshold.into_val(&env))
            .unwrap_or(0)
    }

    pub fn add_factory(env: Env, factory: Address, context: Vec<Address>) {
        env.current_contract_address().require_auth();
        for ctx in context.iter() {
            if env
                .storage()
                .instance()
                .has::<Val>(&DataKey::Factory(ctx.clone()).into_val(&env))
            {
                panic_with_error!(&env, Error::FactoryExists);
            }
            env.storage()
                .instance()
                .set::<Val, Address>(&DataKey::Factory(ctx).into_val(&env), &factory);
        }

        env.events()
            .publish((FACTORY, ADDED), FactoryAddedEventData { factory, context });
    }

    pub fn remove_factory(env: Env, factory: Address, context: Vec<Address>) {
        env.current_contract_address().require_auth();
        for ctx in context.iter() {
            if !env
                .storage()
                .instance()
                .has::<Val>(&DataKey::Factory(ctx.clone()).into_val(&env))
            {
                panic_with_error!(&env, Error::FactoryDoesNotExist);
            }
            env.storage()
                .instance()
                .remove::<Val>(&DataKey::Factory(ctx).into_val(&env));
        }

        env.events().publish(
            (FACTORY, REMOVED),
            FactoryRemovedEventData { factory, context },
        );
    }

    pub fn add_account(env: Env, account: Address, context: Vec<Address>) {
        // ? Skipping auth check to allow initial account setup. Once multiple accounts exist,
        // ? this should be enabled to prevent unauthorized additions and allow admins to manage accounts and approve them.
        // * The admins are stored in the auth contract itself whitelisted per contract configuration.
        // - Andler
        // env.current_contract_address().require_auth();
        for ctx in context.iter() {
            if env
                .storage()
                .instance()
                .has::<Val>(&DataKey::Account(ctx.clone()).into_val(&env))
            {
                panic_with_error!(&env, Error::AccountExists);
            }
            env.storage()
                .instance()
                .set::<Val, Address>(&DataKey::Account(ctx).into_val(&env), &account);
        }

        env.events()
            .publish((ACCOUNT, ADDED), AccountAddedEventData { account, context });
    }

    pub fn remove_account(env: Env, account: Address, context: Vec<Address>) {
        env.current_contract_address().require_auth();
        for ctx in context.iter() {
            if !env
                .storage()
                .instance()
                .has::<Val>(&DataKey::Account(ctx.clone()).into_val(&env))
            {
                panic_with_error!(&env, Error::AccountDoesNotExist);
            }
            env.storage()
                .instance()
                .remove::<Val>(&DataKey::Account(ctx).into_val(&env));
        }

        env.events().publish(
            (ACCOUNT, REMOVED),
            AccountRemovedEventData { account, context },
        );
    }

    pub fn get_accounts(env: Env, context: Vec<Address>) -> Vec<Address> {
        let mut accounts = Vec::new(&env);
        for ctx in context.iter() {
            if env
                .storage()
                .instance()
                .has::<Val>(&DataKey::Account(ctx.clone()).into_val(&env))
            {
                accounts.push_back(
                    env.storage()
                        .instance()
                        .get::<Val, Address>(&DataKey::Account(ctx.clone()).into_val(&env))
                        .unwrap(),
                );
            }
        }

        return accounts;
    }

    /// Checks if the given address is registered as an authenticated KindFi user.
    pub fn is_authenticated_user(env: Env, address: Address) -> bool {
        env.storage()
            .instance()
            .has::<Val>(&DataKey::Account(address).into_val(&env))
    }

    #[allow(non_snake_case)]
    pub fn __check_auth(
        env: Env,
        signature_payload: BytesN<32>,
        signature_args: Vec<Val>,
        auth_contexts: Vec<Context>,
    ) -> Result<(), Error> {
        // Parse signature_args into WebAuthn SignedMessage structs
        let signed_messages: Vec<SignedMessage> = signature_args
            .iter()
            .map(|arg| SignedMessage::from_val(&env, &arg))
            .collect();

        let signers = env
            .storage()
            .instance()
            .get::<Val, Vec<BytesN<65>>>(&DataKey::Signers.into_val(&env))
            .unwrap();

        let mut prev_sig: Option<BytesN<64>> = None;

        for signed_message in signed_messages.iter() {
            // Verify signer's public key is in authorized list
            if signers.first_index_of(&signed_message.public_key).is_none() {
                panic_with_error!(&env, Error::UnknownSigner);
            }

            // Ensure signature uniqueness
            if let Some(prev) = &prev_sig {
                if prev == &signed_message.signature {
                    panic_with_error!(&env, Error::DuplicateSignature);
                }
            }

            // ? WebAuthn signature payload Formula: SHA256(authenticator_data || SHA256(client_data_json))
            let mut payload = Bytes::new(&env);
            let client_data_hash = env.crypto().sha256(&signed_message.client_data_json);        
            payload.append(&signed_message.authenticator_data);
            payload.extend_from_array(&client_data_hash.to_array());
            let payload = env.crypto().sha256(&payload);

            env.crypto().secp256r1_verify(
                &signed_message.public_key,
                &payload,
                &signed_message.signature,
            );

            // Base64Url encoding without padding, 32 bytes = 43 characters
            const CHALLENGE_LENGTH: usize = 43;
            let client_data_buffer = signature.client_data_json.to_buffer::<1024>();
            let client_data_json = client_data_buffer.as_slice();
            let (client_data, _): (ClientDataJson, _) =
                serde_json_core::de::from_slice(client_data_json).map_err(|_| Error::JsonParseError)?;

            let mut expected_challenge = [b'_'; CHALLENGE_LENGTH];
            base64_url::encode(&mut expected_challenge, &signature_payload.to_array());

            if client_data.challenge.as_bytes() != expected_challenge {
                panic_with_error!(&env, Error::ClientDataJsonChallengeIncorrect);
            }

            prev_sig = Some(signed_message.signature.clone());
        }

        // Check threshold requirement
        let num_signers = signed_messages.len();
        let default_threshold = env
            .storage()
            .instance()
            .get::<Val, u32>(&DataKey::DefaultThreshold.into_val(&env))
            .unwrap();

        if (num_signers as u32) < default_threshold {
            panic_with_error!(&env, Error::DefaultThresholdNotMet);
        }

        // Validate authorization contexts
        for ctx in auth_contexts.iter() {
            match ctx {
                Context::Contract(contract_ctx) => {
                    let contract_addr = &contract_ctx.contract;
                    
                    let is_account = env
                        .storage()
                        .instance()
                        .has::<Val>(&DataKey::Account(contract_addr.clone()).into_val(&env));

                    let is_factory = env
                        .storage()
                        .instance()
                        .has::<Val>(&DataKey::Factory(contract_addr.clone()).into_val(&env));

                    let is_self = contract_addr == &env.current_contract_address();

                    if !is_account && !is_factory && !is_self {
                        panic_with_error!(&env, Error::NotAllowedContract);
                    }
                }
                Context::CreateContractHostFn(_) | Context::CreateContractWithCtorHostFn(_) => {
                    // Allow contract creation contexts
                    continue;
                }
            }
        }

        Ok(())
    }
}

mod test;
mod test_auth;
