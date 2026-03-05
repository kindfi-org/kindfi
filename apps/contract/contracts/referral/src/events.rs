use soroban_sdk::{contracttype, symbol_short, Address};

use crate::types::ReferralStatus;

/// Event emitted when a referral is created.
#[contracttype]
#[derive(Clone, Debug)]
pub struct ReferralCreatedEvent {
    pub referrer: Address,
    pub referred: Address,
}

/// Event emitted when a referral status is updated.
#[contracttype]
#[derive(Clone, Debug)]
pub struct ReferralStatusUpdatedEvent {
    pub referrer: Address,
    pub referred: Address,
    pub old_status: ReferralStatus,
    pub new_status: ReferralStatus,
    pub reward_points: u32,
}

/// Trait for publishing events.
pub trait PublishEvent {
    fn publish(&self, env: &soroban_sdk::Env);
}

impl PublishEvent for ReferralCreatedEvent {
    fn publish(&self, env: &soroban_sdk::Env) {
        env.events().publish(
            (symbol_short!("referral"), symbol_short!("created")),
            self.clone(),
        );
    }
}

impl PublishEvent for ReferralStatusUpdatedEvent {
    fn publish(&self, env: &soroban_sdk::Env) {
        env.events().publish(
            (symbol_short!("referral"), symbol_short!("status")),
            self.clone(),
        );
    }
}

