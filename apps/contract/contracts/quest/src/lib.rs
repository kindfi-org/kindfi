#![no_std]

mod errors;
mod events;
mod reputation_client;
mod storage;
mod types;

use soroban_sdk::{contract, contractimpl, panic_with_error, Address, Env, Symbol, String, Vec};
use stellar_access::access_control::{
    accept_admin_transfer as storage_accept_admin_transfer, get_admin as storage_get_admin,
    get_role_admin as storage_get_role_admin, get_role_member as storage_get_role_member,
    get_role_member_count as storage_get_role_member_count, grant_role as storage_grant_role,
    has_role as storage_has_role, renounce_admin as storage_renounce_admin,
    renounce_role as storage_renounce_role, revoke_role as storage_revoke_role, set_admin,
    set_role_admin as storage_set_role_admin,
    transfer_admin_role as storage_transfer_admin_role, AccessControl,
};
use stellar_macros::only_role;

use crate::errors::Error;
use crate::events::{PublishEvent, QuestCompletedEvent, QuestCreatedEvent, QuestProgressUpdatedEvent};
use crate::reputation_client::ReputationClient;
use crate::storage::{
    add_user_completed_quest, get_and_increment_quest_id, get_quest_definition,
    get_quest_progress, get_reputation_contract, get_user_completed_quests, is_initialized,
    set_initialized, set_quest_definition, set_quest_progress, set_reputation_contract,
};
use crate::types::{QuestDefinition, QuestProgress, QuestType};

// ============================================================================
// Constants
// ============================================================================

/// Number of ledgers in a day (assuming ~5 second block time)
const DAY_IN_LEDGERS: u32 = 17280;

/// TTL extension amount for instance storage (30 days)
const INSTANCE_TTL_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;

/// TTL threshold before extending (29 days)
const INSTANCE_TTL_THRESHOLD: u32 = INSTANCE_TTL_AMOUNT - DAY_IN_LEDGERS;

/// Role identifier for addresses that can create quests.
pub const ADMIN_ROLE: &str = "admin";

/// Role identifier for addresses that can update quest progress.
pub const RECORDER_ROLE: &str = "recorder";

// ============================================================================
// Contract
// ============================================================================

/// KindFi Quest Contract
///
/// Manages goal-based participation quests and tracks user completion.
/// Integrates with the Reputation contract to award points upon completion.
///
/// Features:
/// - Multiple quest types (multi-region, weekly streak, multi-category, etc.)
/// - Progress tracking per user
/// - Automatic reward distribution via reputation contract
/// - Quest expiration support
#[contract]
pub struct Quest;

#[contractimpl]
impl Quest {
    /// Initialize the Quest contract.
    ///
    /// # Arguments
    /// * `admin` - Address that will have admin privileges
    /// * `reputation_contract` - Address of the reputation contract for rewards
    ///
    /// # Errors
    /// * `Error::AlreadyInitialized` - If the contract has already been initialized
    pub fn __constructor(e: &Env, admin: Address, reputation_contract: Address) {
        admin.require_auth();

        if is_initialized(e) {
            panic_with_error!(e, Error::AlreadyInitialized);
        }

        set_admin(e, &admin);
        set_reputation_contract(e, &reputation_contract);
        set_initialized(e);

        Self::extend_instance_ttl(e);
    }

    // ========================================================================
    // Quest Management
    // ========================================================================

    /// Create a new quest.
    ///
    /// Requires admin role.
    ///
    /// # Arguments
    /// * `caller` - Address initiating the creation (must have admin role)
    /// * `quest_type` - Type of quest
    /// * `name` - Quest name
    /// * `description` - Quest description
    /// * `target_value` - Target value to complete (e.g., number of regions, weeks)
    /// * `reward_points` - Points awarded upon completion
    /// * `expires_at` - Expiration timestamp (0 = no expiration)
    ///
    /// # Returns
    /// The quest ID
    #[only_role(caller, "admin")]
    pub fn create_quest(
        e: &Env,
        caller: Address,
        quest_type: QuestType,
        name: String,
        description: String,
        target_value: u32,
        reward_points: u32,
        expires_at: u64,
    ) -> u32 {
        if target_value == 0 {
            panic_with_error!(e, Error::InvalidQuestParams);
        }

        let quest_id = get_and_increment_quest_id(e);

        let quest = QuestDefinition {
            quest_id,
            quest_type,
            name: name.clone(),
            description,
            target_value,
            reward_points,
            expires_at,
            is_active: true,
        };

        set_quest_definition(e, &quest);

        QuestCreatedEvent {
            quest_id,
            quest_type,
            name,
            reward_points,
        }
        .publish(e);

        Self::extend_instance_ttl(e);
        quest_id
    }

    /// Get quest definition.
    ///
    /// # Arguments
    /// * `quest_id` - Quest ID to query
    ///
    /// # Returns
    /// Quest definition if found
    pub fn get_quest(e: &Env, quest_id: u32) -> Option<QuestDefinition> {
        get_quest_definition(e, quest_id)
    }

    /// Get user's progress on a quest.
    ///
    /// # Arguments
    /// * `user` - User address
    /// * `quest_id` - Quest ID
    ///
    /// # Returns
    /// Quest progress if found
    pub fn get_user_quest_progress(e: &Env, user: Address, quest_id: u32) -> Option<QuestProgress> {
        get_quest_progress(e, &user, quest_id)
    }

    /// Get user's completed quest IDs.
    ///
    /// # Arguments
    /// * `user` - User address
    ///
    /// # Returns
    /// Vector of completed quest IDs
    pub fn get_user_completed_quests(e: &Env, user: Address) -> Vec<u32> {
        get_user_completed_quests(e, &user)
    }

    // ========================================================================
    // Progress Tracking
    // ========================================================================

    /// Update user's quest progress.
    ///
    /// Requires recorder role.
    ///
    /// # Arguments
    /// * `caller` - Address initiating the update (must have recorder role)
    /// * `user` - User address
    /// * `quest_id` - Quest ID
    /// * `progress_value` - New progress value
    ///
    /// # Returns
    /// True if quest was completed, false otherwise
    #[only_role(caller, "recorder")]
    pub fn update_progress(
        e: &Env,
        caller: Address,
        user: Address,
        quest_id: u32,
        progress_value: u32,
    ) -> bool {
        let quest = match get_quest_definition(e, quest_id) {
            Some(q) => q,
            None => panic_with_error!(e, Error::QuestNotFound),
        };

        if !quest.is_active {
            panic_with_error!(e, Error::QuestNotActive);
        }

        // Check expiration
        if quest.expires_at > 0 && e.ledger().timestamp() > quest.expires_at {
            panic_with_error!(e, Error::QuestExpired);
        }

        // Get or create progress
        let mut progress = get_quest_progress(e, &user, quest_id).unwrap_or_else(|| QuestProgress {
            quest_id,
            current_value: 0,
            is_completed: false,
            completed_at: 0,
        });

        if progress.is_completed {
            return false; // Already completed
        }

        // Update progress
        progress.current_value = progress_value;

        // Check if completed
        if progress.current_value >= quest.target_value {
            progress.is_completed = true;
            progress.completed_at = e.ledger().timestamp();

            // Award reputation points
            Self::award_quest_reward(e, &user, &quest);

            // Add to completed quests
            add_user_completed_quest(e, &user, quest_id);

            QuestCompletedEvent {
                user: user.clone(),
                quest_id,
                quest_type: quest.quest_type,
                reward_points: quest.reward_points,
            }
            .publish(e);
        } else {
            QuestProgressUpdatedEvent {
                user: user.clone(),
                quest_id,
                current_value: progress.current_value,
                target_value: quest.target_value,
            }
            .publish(e);
        }

        set_quest_progress(e, &user, &progress);
        Self::extend_instance_ttl(e);

        progress.is_completed
    }

    /// Award quest completion reward via reputation contract.
    fn award_quest_reward(e: &Env, user: &Address, _quest: &QuestDefinition) {
        let reputation_contract = match get_reputation_contract(e) {
            Some(addr) => addr,
            None => return, // No reputation contract, skip silently
        };

        let quest_contract = e.current_contract_address();
        let _ = ReputationClient::record_quest_completion(e, &reputation_contract, &quest_contract, user);
    }

    // ========================================================================
    // Admin Functions
    // ========================================================================

    /// Set quest active status.
    ///
    /// Requires admin role.
    ///
    /// # Arguments
    /// * `caller` - Address initiating the update (must have admin role)
    /// * `quest_id` - Quest ID
    /// * `is_active` - New active status
    #[only_role(caller, "admin")]
    pub fn set_quest_active(e: &Env, caller: Address, quest_id: u32, is_active: bool) {
        let mut quest = match get_quest_definition(e, quest_id) {
            Some(q) => q,
            None => panic_with_error!(e, Error::QuestNotFound),
        };

        quest.is_active = is_active;
        set_quest_definition(e, &quest);

        Self::extend_instance_ttl(e);
    }

    /// Set reputation contract address.
    ///
    /// Requires admin role.
    ///
    /// # Arguments
    /// * `caller` - Admin address
    /// * `reputation_contract` - Reputation contract address
    #[only_role(caller, "admin")]
    pub fn set_reputation_contract_address(e: &Env, caller: Address, reputation_contract: Address) {
        set_reputation_contract(e, &reputation_contract);
        Self::extend_instance_ttl(e);
    }

    /// Extend the TTL of instance storage.
    fn extend_instance_ttl(e: &Env) {
        e.storage()
            .instance()
            .extend_ttl(INSTANCE_TTL_THRESHOLD, INSTANCE_TTL_AMOUNT);
    }
}

/// Implementation of the AccessControl trait.
#[contractimpl]
impl AccessControl for Quest {
    fn has_role(e: &Env, account: Address, role: Symbol) -> Option<u32> {
        storage_has_role(e, &account, &role)
    }

    fn get_role_member_count(e: &Env, role: Symbol) -> u32 {
        storage_get_role_member_count(e, &role)
    }

    fn get_role_member(e: &Env, role: Symbol, index: u32) -> Address {
        storage_get_role_member(e, &role, index)
    }

    fn get_role_admin(e: &Env, role: Symbol) -> Option<Symbol> {
        storage_get_role_admin(e, &role)
    }

    fn get_admin(e: &Env) -> Option<Address> {
        storage_get_admin(e)
    }

    fn grant_role(e: &Env, account: Address, role: Symbol, caller: Address) {
        storage_grant_role(e, &account, &role, &caller);
        Quest::extend_instance_ttl(e);
    }

    fn revoke_role(e: &Env, account: Address, role: Symbol, caller: Address) {
        storage_revoke_role(e, &account, &role, &caller);
        Quest::extend_instance_ttl(e);
    }

    fn renounce_role(e: &Env, role: Symbol, caller: Address) {
        storage_renounce_role(e, &role, &caller);
        Quest::extend_instance_ttl(e);
    }

    fn transfer_admin_role(e: &Env, new_admin: Address, live_until_ledger: u32) {
        storage_transfer_admin_role(e, &new_admin, live_until_ledger);
        Quest::extend_instance_ttl(e);
    }

    fn accept_admin_transfer(e: &Env) {
        storage_accept_admin_transfer(e);
        Quest::extend_instance_ttl(e);
    }

    fn set_role_admin(e: &Env, role: Symbol, admin_role: Symbol) {
        storage_set_role_admin(e, &role, &admin_role);
        Quest::extend_instance_ttl(e);
    }

    fn renounce_admin(e: &Env) {
        storage_renounce_admin(e);
        Quest::extend_instance_ttl(e);
    }
}

#[cfg(test)]
mod test;
