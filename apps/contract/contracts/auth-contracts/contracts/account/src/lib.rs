#![no_std]
use soroban_sdk::{
    auth::{Context, CustomAccountInterface},
    contract, contracterror, contractimpl, contracttype,
    crypto::Hash,
    symbol_short, Bytes, BytesN, Env, Symbol, Vec,
};

use crate::events::{
    DeviceAddedEventData, DeviceRemovedEventData, RecoveryAddressAddedData, RecoveryAddressUpdatedData, AccountRecoveredEventData, ACCOUNT, DEVICEADDED, DEVICEREMOVED, RECOVERY 
};

mod base64_url;

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
        let devices = Vec::new(&env).push(DevicePublicKey {
            device_id,
            public_key,
        });
        env.storage().instance().set(&STORAGE_KEY_DEVICES, &devices);
        env.storage().instance().set(&AUTH_CONTRACT, &auth_contract);
    }

    pub fn add_device(
        env: Env,
        device_id: BytesN<32>,
        public_key: BytesN<65>,
    ) -> Result<(), Error> {
        env.current_contract_address().require_auth();
        let mut devices: Vec<DevicePublicKey> = env
            .storage()
            .instance()
            .get(&STORAGE_KEY_DEVICES)
            .unwrap_or(Vec::new(&env));

        if devices.iter().any(|device| device.device_id == device_id) {
            return Err(Error::DeviceAlreadySet);
        }

        devices.push(DevicePublicKey {
            device_id,
            public_key,
        });
        
        env.storage().instance().set(&STORAGE_KEY_DEVICES, &devices);
        
        env.events().publish(
            (ACCOUNT, DEVICEADDED),
            DeviceAddedEventData {
                device_id,
                public_key
            }
        );
        Ok(())
    }

    pub fn remove_device(env: Env, device_id: BytesN<32>) -> Result<(), Error> {
        env.current_contract_address().require_auth();

        let mut devices: Vec<DevicePublicKey> = env
            .storage()
            .instance()
            .get(&STORAGE_KEY_DEVICES)
            .unwrap_or(Vec::new(&env));

        let new_devices: Vec<DevicePublicKey> = devices
            .into_iter()
            .filter(|device| device.device_id != device_id)
            .collect();

        if new_devices.len() == devices.len() {
            return Err(Error::DeviceNotFound);
        }

        env.storage()
            .instance()
            .set(&STORAGE_KEY_DEVICES, &new_devices);

        env.events().publish(
            (ACCOUNT, DEVICEREMOVED),
            DeviceRemovedEventData {
                device_id,
                public_key
            }
        );

        Ok(())
    }

    pub fn add_recovery_address(env: Env, address: Address) -> Result<(), Error> {
        env.current_contract_address().require_auth();

        if env.storage().instance().has(&RECOVERY_ADDRESS) {
            return Err(Error::RecoveryAddressSet);
        }

        env.storage().instance().set(&RECOVERY_ADDRESS, &address);

        env.events().publish(
            (ACCOUNT, SECURITY),
            RecoveryAddressAddedData {
                address,
            }
        );

        Ok(())
    }

    pub fn update_recovery_address(env: Env, address: Address) -> Result<(), Error> {
        env.current_contract_address().require_auth();
        
        // add multisig authentication from parent auth contract for recovery update
        let auth_contract = env
            .storage()
            .instance()
            .get::<Symbol, Address>(&AUTH_CONTRACT)
            .ok_or(Error::AuthContractNotSet)?;

        auth_contract.require_auth();

        env.storage().instance().set(&RECOVERY_ADDRESS, &address);

        env.events().publish(
            (ACCOUNT, SECURITY),
            RecoveryAddressUpdatedData {
                address,
            }
        );

        Ok(())
    }

    pub fn recover_account(
        env: Env,
        new_device_id: BytesN<32>,
        new_public_key: BytesN<65>,
    ) -> Result<(), Error> {
        // add multisig authentication from parent auth contract for recovery update
        let auth_contract = env
            .storage()
            .instance()
            .get::<Symbol, Address>(&AUTH_CONTRACT)
            .ok_or(Error::AuthContractNotSet)?;

        auth_contract.require_auth();

        let recovery_address = env
            .storage()
            .instance()
            .get::<Symbol, Address>(&RECOVERY_ADDRESS)
            .ok_or(Error::RecoveryAddressNotSet);

        recovery_address.require_auth();

        let devices = Vec::new(&env).push(DevicePublicKey {
            device_id: new_device_id,
            public_key: new_public_key,
        });

        env.storage().instance().set(&STORAGE_KEY_DEVICES, &devices);

        env.events().publish(
            (ACCOUNT, SECURITY),
            AccountRecoveredEventData {
                device_id: new_device_id,
                public_key: new_public_key
            }
        );

        Ok(())
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

        let mut valid = false;
        for device in devices.iter() {
            let mut payload = Bytes::new(&env);
            payload.append(&signature.authenticator_data);
            payload.extend_from_array(&env.crypto().sha256(&signature.client_data_json).to_array());
            let payload = env.crypto().sha256(&payload);

            if env
                .crypto()
                .secp256r1_verify(&device.public_key, &payload, &signature.signature)
                .is_ok()
            {
                valid = true;
                break;
            }
        }

        if !valid {
            return Err(Error::Secp256r1VerifyFailed);
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
