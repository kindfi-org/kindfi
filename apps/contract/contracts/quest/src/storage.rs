use soroban_sdk::{Address, Env, Vec};

use crate::types::{QuestDefinition, QuestProgress, StorageKey};

/// Check if contract is initialized.
pub fn is_initialized(e: &Env) -> bool {
    e.storage()
        .instance()
        .has(&StorageKey::Initialized)
}

/// Set initialized flag.
pub fn set_initialized(e: &Env) {
    e.storage().instance().set(&StorageKey::Initialized, &true);
}

/// Get admin address.
pub fn get_admin(e: &Env) -> Option<Address> {
    e.storage().instance().get(&StorageKey::Admin)
}

/// Set admin address.
pub fn set_admin(e: &Env, admin: &Address) {
    e.storage().instance().set(&StorageKey::Admin, admin);
}

/// Get reputation contract address.
pub fn get_reputation_contract(e: &Env) -> Option<Address> {
    e.storage().instance().get(&StorageKey::ReputationContract)
}

/// Set reputation contract address.
pub fn set_reputation_contract(e: &Env, contract: &Address) {
    e.storage()
        .instance()
        .set(&StorageKey::ReputationContract, contract);
}

/// Get quest definition.
pub fn get_quest_definition(e: &Env, quest_id: u32) -> Option<QuestDefinition> {
    e.storage()
        .instance()
        .get(&StorageKey::QuestDefinition(quest_id))
}

/// Set quest definition.
pub fn set_quest_definition(e: &Env, quest: &QuestDefinition) {
    e.storage()
        .instance()
        .set(&StorageKey::QuestDefinition(quest.quest_id), quest);
}

/// Get user's quest progress.
pub fn get_quest_progress(e: &Env, user: &Address, quest_id: u32) -> Option<QuestProgress> {
    e.storage()
        .persistent()
        .get(&StorageKey::UserQuestProgress(user.clone(), quest_id))
}

/// Set user's quest progress.
pub fn set_quest_progress(e: &Env, user: &Address, progress: &QuestProgress) {
    e.storage()
        .persistent()
        .set(&StorageKey::UserQuestProgress(user.clone(), progress.quest_id), progress);
    
    // Extend TTL for persistent storage (30 days)
    e.storage()
        .persistent()
        .extend_ttl(&StorageKey::UserQuestProgress(user.clone(), progress.quest_id), 518400, 518400);
}

/// Get user's completed quest IDs.
pub fn get_user_completed_quests(e: &Env, user: &Address) -> Vec<u32> {
    e.storage()
        .persistent()
        .get(&StorageKey::UserCompletedQuests(user.clone()))
        .unwrap_or_else(|| Vec::new(e))
}

/// Add quest ID to user's completed quests.
pub fn add_user_completed_quest(e: &Env, user: &Address, quest_id: u32) {
    let mut completed = get_user_completed_quests(e, user);
    completed.push_back(quest_id);
    e.storage()
        .persistent()
        .set(&StorageKey::UserCompletedQuests(user.clone()), &completed);
    
    // Extend TTL
    e.storage()
        .persistent()
        .extend_ttl(&StorageKey::UserCompletedQuests(user.clone()), 518400, 518400);
}

/// Get next quest ID and increment.
pub fn get_and_increment_quest_id(e: &Env) -> u32 {
    let current: u32 = e.storage()
        .instance()
        .get(&StorageKey::NextQuestId)
        .unwrap_or(0);
    let next = current + 1;
    e.storage().instance().set(&StorageKey::NextQuestId, &next);
    next
}
