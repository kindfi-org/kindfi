#![no_std]
use core::cmp::min;
use soroban_sdk::auth::Context;
use soroban_sdk::{
    contract, contractimpl, contracttype, panic_with_error, Address, BytesN, Env, IntoVal, Val, Vec,
};

mod errors;
mod events;

use crate::events::{
    AccountAddedEventData, AccountRemovedEventData, DefaultThresholdChangedEventData,
    FactoryAddedEventData, FactoryRemovedEventData, InitEventData, SignerAddedEventData,
    SignerRemovedEventData, ACCOUNT, ADDED, FACTORY, INIT, REMOVED, SECURITY, SIGNER, UPDATE,
};

use crate::errors::Error;

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
    pub fn init(env: Env, signers: Vec<BytesN<32>>, default_threshold: u32) {
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
            .set::<Val, Vec<BytesN<32>>>(&DataKey::Signers.into_val(&env), &signers);

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

    pub fn add_signer(env: Env, signer: BytesN<32>) {
        env.current_contract_address().require_auth();
        let mut signers = env
            .storage()
            .instance()
            .get::<Val, Vec<BytesN<32>>>(&DataKey::Signers.into_val(&env))
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
            .set::<Val, Vec<BytesN<32>>>(&DataKey::Signers.into_val(&env), &signers);

        env.events()
            .publish((SIGNER, ADDED), SignerAddedEventData { signer });
    }

    pub fn remove_signer(env: Env, signer: BytesN<32>) {
        env.current_contract_address().require_auth();

        let mut signers = env
            .storage()
            .instance()
            .get::<Val, Vec<BytesN<32>>>(&DataKey::Signers.into_val(&env))
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
            .set::<Val, Vec<BytesN<32>>>(&DataKey::Signers.into_val(&env), &signers);

        env.events()
            .publish((SIGNER, REMOVED), SignerRemovedEventData { signer });
    }

    pub fn get_signers(env: Env) -> Vec<BytesN<32>> {
        env.storage()
            .instance()
            .get::<Val, Vec<BytesN<32>>>(&DataKey::Signers.into_val(&env))
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
            (SECURITY, UPDATE),
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
        env.current_contract_address().require_auth();
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

    #[allow(non_snake_case)]
    fn __check_auth(
        env: Env,
        signature_payload: BytesN<32>,
        signed_messages: Vec<SignedMessage>,
        auth_context: Vec<Context>,
    ) -> Result<(), Error> {
        let signers = env
            .storage()
            .instance()
            .get::<Val, Vec<BytesN<32>>>(&DataKey::Signers.into_val(&env))
            .unwrap();

        let mut prevSig: Option<BytesN<64>> = None;

        for i in 0..signed_messages.len() {
            let signature = signed_messages.get_unchecked(i);

            if signers.first_index_of(&signature.public_key).is_none() {
                panic_with_error!(&env, Error::UnknownSigner);
            }

            // Ensure the signature is unique and sequential
            if let Some(prev) = &prevSig {
                if prev == &signature.signature {
                    panic_with_error!(&env, Error::DuplicateSignature);
                }
            }

            env.crypto().ed25519_verify(
                &signature.public_key,
                &signature_payload.clone().into(),
                &signature.signature,
            );

            prevSig = Some(signature.signature.clone());
        }

        let num_signers = signed_messages.len();

        let default_threshold = env
            .storage()
            .instance()
            .get::<Val, u32>(&DataKey::DefaultThreshold.into_val(&env))
            .unwrap();

        if default_threshold >= num_signers {
            panic_with_error!(&env, Error::DefaultThresholdNotMet);
        }

        for ctx in auth_context.iter() {
            match ctx.clone() {
                Context::Contract(contract_ctx) => {
                    let is_account = env
                        .storage()
                        .instance()
                        .get::<Val, Address>(
                            &DataKey::Account(contract_ctx.clone().contract).into_val(&env),
                        )
                        .is_some();

                    let is_factory = env
                        .storage()
                        .instance()
                        .get::<Val, Address>(
                            &DataKey::Factory(contract_ctx.clone().contract).into_val(&env),
                        )
                        .is_some();

                    let is_current =
                        contract_ctx.clone().contract == env.current_contract_address();

                    match (is_account, is_factory, is_current) {
                        (false, false, false) => panic_with_error!(&env, Error::NotAllowedContract),
                        _ => (),
                    }
                }
                Context::CreateContractHostFn(_) => (),
                Context::CreateContractWithCtorHostFn(_) => (),
            }
        }
        Ok(())
    }
}

mod test;
