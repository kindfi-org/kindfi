#![cfg(test)]

use ed25519_dalek::{Keypair, Signer};
use hex::decode;
use rand::rngs::OsRng;

use soroban_sdk::auth::{Context, ContractContext};
use soroban_sdk::testutils::{Address as _, BytesN as _, Events as _};
use soroban_sdk::{vec, Address, BytesN, Env, IntoVal, Symbol, Val, Vec};

use crate::errors::Error;
use crate::{AuthController, AuthControllerClient, SignedMessage};

const ALICE_SECRET: &str = "aa6b73f386eddd659378de94bf4845b87b00011d1273b3d69494a917a7df82f1dbbd558f6018af64488f93a006b1abf041a52c6e489a47deb7ad71737c6cb233";
const BOB_SECRET: &str = "6afa007a6b4b844cacf5e79b058ec4663c6a021ac538e95f17402f977a13e25a59941ad42e9036d052b267031d5ffaee9146e0d2a2d7d8bf2c4a623eb054a8af";
const EVE_SECRET: &str = "389ecdb749f1a7b1c5c12d05f3ba38b5dbd61bff65005e2ded2f6ebe9448f17301cc01139e2448acaf4078d09e8894367d19aaace5b38de6f5ba2a589886ca0a";

fn sign(e: &Env, signer: &Keypair, payload: &BytesN<32>) -> Val {
    SignedMessage {
        public_key: signer.public.to_bytes().into_val(e),
        signature: signer
            .sign(payload.to_array().as_slice())
            .to_bytes()
            .into_val(e),
    }
    .into_val(e)
}

struct Controller {
    controller_address: Address,
    env: Env,
    client: AuthControllerClient<'static>,
    threshold: u32,
    signers: Vec<BytesN<32>>,
}

impl Controller {
    fn new(threshold: u32) -> Self {
        let env = Env::default();
        env.budget().reset_unlimited();
        env.mock_all_auths();

        let controller_address = env.register_contract(None, AuthController);
        let client = AuthControllerClient::new(&env, &controller_address);
        let signers = vec![
            &env,
            Keypair::from_bytes(&decode(ALICE_SECRET).unwrap())
                .unwrap()
                .public
                .to_bytes()
                .into_val(&env),
            Keypair::from_bytes(&decode(BOB_SECRET).unwrap())
                .unwrap()
                .public
                .to_bytes()
                .into_val(&env),
        ];

        client.init(&signers, &threshold);

        Controller {
            env,
            client,
            threshold,
            controller_address,
            signers,
        }
    }
}

#[test]
#[should_panic(expected = "#104")]
fn init_only_once() {
    let Controller {
        client,
        signers,
        threshold,
        ..
    } = Controller::new(2);
    client.init(&signers, &threshold);
}

#[test]
fn test_default_threshold_not_met() {
    let controller = Controller::new(2);
    let env = controller.env;
    let alice = Keypair::from_bytes(&decode(ALICE_SECRET).unwrap()).unwrap();

    let payload = BytesN::random(&env);

    let pair = Keypair::from_bytes(&decode(EVE_SECRET).unwrap()).unwrap();
    let key = pair.public.to_bytes().into_val(&client.env);

    let invocation = env.try_invoke_contract_check_auth::<Error>(
        &controller.controller_address.contract_id(),
        &payload,
        &vec![&env, sign(&env, &alice, &payload)],
        &vec![
            &env,
            Context::Contract(ContractContext {
                contract: controller.controller_address,
                fn_name: Symbol::new(&env, "add_signer"),
                args: (key).into_val(&env),
            }),
        ],
    );
    assert_eq!(
        invocation.err().unwrap().unwrap(),
        Error::DefaultThresholdNotMet
    );
}

#[test]
fn test_default_threshold_met_but_wrong_signer() {
    let controller = Controller::new(2);
    let env = controller.env;
    let dave = Address::random(&env);
    let alice = Keypair::from_bytes(&decode(ALICE_SECRET).unwrap()).unwrap();
    let eve = Keypair::from_bytes(&decode(EVE_SECRET).unwrap()).unwrap();

    let payload = BytesN::random(&env);

    let pair = Keypair::from_bytes(&decode(EVE_SECRET).unwrap()).unwrap();
    let key = pair.public.to_bytes().into_val(&client.env);

    let invocation = env.try_invoke_contract_check_auth::<Error>(
        &controller.controller_address.contract_id(),
        &payload,
        &vec![
            &env,
            sign(&env, &alice, &payload),
            sign(&env, &eve, &payload),
        ],
        &vec![
            &env,
            Context::Contract(ContractContext {
                contract: controller.controller_address,
                fn_name: Symbol::new(&env, "add_signer"),
                args: (key).into_val(&env),
            }),
        ],
    );
    assert_eq!(invocation.err().unwrap().unwrap(), Error::UnknownSigner);
}

#[test]
fn test_default_threshold_met() {
    let controller = Controller::new(2);
    let env = controller.env;
    let eve = Address::random(&env);
    let alice = Keypair::from_bytes(&decode(ALICE_SECRET).unwrap()).unwrap();
    let bob = Keypair::from_bytes(&decode(BOB_SECRET).unwrap()).unwrap();

    let payload = BytesN::random(&env);

    let pair = Keypair::from_bytes(&decode(EVE_SECRET).unwrap()).unwrap();
    let key = pair.public.to_bytes().into_val(&client.env);

    let invocation = env.try_invoke_contract_check_auth::<Error>(
        &controller.controller_address.contract_id(),
        &payload,
        &vec![
            &env,
            sign(&env, &alice, &payload),
            sign(&env, &bob, &payload),
        ],
        &vec![
            &env,
            Context::Contract(ContractContext {
                contract: controller.controller_address,
                fn_name: Symbol::new(&env, "add_signer"),
                args: (key).into_val(&env),
            }),
        ],
    );
    assert!(invocation.is_ok());
}

#[test]
fn test_default_threshold_set_on_init() {
    let Controller {
        client,
        threshold,
        env,
        ..
    } = Controller::new(2);
    assert_eq!(client.get_default_threshold(), threshold);
    assert_eq!(env.events().all().len(), 1);
}

#[test]
fn test_add_signer() {
    let Controller { client, env, .. } = Controller::new(2);
    assert_eq!(client.get_signers().len(), 2);
    let pair = Keypair::from_bytes(&decode(EVE_SECRET).unwrap()).unwrap();
    let key = pair.public.to_bytes().into_val(&client.env);
    client.add_signer(&key);
    assert_eq!(client.get_signers().len(), 3);
    assert_eq!(env.events().all().len(), 2);
}

#[test]
fn test_remove_signer() {
    let Controller { client, env, .. } = Controller::new(1);
    assert_eq!(client.get_signers().len(), 2);
    let pair = Keypair::from_bytes(&decode(ALICE_SECRET).unwrap()).unwrap();
    let key = pair.public.to_bytes().into_val(&client.env);
    client.remove_signer(&key);
    assert_eq!(client.get_signers().len(), 1);
    assert_eq!(env.events().all().len(), 2);
}

#[test]
#[should_panic(expected = "#103")]
fn test_remove_signer_fails_if_not_exists() {
    let Controller { client, env, .. } = Controller::new(1);
    let pair = Keypair::from_bytes(&decode(EVE_SECRET).unwrap()).unwrap();
    let key = pair.public.to_bytes().into_val(&client.env);
    client.remove_signer(&key);
    assert_eq!(env.events().all().len(), 2);
}

#[test]
fn test_add_account() {
    let Controller { client, env, .. } = Controller::new(2);
    let policy = Address::random(&env);
    let context = vec![&env, Address::random(&env)];
    assert_eq!(client.get_accounts(&context).len(), 0);
    client.add_account(&policy, &context);
    assert_eq!(client.get_accounts(&context).len(), 1);
    assert_eq!(env.events().all().len(), 2);
}

#[test]
#[should_panic(expected = "#109")]
fn test_add_account_fails_if_already_exists() {
    let Controller { client, env, .. } = Controller::new(2);
    let policy = Address::random(&env);
    let other = Address::random(&env);
    let context = vec![&env, Address::random(&env)];
    client.add_account(&policy, &context);
    client.add_account(&other, &context);
}

#[test]
fn test_remove_account() {
    let Controller { client, env, .. } = Controller::new(2);
    let policy = Address::random(&env);
    let context = vec![&env, Address::random(&env)];
    assert_eq!(client.get_accounts(&context).len(), 0);
    client.add_account(&policy, &context);
    assert_eq!(client.get_accounts(&context).len(), 1);
    client.remove_account(&context);
    assert_eq!(client.get_accounts(&context).len(), 0);
    assert_eq!(env.events().all().len(), 3);
}

#[test]
#[should_panic(expected = "#1010")]
fn test_remove_account_fails_if_not_exists() {
    let Controller { client, env, .. } = Controller::new(2);
    let context = vec![&env, Address::random(&env)];
    client.remove_account(&context);
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
    let mut csprng = OsRng {};

    for _ in 0..15 {
        let keypair: Keypair = Keypair::generate(&mut csprng);
        let bytes = keypair.public.to_bytes().into_val(&env);
        client.add_signer(&bytes);
    }
}

#[test]
#[should_panic(expected = "#106")]
fn test_signers_cannot_be_added_multiple_times() {
    let Controller { client, env, .. } = Controller::new(2);
    let candidate = Keypair::from_bytes(&decode(ALICE_SECRET).unwrap())
        .unwrap()
        .public
        .to_bytes()
        .into_val(&env);
    client.add_signer(&candidate);
}

#[test]
#[should_panic(expected = "#105")]
fn test_signers_cannot_be_removed_if_threshold_not_reduced() {
    let Controller { client, env, .. } = Controller::new(2);
    let candidate = Keypair::from_bytes(&decode(ALICE_SECRET).unwrap())
        .unwrap()
        .public
        .to_bytes()
        .into_val(&env);
    client.remove_signer(&candidate);
}
