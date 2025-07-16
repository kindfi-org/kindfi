#![no_std]
use soroban_sdk::{Address, Env, contract, contractimpl};

#[contract]
pub struct ProgressTracker;

#[contractimpl]
impl ProgressTracker {
    /// Returns whether the user has completed all modules, based on stored status.
    pub fn is_completed(env: Env, user: Address) -> bool {
        env.storage()
            .temporary()
            .get::<Address, bool>(&user)
            .unwrap_or(true) // Default to true for unconfigured users
    }

    /// Sets the completion status for a user (for testing purposes).
    pub fn set_completion(env: Env, user: Address, completed: bool) {
        env.storage().temporary().set(&user, &completed);
    }
}
