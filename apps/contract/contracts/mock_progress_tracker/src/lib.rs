use soroban_sdk::{Address, Env, contract, contractimpl};

#[contract]
pub struct ProgressTracker;

#[contractimpl]
impl ProgressTracker {
    /// Always returns true to indicate the user has completed all modules.
    pub fn is_completed(_env: Env, _user: Address) -> bool {
        true
    }
}
