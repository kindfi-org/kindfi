
use soroban_sdk::{contract, contractimpl, Address, Env, String};

use crate::{
    types::TokenMetadata,
    storage::NFTStorage,
    errors::NFTError,
    events::NFTEvents,
};

#[contract]
pub struct NFTContract;

#[contractimpl]
impl NFTContract {
    pub fn initialize(env: Env, admin: Address) -> Result<(), NFTError> {
      if env.storage().has(&DataKey::Admin) {
        return Err(NFTError::AlreadyInitialized);
      }

      NFTStorage::set_admin(&env, &admin);
      Ok(())
    }

    pub fn mint(
        env: Env,
        to: Address,
        token_id: u32,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<(), NFTError> {
      // Check if the sender is the admin
    }

    pub fn transfer(
        env: Env,
        from: Address,
        to: Address,
        token_id: u32,
    ) -> Result<(), NFTError> {
      // Check if the sender is the owner of the token
    }

    pub fn owner_of(env: Env, token_id: u32) -> Result<Address, NFTError> {
      // Check if the token exists
    }

    pub fn balance_of(env: Env, owner: Address) -> u32 {
      // Get the balance of the owner
    }

    pub fn token_metadata(env: Env, token_id: u32) -> Result<TokenMetadata, NFTError> {
      // Get the metadata of the token
    }
}
