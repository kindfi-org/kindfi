#![no_std]
use soroban_sdk::{contract, contractimpl, panic_with_error, vec, Env, String, Vec};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    SignerLimitExceeded = 1002,
    UnknownSigner = 1003,
    DefaultThresholdNotMet = 1004,
    SignerDoesNotExist = 1006,
    AlreadyInitialized = 1007,
    InvalidThreshold = 1008,
    SignerAlreadyAdded = 1009,
    AccountThresholdNotMet = 1010,
    DuplicateSignature = 1011,
    AccountExists = 1012,
    AccountDoesNotExist = 1013,
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
}

pub const THRESHOLD_LIMIT: u32 = 5;

#[contract]
pub struct AuthController;

#[contractimpl]
impl AuthController {
    fn init(env: Env, signers: Vec<BytesN<32>>, default_threshold: u32) {
        if env.storage().instance().has(&DataKey::Signers) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }

        if signers.len() > THRESHOLD_LIMIT {
            panic_with_error!(&env, Error::SignerLimitExceeded);
        }

        let valid_thresholds = 0..signers.len() + 1;
        if !valid_thresholds.contains(&DataKey::DefaultThreshold) {
            panic_with_error!(&env, Error::InvalidThreshold);
        }

        env.storage().instance().set(&DataKey::Signers, &signers);
        env.storage()
            .instance()
            .set(&DataKey::DefaultThreshold, &default_threshold);
    }

    fn add_signer(env: Env, signer: BytesN<32>) {
        env.current_contract_address().require_auth();
        let mut signers: Vec<BytesN<32>> = env.storage().instance().get(&DataKey::Signers).unwrap();

        if signers.contains(&signer) {
            panic_with_error!(&env, Error::SignerAlreadyAdded);
        }

        if signers.len() == THRESHOLD_LIMIT {
            panic_with_error!(&env, Error::SignerLimitExceeded);
        }

        signers.push_back(signer.clone());
        env.storage().instance().set(&DataKey::Signers, &signers);
    }

    fn remove_signer(env: Env, signer: BytesN<32>) {
        env.current_contract_address().require_auth();

        let mut signers: Vec<BytesN<32>> = env.storage().instance().get(&DataKey::Signers).unwrap();

        let threshold = env
            .storage()
            .instance()
            .get(&DataKey::DefaultThreshold)
            .unwrap_or(0);

        if signers.len() == threshold {
            panic_with_error!(&env, Error::InvalidThreshold);
        }

        match signers.first_index_of(&signer) {
            None => panic_with_error!(&env, Error::SignerDoesNotExist),
            Some(index) => signers.remove(index),
        };

        env.storage().instance().set(&DataKey::Signers, &signers);
    }

    fn get_signers(env: Env) -> Vec<BytesN<32>> {
        env.storage().instance().get(&DataKey::Signers).unwrap()
    }

    fn set_default_threshold(env: Env, threshold: u32) {
        env.current_contract_address().require_auth();

        let signers: Vec<BytesN<32>> = env.storage().instance().get(&DataKey::Signers).unwrap();
        let valid_thresholds = 0..min(signers.len() + 1, THRESHOLD_LIMIT + 1);

        if !valid_thresholds.contains(&threshold) {
            panic_with_error!(&env, Error::InvalidThreshold);
        }

        env.storage()
            .instance()
            .set(&DataKey::DefaultThreshold, &threshold);
    }

    fn get_default_threshold(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::DefaultThreshold)
            .unwrap_or(0)
    }

    fn add_account(env: Env, account: Address, context: Vec<Address>) {
        env.current_contract_address().require_auth();
        for ctx in context.iter() {
            if env.storage().instance().has(&DataKey::Account(ctx.clone())) {
                panic_with_error!(&env, Error::AccountExists);
            }
            env.storage()
                .instance()
                .set(&DataKey::Account(ctx), &account);
        }
    }

    fn remove_account(env: Env, context: Vec<Address>) {
        env.current_contract_address().require_auth();
        for ctx in context.iter() {
            if !env.storage().instance().has(&DataKey::Account(ctx.clone())) {
                panic_with_error!(&env, Error::AccountDoesNotExist);
            }
            env.storage().instance().remove(&DataKey::Account(ctx));
        }
    }

    fn get_accounts(env: Env, context: Vec<Address>) -> Vec<Address> {
        let mut accounts = Vec::new(&env);
        for ctx in context.iter() {
            if env.storage().instance().has(&DataKey::Account(ctx.clone())) {
                accounts.push_back(
                    env.storage()
                        .instance()
                        .get(&DataKey::Account(ctx.clone()))
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
        let signers: Vec<BytesN<32>> = env.storage().instance().get(&DataKey::Signers).unwrap();

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

        for ctx in auth_context.iter() {
            match ctx.clone() {
                Context::Contract(contract_ctx) => {
                    match env
                        .storage()
                        .instance()
                        .get(&DataKey::Account(contract_ctx.clone().contract))
                    {
                        Some(address) => {
                            let actThreshold = 4;
                            if actThreshold > num_signers {
                                panic_with_error!(&env, Error::AccountThresholdNotMet);
                            }
                        }
                        None => {
                            let default_threshold = env
                                .storage()
                                .instance()
                                .get(&DataKey::DefaultThreshold)
                                .unwrap_or(0);
                            if default_threshold > num_signers {
                                panic_with_error!(&env, Error::DefaultThresholdNotMet);
                            }
                        }
                    };
                }
                Context::CreateContractHostFn(_) => (),
            }
        }
        Ok(())
    }
}

mod test;
