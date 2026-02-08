use soroban_sdk::{contracttype, symbol_short, Address};

use crate::types::StreakPeriod;

/// Event emitted when a streak is updated.
#[contracttype]
#[derive(Clone, Debug)]
pub struct StreakUpdatedEvent {
    pub user: Address,
    pub period: StreakPeriod,
    pub current_streak: u32,
    pub longest_streak: u32,
    pub bonus_points: u32,
}

/// Event emitted when a streak is broken.
#[contracttype]
#[derive(Clone, Debug)]
pub struct StreakBrokenEvent {
    pub user: Address,
    pub period: StreakPeriod,
    pub previous_streak: u32,
}

/// Trait for publishing events.
pub trait PublishEvent {
    fn publish(&self, env: &soroban_sdk::Env);
}

impl PublishEvent for StreakUpdatedEvent {
    fn publish(&self, env: &soroban_sdk::Env) {
        env.events().publish(
            (symbol_short!("streak"), symbol_short!("updated")),
            self.clone(),
        );
    }
}

impl PublishEvent for StreakBrokenEvent {
    fn publish(&self, env: &soroban_sdk::Env) {
        env.events().publish(
            (symbol_short!("streak"), symbol_short!("broken")),
            self.clone(),
        );
    }
}

