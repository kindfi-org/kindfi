#![no_std]
use soroban_sdk::{
    auth::{Context, CustomAccountInterface},
    contract, contracterror, contractimpl, contracttype,
    crypto::Hash,
    symbol_short, Address, Bytes, BytesN, Env, Symbol, Vec,
};
mod base64_url;
mod events;

use crate::events::{
    AccountRecoveredEventData, DeviceAddedEventData, DeviceRemovedEventData,
    RecoveryAddressAddedData, RecoveryAddressUpdatedData, ACCOUNT, ADDED, DEVICE, REMOVED,
    SECURITY,
};

#[contract]
pub struct Contract;

#[contracterror]
#[derive(Copy, Clone, Eq, PartialEq, Debug)]
pub enum Error {
    ClientDataJsonChallengeIncorrect = 1,
    Secp256r1VerifyFailed = 2,
    JsonParseError = 3,
    DeviceAlreadySet = 4,
    DeviceNotFound = 5,
    NotInitiated = 6,
    RecoveryAddressSet = 7,
    RecoveryAddressNotSet = 8,
    AuthContractNotSet = 9,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct Signature {
    pub authenticator_data: Bytes,
    pub client_data_json: Bytes,
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
impl Contract {
    pub fn constructor(
        env: Env,
        device_id: BytesN<32>,
        public_key: BytesN<65>,
        auth_contract: Address,
    ) {
        let devices = Vec::new(&env).push_back(DevicePublicKey {
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
            (&env).panic_with_error(Error::DeviceAlreadySet);
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
            (&env).panic_with_error(Error::DeviceNotFound);
        }

        env.storage().instance().set(&STORAGE_KEY_DEVICES, &devices);

        env.events()
            .publish((DEVICE, REMOVED), DeviceRemovedEventData { device_id });
    }

    pub fn add_recovery_address(env: Env, address: Address) {
        env.current_contract_address().require_auth();

        if env.storage().instance().has(&RECOVERY_ADDRESS) {
            (&env).panic_with_error(Error::RecoveryAddressSet);
        }

        env.storage().instance().set(&RECOVERY_ADDRESS, &address);

        env.events()
            .publish((ACCOUNT, SECURITY), RecoveryAddressAddedData { address });
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

        env.events()
            .publish((ACCOUNT, SECURITY), RecoveryAddressUpdatedData { address });
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

        let devices = Vec::new(&env).push_back(DevicePublicKey {
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
}

#[contractimpl]
impl CustomAccountInterface for Contract {
    type Error = Error;
    type Signature = Signature;

    fn __check_auth(
        env: Env,
        signature_payload: Hash<32>,
        signature: Signature,
        _auth_contexts: Vec<Context>,
    ) -> Result<(), Error> {
        let devices: Vec<DevicePublicKey> = env
            .storage()
            .instance()
            .get(&STORAGE_KEY_DEVICES)
            .ok_or(Error::NotInitiated)?;

        for device in devices.iter() {
            let mut payload = Bytes::new(&env);
            payload.append(&signature.authenticator_data);
            payload.extend_from_array(&env.crypto().sha256(&signature.client_data_json).to_array());
            let payload = env.crypto().sha256(&payload);

            env.crypto()
                .secp256r1_verify(&device.public_key, &payload, &signature.signature)
        }

        let client_data_json = signature.client_data_json.to_buffer::<1024>();
        let client_data_json = client_data_json.as_slice();
        let (client_data, _): (ClientDataJson, _) =
            serde_json_core::de::from_slice(client_data_json).map_err(|_| Error::JsonParseError)?;

        let mut expected_challenge = *b"___________________________________________";
        base64_url::encode(&mut expected_challenge, &signature_payload.to_array());

        if client_data.challenge.as_bytes() != expected_challenge {
            return Err(Error::ClientDataJsonChallengeIncorrect);
        }

        Ok(())
    }
}
