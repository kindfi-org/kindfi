use soroban_sdk::{symbol_short, Symbol};

pub struct NFTEvents;

impl NFTEvents {
  pub fn mint(env: &Env, to: &Address, token_id: u32) {
    // Publish the MINT event
  }

  pub fn transfer(env: &Env, from: &Address, to: &Address, token_id: u32) {
    // Publish the TRANSFER event
  }
}
