use soroban_sdk::{Env, String, Vec, contract, contractimpl};

#[contract]
pub struct BadgeTracker;

#[contractimpl]
impl BadgeTracker {
    /// Returns an empty list of badges.
    pub fn get_empty_badges(env: Env) -> Vec<String> {
        Vec::new(&env)
    }

    /// Returns a predefined list of badges.
    pub fn get_full_badges(env: Env) -> Vec<String> {
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
