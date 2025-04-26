#![no_std]
use soroban_sdk::{Address, Env, String, Vec, contract, contractimpl};

#[contract]
pub struct BadgeTracker;

#[contractimpl]
impl BadgeTracker {
    /// Returns an empty list of badges for a user.
    pub fn get_empty_badges(env: Env, user: Address) -> Vec<String> {
        user.require_auth(); // Ensure the user is authenticated
        Vec::new(&env)
    }

    /// Returns a predefined list of badges for a user.
    pub fn get_full_badges(env: Env, user: Address) -> Vec<String> {
        user.require_auth(); // Ensure the user is authenticated
        Vec::from_array(
            &env,
            [
                String::from_str(&env, "MathMaster"),
                String::from_str(&env, "ScienceStar"),
                String::from_str(&env, "HistoryBuff"),
            ],
        )
    }
}
