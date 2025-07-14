#![no_std]
use soroban_sdk::{Address, Env, String, Vec, contract, contractimpl};

#[contract]
pub struct BadgeTracker;

#[contractimpl]
impl BadgeTracker {
    /// Returns an empty list of badges for a user.
    pub fn get_empty_badges(_env: Env, _user: Address) -> Vec<String> {
        Vec::new(&_env)
    }

    /// Returns the user's badges from storage, or an empty list if unset.
    pub fn get_full_badges(env: Env, user: Address) -> Vec<String> {
        env.storage()
            .temporary()
            .get::<Address, Vec<String>>(&user)
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Sets the user's badges (for testing or badge assignment).
    pub fn set_badges(env: Env, user: Address, badges: Vec<String>) {
        env.storage().temporary().set(&user, &badges);
    }
}
