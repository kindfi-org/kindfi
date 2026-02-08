use soroban_sdk::{contracttype, symbol_short, Address, String};

use crate::types::QuestType;

/// Event emitted when a quest is created.
#[contracttype]
#[derive(Clone, Debug)]
pub struct QuestCreatedEvent {
    pub quest_id: u32,
    pub quest_type: QuestType,
    pub name: String,
    pub reward_points: u32,
}

/// Event emitted when a user completes a quest.
#[contracttype]
#[derive(Clone, Debug)]
pub struct QuestCompletedEvent {
    pub user: Address,
    pub quest_id: u32,
    pub quest_type: QuestType,
    pub reward_points: u32,
}

/// Event emitted when quest progress is updated.
#[contracttype]
#[derive(Clone, Debug)]
pub struct QuestProgressUpdatedEvent {
    pub user: Address,
    pub quest_id: u32,
    pub current_value: u32,
    pub target_value: u32,
}

/// Trait for publishing events.
pub trait PublishEvent {
    fn publish(&self, env: &soroban_sdk::Env);
}

impl PublishEvent for QuestCreatedEvent {
    fn publish(&self, env: &soroban_sdk::Env) {
        env.events().publish(
            (symbol_short!("quest"), symbol_short!("created")),
            self.clone(),
        );
    }
}

impl PublishEvent for QuestCompletedEvent {
    fn publish(&self, env: &soroban_sdk::Env) {
        env.events().publish(
            (symbol_short!("quest"), symbol_short!("completed")),
            self.clone(),
        );
    }
}

impl PublishEvent for QuestProgressUpdatedEvent {
    fn publish(&self, env: &soroban_sdk::Env) {
        env.events().publish(
            (symbol_short!("quest"), symbol_short!("progress")),
            self.clone(),
        );
    }
}
