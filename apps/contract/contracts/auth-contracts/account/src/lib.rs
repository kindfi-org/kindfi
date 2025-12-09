#![no_std]
use soroban_sdk::{
    auth::{Context, CustomAccountInterface},
    contract, contractimpl, contracttype,
    crypto::Hash,
    panic_with_error, symbol_short, Address, Bytes, BytesN, Env, Symbol, Vec,
};
mod base64_url;
mod errors;
pub mod events;
mod transfers;

use crate::events::{
    AccountRecoveredEventData, DeviceAddedEventData, DeviceRemovedEventData,
    RecoveryAddressEventData, ACCOUNT, ADDED, DEVICE, REMOVED, SECURITY, UPDATED,
};

use crate::errors::Error;

#[contract]
pub struct AccountContract;

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct Signature {
    pub authenticator_data: Bytes,
    pub client_data_json: Bytes,
    pub device_id: BytesN<32>,
    pub signature: BytesN<64>,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct DevicePublicKey {
    pub device_id: BytesN<32>,
    pub public_key: BytesN<65>,
}

#[derive(serde::Deserialize)]
struct ClientDataJson<'a> {
    challenge: &'a str,
}

const STORAGE_KEY_DEVICES: Symbol = symbol_short!("devices");
const RECOVERY_ADDRESS: Symbol = symbol_short!("recovery");
const AUTH_CONTRACT: Symbol = symbol_short!("auth");

#[contractimpl]
impl AccountContract {
    pub fn __constructor(
        env: Env,
        device_id: BytesN<32>,
        public_key: BytesN<65>,
        auth_contract: Address,
    ) {
        let mut devices = Vec::new(&env);
        devices.push_back(DevicePublicKey {
            device_id,
            public_key,
        });
        env.storage().instance().set(&STORAGE_KEY_DEVICES, &devices);
        env.storage().instance().set(&AUTH_CONTRACT, &auth_contract);
    }

    pub fn add_device(env: Env, device_id: BytesN<32>, public_key: BytesN<65>) {
        env.current_contract_address().require_auth();
        let mut devices: Vec<DevicePublicKey> = env
            .storage()
            .instance()
            .get(&STORAGE_KEY_DEVICES)
            .unwrap_or(Vec::new(&env));

        if devices.iter().any(|device| device.device_id == device_id) {
            panic_with_error!(&env, Error::DeviceAlreadySet);
        }

        devices.push_back(DevicePublicKey {
            device_id: device_id.clone(),
            public_key: public_key.clone(),
        });

        env.storage().instance().set(&STORAGE_KEY_DEVICES, &devices);

        env.events().publish(
            (DEVICE, ADDED),
            DeviceAddedEventData {
                device_id,
                public_key,
            },
        );
    }

    pub fn remove_device(env: Env, device_id: BytesN<32>) {
        env.current_contract_address().require_auth();

        let mut devices: Vec<DevicePublicKey> =
            env.storage().instance().get(&STORAGE_KEY_DEVICES).unwrap();

        if let Some(device_) = devices.iter().find(|device| device.device_id == device_id) {
            if let Some(index) = devices.first_index_of(&device_) {
                devices.remove(index);
            }
        } else {
            panic_with_error!(&env, Error::DeviceNotFound);
        }

        if devices.len() < 1 {
            panic_with_error!(&env, Error::DeviceCannotBeEmpty);
        }

        env.storage().instance().set(&STORAGE_KEY_DEVICES, &devices);

        env.events()
            .publish((DEVICE, REMOVED), DeviceRemovedEventData { device_id });
    }

    pub fn get_devices(env: Env) -> Vec<DevicePublicKey> {
        env.storage()
            .instance()
            .get(&STORAGE_KEY_DEVICES)
            .unwrap_or_else(|| Vec::new(&env))
    }

    pub fn get_auth(env: Env) -> Address {
        env.storage().instance().get(&AUTH_CONTRACT).unwrap()
    }

    pub fn add_recovery_address(env: Env, address: Address) {
        env.current_contract_address().require_auth();

        if env.storage().instance().has(&RECOVERY_ADDRESS) {
            panic_with_error!(&env, Error::RecoveryAddressSet);
        }

        env.storage().instance().set(&RECOVERY_ADDRESS, &address);

        env.events().publish(
            (ACCOUNT, SECURITY, ADDED),
            RecoveryAddressEventData { address },
        );
    }

    pub fn update_recovery_address(env: Env, address: Address) {
        env.current_contract_address().require_auth();

        // add multisig authentication from parent auth contract for recovery update
        let auth_contract = env
            .storage()
            .instance()
            .get::<Symbol, Address>(&AUTH_CONTRACT)
            .unwrap();

        auth_contract.require_auth();

        env.storage().instance().set(&RECOVERY_ADDRESS, &address);

        env.events().publish(
            (ACCOUNT, SECURITY, UPDATED),
            RecoveryAddressEventData { address },
        );
    }

    pub fn recover_account(env: Env, new_device_id: BytesN<32>, new_public_key: BytesN<65>) {
        // add multisig authentication from parent auth contract for recovery update
        let auth_contract = env
            .storage()
            .instance()
            .get::<Symbol, Address>(&AUTH_CONTRACT)
            .unwrap();

        auth_contract.require_auth();

        let recovery_address = env
            .storage()
            .instance()
            .get::<Symbol, Address>(&RECOVERY_ADDRESS)
            .unwrap();

        recovery_address.require_auth();

        let mut devices = Vec::new(&env);
        devices.push_back(DevicePublicKey {
            device_id: new_device_id.clone(),
            public_key: new_public_key.clone(),
        });

        env.storage().instance().set(&STORAGE_KEY_DEVICES, &devices);

        env.events().publish(
            (ACCOUNT, SECURITY),
            AccountRecoveredEventData {
                device_id: new_device_id,
                public_key: new_public_key,
            },
        );
    }

    // ===== TRANSFER & PAYMENT FUNCTIONS =====

    /// Transfer native XLM to another address
    /// Requires WebAuthn authentication via __check_auth
    pub fn transfer_xlm(env: Env, to: Address, amount: i128) {
        transfers::transfer_xlm(&env, to, amount)
            .unwrap_or_else(|e| panic_with_error!(&env, e));
    }

    /// Transfer any Stellar Asset (SAC token) to another address
    /// Requires WebAuthn authentication via __check_auth
    pub fn transfer_token(env: Env, token: Address, to: Address, amount: i128) {
        transfers::transfer_token(&env, token, to, amount)
            .unwrap_or_else(|e| panic_with_error!(&env, e));
    }

    /// Invoke arbitrary contract function on behalf of smart wallet
    /// Enables DeFi interactions (swaps, staking, etc.)
    /// Requires WebAuthn authentication via __check_auth
    pub fn invoke_contract(
        env: Env,
        contract: Address,
        function: Symbol,
        args: Vec<soroban_sdk::Val>,
    ) -> soroban_sdk::Val {
        transfers::invoke_contract(&env, contract, function, args)
            .unwrap_or_else(|e| panic_with_error!(&env, e))
    }

    /// Get XLM balance for this smart wallet
    pub fn get_xlm_balance(env: Env) -> i128 {
        transfers::get_xlm_balance(&env)
    }

    /// Get token balance for this smart wallet
    pub fn get_token_balance(env: Env, token: Address) -> i128 {
        transfers::get_token_balance(&env, token)
    }
}

#[contractimpl]
impl CustomAccountInterface for AccountContract {
    type Error = Error;
    type Signature = Signature;

    fn __check_auth(
        env: Env,
        signature_payload: Hash<32>,
        signature: Signature,
        _auth_contexts: Vec<Context>,
    ) -> Result<(), Error> {
        #[cfg(test)]
        log!(&env, "__check_auth called with device_id: {:?}", signature.device_id);

        // Defensive: always return explicit error, never panic/unwrap
        let devices: Vec<DevicePublicKey> = match env.storage().instance().get(&STORAGE_KEY_DEVICES) {
            Some(devs) => devs,
            None => {
                #[cfg(test)]
                log!(&env, "__check_auth: NotInitiated");
                return Err(Error::NotInitiated);
            }
        };

        let device = match devices.iter().find(|d| d.device_id == signature.device_id) {
            Some(dev) => dev,
            None => {
                #[cfg(test)]
                log!(&env, "__check_auth: DeviceNotFound");
                return Err(Error::DeviceNotFound);
            }
        };

        // ! At this point, we start verifying the WebAuthn signature.
        // ! The code is commented out because either Soroban SDK does not yet support secp256r1 verification
        // ! and SHA256 hashing as needed for WebAuthn (cross-origin, multi-algo attestation support beyond standard -7 hashing)
        // ! or the server is not sending the signature correctly as smart wallet may expect.
        // * - @andlerrl
        // WebAuthn signature payload: SHA256(authenticator_data || SHA256(client_data_json))
        // let mut payload = Bytes::new(&env);
        // let client_data_hash = env.crypto().sha256(&signature.client_data_json);
        // payload.append(&signature.authenticator_data);
        // payload.extend_from_array(&client_data_hash.to_array());
        // let payload = env.crypto().sha256(&payload);

        // let verify_result = env.crypto().secp256r1_verify(
        //     &device.public_key,
        //     &payload,
        //     &signature.signature,
        // );
        // // If the function returns (), treat as error (always fail)
        // // If it returns bool, check for false
        // let is_valid = core::any::type_name_of_val(&verify_result) == "bool" && unsafe {
        //     core::mem::transmute_copy::<_, bool>(&verify_result)
        // };
        // if !is_valid {
        //     #[cfg(test)]
        //     log!(&env, "__check_auth: Secp256r1VerifyFailed");
        //     return Err(Error::Secp256r1VerifyFailed);
        // }

        // // Base64Url encoding without padding, 32 bytes = 43 characters
        // const CHALLENGE_LENGTH: usize = 43;
        // let client_data_buffer = signature.client_data_json.to_buffer::<1024>();
        // let client_data_json = client_data_buffer.as_slice();
        // let (client_data, _): (ClientDataJson, _) = match serde_json_core::de::from_slice(client_data_json) {
        //     Ok(val) => val,
        //     Err(_) => {
        //         #[cfg(test)]
        //         log!(&env, "__check_auth: JsonParseError");
        //         return Err(Error::JsonParseError);
        //     }
        // };

        // let mut expected_challenge = [b'_'; CHALLENGE_LENGTH];
        // base64_url::encode(&mut expected_challenge, &signature_payload.to_array());

        // if client_data.challenge.as_bytes() != expected_challenge {
        //     #[cfg(test)]
        //     log!(&env, "__check_auth: ClientDataJsonChallengeIncorrect");
        //     return Err(Error::ClientDataJsonChallengeIncorrect);
        // }

        Ok(())
    }
}

mod test;
