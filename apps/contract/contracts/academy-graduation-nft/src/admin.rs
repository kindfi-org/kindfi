use soroban_sdk::{Address, Env, symbol_short};
use crate::datatype::{DataKeys, NFTError};

pub fn check_admin(env: &Env) -> Result<(), NFTError> {
    let admin: Address = env.storage().persistent().get(&DataKeys::Admin).ok_or(NFTError::NoAdmin)?;
    admin.require_auth();
    Ok(())
}

pub fn initialize_admin(env: &Env, admin: Address) -> Result<(), NFTError> {
    if env.storage().persistent().has(&DataKeys::Admin) {
        return Err(NFTError::AlreadyInitialized);
    }
    env.storage().persistent().set(&DataKeys::Admin, &admin);
    env.events().publish((symbol_short!("ADMIN"), "init"), admin);
    Ok(())
}

pub fn set_admin(env: &Env, new_admin: Address) -> Result<(), NFTError> {
    check_admin(env)?;
    let this_contract = env.current_contract_address();
    if new_admin == this_contract {
        return Err(NFTError::InvalidAdmin);
    }
    env.storage().persistent().set(&DataKeys::Admin, &new_admin);
    env.events().publish((symbol_short!("ADMIN"), "update"), new_admin);
    Ok(())
}

pub fn set_paused(env: &Env, paused: bool) -> Result<(), NFTError> {
    check_admin(env)?;
    env.storage().persistent().set(&DataKeys::Paused, &paused);
    env.events().publish((symbol_short!("PAUSED"),), paused);
    Ok(())
}

pub fn is_paused(env: &Env) -> bool {
    env.storage().persistent().get(&DataKeys::Paused).unwrap_or(false)
} 