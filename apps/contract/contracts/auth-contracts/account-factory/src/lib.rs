#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, symbol_short, vec, Address, BytesN, Env, Symbol,
};

pub mod events;

use crate::events::{AccountDeployEventData, ACCOUNT, DEPLOY};

#[contract]
pub struct AccountFactory;

#[contracterror]
#[derive(Copy, Clone, Eq, PartialEq, Debug)]
pub enum Error {
    StorageKeyError = 1,
}

const STORAGE_KEY_WASM_HASH: Symbol = symbol_short!("hash");
const AUTH_CONTRACT: Symbol = symbol_short!("auth");

#[contractimpl]
impl AccountFactory {
    pub fn __constructor(env: Env, auth_contract: Address, wasm_hash: BytesN<32>) {
        env.storage()
            .instance()
            .set(&STORAGE_KEY_WASM_HASH, &wasm_hash);

        env.storage().instance().set(&AUTH_CONTRACT, &auth_contract);
    }

    pub fn deploy(
        env: Env,
        salt: BytesN<32>,
        id: BytesN<32>,
        pk: BytesN<65>,
    ) -> Result<Address, Error> {
        let auth_contract = env
            .storage()
            .instance()
            .get::<Symbol, Address>(&AUTH_CONTRACT)
            .unwrap();

        auth_contract.require_auth();

        let wasm_hash = env
            .storage()
            .instance()
            .get::<Symbol, BytesN<32>>(&STORAGE_KEY_WASM_HASH)
            .ok_or(Error::StorageKeyError)?;

        let address = env.deployer().with_current_contract(salt).deploy_v2(
            wasm_hash,
            vec![&env, id.to_val(), pk.to_val(), auth_contract.to_val()],
        );

        env.events().publish(
            (ACCOUNT, DEPLOY),
            AccountDeployEventData {
                account: address.clone(),
            },
        );

        Ok(address)
    }
}

mod test;
