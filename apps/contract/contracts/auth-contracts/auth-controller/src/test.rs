#![cfg(test)]
extern crate std;

use ed25519_dalek::{Signature, Signer, SigningKey, PUBLIC_KEY_LENGTH, SIGNATURE_LENGTH};
use rand::rngs::OsRng;
use rand::RngCore;
use soroban_sdk::auth::{Context, ContractContext};
use soroban_sdk::testutils::{Address as _, Logs};
use soroban_sdk::{log, vec, Address, BytesN, Env, IntoVal, Symbol, Val, Vec};

use crate::errors::Error;
use crate::{AuthController, AuthControllerClient, SignedMessage};

fn generate_keypair() -> SigningKey {
    let mut csprng = OsRng;
    SigningKey::generate(&mut csprng)
}

fn gen_random_bytes<const N: usize>(env: &Env) -> BytesN<N> {
    let mut rng = OsRng;
    let mut random_bytes = [0u8; N];
    rng.try_fill_bytes(&mut random_bytes)
        .expect("unable to fill bytes");

    BytesN::from_array(env, &random_bytes)
}

fn signer_public_key(e: &Env, signing_key: &SigningKey) -> BytesN<65> {
    let verifying_key_bytes: [u8; PUBLIC_KEY_LENGTH] = signing_key.verifying_key().to_bytes();
    BytesN::from_array(e, &verifying_key_bytes)
}

fn get_signature_bytes(e: &Env, signature: &Signature) -> BytesN<64> {
    let signature_bytes: [u8; SIGNATURE_LENGTH] = signature.to_bytes();
    BytesN::from_array(e, &signature_bytes)
}

fn sign(e: &Env, signing_key: &SigningKey, payload: &BytesN<65>) -> Val {
    SignedMessage {
        public_key: signer_public_key(e, signing_key),
        signature: get_signature_bytes(e, &signing_key.sign(payload.to_array().as_slice())),
    }
    .into_val(e)
}

struct Controller {
    controller_address: Address,
    env: Env,
    client: AuthControllerClient<'static>,
    threshold: u32,
    signers: [SigningKey; 2],
    signers_bytes: Vec<BytesN<65>>,
}

impl Controller {
    fn new(threshold: u32) -> Self {
        let env = Env::default();
        env.cost_estimate().budget().reset_unlimited();
        env.mock_all_auths();

        let controller_address = env.register(AuthController, ());
        let client = AuthControllerClient::new(&env, &controller_address);
        let mut signers = [generate_keypair(), generate_keypair()];

        if signers[0].verifying_key().as_bytes() > signers[1].verifying_key().as_bytes() {
            signers.swap(0, 1);
        }

        let signers_bytes = vec![
            &env,
            signer_public_key(&env, &signers[0]),
            signer_public_key(&env, &signers[1]),
        ];

        client.init(&signers_bytes, &threshold);

        Controller {
            env,
            client,
            threshold,
            controller_address,
            signers_bytes,
            signers,
        }
    }
}

#[test]
#[should_panic(expected = "#104")]
fn init_only_once() {
    let Controller {
        client,
        signers_bytes,
        threshold,
        ..
    } = Controller::new(2);
    client.init(&signers_bytes, &threshold);
}

#[test]
fn test_default_threshold_not_met() {
    let controller = Controller::new(2);
    let env = controller.env;
    let payload = gen_random_bytes::<32>(&env);

    let new_signer = generate_keypair();
    let new_signer_pk = signer_public_key(&env, &new_signer);

    let invocation = env.try_invoke_contract_check_auth::<Error>(
        &controller.controller_address,
        &payload,
        vec![&env, sign(&env, &controller.signers[0], &payload)].into(),
        &vec![
            &env,
            Context::Contract(ContractContext {
                contract: controller.controller_address.clone(),
                fn_name: Symbol::new(&env, "add_signer"),
                args: (new_signer_pk,).into_val(&env),
            }),
        ],
    );

    match invocation {
        Ok(()) => log!(&env, "Log message: Success"),
        Err(inner_error) => match inner_error {
            Ok(e) => log!(&env, "Inner error: {:?}", e), // E variant
            Err(_) => log!(&env, "Invocation failed: {:?}", "invoke err"), // InvokeError variant
        },
    }

    env.logs().print();

    // assert!(invocation.is_ok());
}

#[test]
fn test_default_threshold_met_but_wrong_signer() {
    let controller = Controller::new(2);
    let env = controller.env;
    let payload = gen_random_bytes::<32>(&env);

    let wrong_signer = generate_keypair();
    let new_signer = generate_keypair();

    let invocation = env.try_invoke_contract_check_auth::<Error>(
        &controller.controller_address,
        &payload,
        vec![
            &env,
            sign(&env, &controller.signers[0], &payload),
            sign(&env, &wrong_signer, &payload),
        ]
        .into(),
        &vec![
            &env,
            Context::Contract(ContractContext {
                contract: controller.controller_address.clone(),
                fn_name: Symbol::new(&env, "add_signer"),
                args: (signer_public_key(&env, &new_signer),).into_val(&env),
            }),
        ],
    );

    match invocation {
        Ok(()) => log!(&env, "Log message: Success"),
        Err(inner_error) => match inner_error {
            Ok(e) => log!(&env, "Inner error: {:?}", e), // E variant
            Err(_) => log!(&env, "Invocation failed: {:?}", "invoke err"), // InvokeError variant
        },
    }

    env.logs().print();

    // assert!(invocation.is_ok());
}

#[test]
fn test_default_threshold_met() {
    let controller = Controller::new(2);
    let env = controller.env;

    let payload = gen_random_bytes::<32>(&env);

    let new_signer = generate_keypair();

    let invocation = env.try_invoke_contract_check_auth::<Error>(
        &controller.controller_address,
        &payload,
        vec![
            &env,
            sign(&env, &controller.signers[0], &payload),
            sign(&env, &controller.signers[1], &payload),
        ]
        .into(),
        &vec![
            &env,
            Context::Contract(ContractContext {
                contract: controller.controller_address.clone(),
                fn_name: Symbol::new(&env, "add_signer"),
                args: (signer_public_key(&env, &new_signer),).into_val(&env),
            }),
        ],
    );

    match invocation {
        Ok(()) => log!(&env, "Log message: Success"),
        Err(inner_error) => match inner_error {
            Ok(e) => log!(&env, "Inner error: {:?}", e), // E variant
            Err(_) => log!(&env, "Invocation failed: {:?}", "invoke err"), // InvokeError variant
        },
    }

    env.logs().print();

    // assert!(invocation.is_ok());
}

#[test]
fn test_default_threshold_set_on_init() {
    let Controller {
        client, threshold, ..
    } = Controller::new(2);
    assert_eq!(client.get_default_threshold(), threshold);
}

#[test]
fn test_add_signer() {
    let Controller { client, env, .. } = Controller::new(2);
    assert_eq!(client.get_signers().len(), 2);
    let new_signer = generate_keypair();
    let signer_pubkey = signer_public_key(&env, &new_signer);
    client.add_signer(&signer_pubkey);
    assert_eq!(client.get_signers().len(), 3);
}

#[test]
fn test_remove_signer() {
    let Controller {
        client,
        env,
        signers,
        ..
    } = Controller::new(1);
    assert_eq!(client.get_signers().len(), 2);
    let signer = signer_public_key(&env, &signers[0]);
    client.remove_signer(&signer);
    assert_eq!(client.get_signers().len(), 1);
}

#[test]
#[should_panic(expected = "#103")]
fn test_remove_signer_fails_if_not_exists() {
    let Controller { client, env, .. } = Controller::new(1);
    let signer = generate_keypair();
    let signer_pubkey = signer_public_key(&env, &signer);
    client.remove_signer(&signer_pubkey);
}

#[test]
fn test_add_account() {
    let Controller { client, env, .. } = Controller::new(2);
    let account = Address::generate(&env);
    let context = vec![&env, Address::generate(&env)];
    assert_eq!(client.get_accounts(&context).len(), 0);
    client.add_account(&account, &context);
    assert_eq!(client.get_accounts(&context).len(), 1);
}

#[test]
#[should_panic(expected = "#109")]
fn test_add_account_fails_if_already_exists() {
    let Controller { client, env, .. } = Controller::new(2);
    let account = Address::generate(&env);
    let other = Address::generate(&env);
    let context = vec![&env, Address::generate(&env)];
    client.add_account(&account, &context);
    client.add_account(&other, &context);
}

#[test]
fn test_remove_account() {
    let Controller { client, env, .. } = Controller::new(2);
    let account = Address::generate(&env);
    let context = vec![&env, Address::generate(&env)];
    assert_eq!(client.get_accounts(&context).len(), 0);
    client.add_account(&account, &context);
    assert_eq!(client.get_accounts(&context).len(), 1);
    client.remove_account(&account, &context);
    assert_eq!(client.get_accounts(&context).len(), 0);
}

#[test]
#[should_panic(expected = "#1010")]
fn test_remove_account_fails_if_not_exists() {
    let Controller { client, env, .. } = Controller::new(2);
    let account = Address::generate(&env);
    let context = vec![&env, Address::generate(&env)];
    client.remove_account(&account, &context);
}

#[test]
#[should_panic(expected = "#105")]
fn test_invalid_threshold_on_init_fails() {
    Controller::new(10);
}

#[test]
#[should_panic(expected = "#105")]
fn test_invalid_threshold_on_update_fails() {
    let Controller { client, .. } = Controller::new(2);
    client.set_default_threshold(&10);
}

#[test]
#[should_panic(expected = "#100")]
fn test_exceeding_signer_limit_on_update_fails() {
    let Controller { client, env, .. } = Controller::new(2);
    for _ in 0..15 {
        let signer = generate_keypair();
        let signer_pubkey = signer_public_key(&env, &signer);
        client.add_signer(&signer_pubkey);
    }
}

#[test]
#[should_panic(expected = "#106")]
fn test_signers_cannot_be_added_multiple_times() {
    let Controller {
        client,
        env,
        signers,
        ..
    } = Controller::new(2);
    let signer_pubkey = signer_public_key(&env, &signers[0]);
    client.add_signer(&signer_pubkey);
}

#[test]
#[should_panic(expected = "#105")]
fn test_signers_cannot_be_removed_if_threshold_not_reduced() {
    let Controller {
        client,
        env,
        signers,
        ..
    } = Controller::new(2);
    let signer_pubkey = signer_public_key(&env, &signers[0]);
    client.remove_signer(&signer_pubkey);
}
