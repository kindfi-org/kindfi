#![no_std]

mod errors;
mod events;
mod reputation_client;
mod storage;
mod types;

use soroban_sdk::{contract, contractimpl, panic_with_error, Address, Env, Symbol};
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
use crate::events::{PublishEvent, StreakBrokenEvent, StreakUpdatedEvent};
use crate::reputation_client::ReputationClient;
use crate::storage::{
    get_reputation_contract, get_user_streak, is_initialized, set_initialized,
    set_reputation_contract, set_user_streak,
};
use crate::types::{StreakInfo, StreakPeriod};

// ============================================================================
// Constants
// ============================================================================

/// Number of ledgers in a day (assuming ~5 second block time)
const DAY_IN_LEDGERS: u32 = 17280;

/// TTL extension amount for instance storage (30 days)
const INSTANCE_TTL_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;

/// TTL threshold before extending (29 days)
const INSTANCE_TTL_THRESHOLD: u32 = INSTANCE_TTL_AMOUNT - DAY_IN_LEDGERS;

/// Number of ledgers in a week (7 days)
const WEEK_IN_LEDGERS: u32 = 7 * DAY_IN_LEDGERS;

/// Number of ledgers in a month (30 days)
const MONTH_IN_LEDGERS: u32 = 30 * DAY_IN_LEDGERS;

/// Role identifier for addresses that can record donations.
pub const RECORDER_ROLE: &str = "recorder";

// ============================================================================
// Contract
// ============================================================================

/// KindFi Streak Contract
///
/// Tracks donation streaks and awards bonus reputation points for consistent behavior.
/// Integrates with the Reputation contract to award streak bonuses.
///
/// Features:
/// - Weekly and monthly streak tracking
/// - Automatic streak maintenance detection
/// - Bonus points for maintaining streaks
/// - Longest streak tracking
#[contract]
pub struct Streak;

#[contractimpl]
impl Streak {
    /// Initialize the Streak contract.
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
    // Streak Tracking
    // ========================================================================

    /// Record a donation and update streak.
    ///
    /// Requires recorder role.
    ///
    /// # Arguments
    /// * `caller` - Address initiating the record (must have recorder role)
    /// * `user` - User address
    /// * `period` - Streak period type
    /// * `donation_timestamp` - Timestamp of the donation
    ///
    /// # Returns
    /// The user's new streak count
    #[only_role(caller, "recorder")]
    pub fn record_donation(
        e: &Env,
        caller: Address,
        user: Address,
        period: StreakPeriod,
        donation_timestamp: u64,
    ) -> u32 {
        let current_time = e.ledger().timestamp();
        let period_duration = match period {
            StreakPeriod::Weekly => WEEK_IN_LEDGERS as u64,
            StreakPeriod::Monthly => MONTH_IN_LEDGERS as u64,
        };

        // Get current streak or create new
        let mut streak = get_user_streak(e, &user, period).unwrap_or_else(|| StreakInfo {
            current_streak: 0,
            longest_streak: 0,
            last_donation_timestamp: 0,
            period,
        });

        let previous_streak = streak.current_streak;
        let mut bonus_points = 0u32;

        // Check if streak should continue or reset
        if streak.last_donation_timestamp == 0 {
            // First donation
            streak.current_streak = 1;
            streak.longest_streak = 1;
        } else {
            let time_since_last = current_time.saturating_sub(streak.last_donation_timestamp);

            if time_since_last <= period_duration {
                // Streak continues
                streak.current_streak += 1;
                
                // Update longest streak if needed
                if streak.current_streak > streak.longest_streak {
                    streak.longest_streak = streak.current_streak;
                }

                // Award bonus points for maintaining streak (25 points per streak donation)
                bonus_points = 25;
            } else {
                // Streak broken
                if previous_streak > 0 {
                    StreakBrokenEvent {
                        user: user.clone(),
                        period,
                        previous_streak,
                    }
                    .publish(e);
                }
                streak.current_streak = 1;
            }
        }

        streak.last_donation_timestamp = donation_timestamp;

        // Award bonus points if streak was maintained
        if bonus_points > 0 {
            Self::award_streak_bonus(e, &user, bonus_points);
        }

        set_user_streak(e, &user, &streak);

        StreakUpdatedEvent {
            user: user.clone(),
            period,
            current_streak: streak.current_streak,
            longest_streak: streak.longest_streak,
            bonus_points,
        }
        .publish(e);

        Self::extend_instance_ttl(e);
        streak.current_streak
    }

    /// Award streak bonus via reputation contract.
    fn award_streak_bonus(e: &Env, user: &Address, _bonus_points: u32) {
        let reputation_contract = match get_reputation_contract(e) {
            Some(addr) => addr,
            None => return, // No reputation contract, skip silently
        };

        let streak_contract = e.current_contract_address();
        let _ = ReputationClient::record_streak_donation(e, &reputation_contract, &streak_contract, user);
    }

    /// Get user's streak information.
    ///
    /// # Arguments
    /// * `user` - User address
    /// * `period` - Streak period type
    ///
    /// # Returns
    /// Streak info if found
    pub fn get_streak(e: &Env, user: Address, period: StreakPeriod) -> Option<StreakInfo> {
        get_user_streak(e, &user, period)
    }

    // ========================================================================
    // Admin Functions
    // ========================================================================

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
impl AccessControl for Streak {
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
        Streak::extend_instance_ttl(e);
    }

    fn revoke_role(e: &Env, account: Address, role: Symbol, caller: Address) {
        storage_revoke_role(e, &account, &role, &caller);
        Streak::extend_instance_ttl(e);
    }

    fn renounce_role(e: &Env, role: Symbol, caller: Address) {
        storage_renounce_role(e, &role, &caller);
        Streak::extend_instance_ttl(e);
    }

    fn transfer_admin_role(e: &Env, new_admin: Address, live_until_ledger: u32) {
        storage_transfer_admin_role(e, &new_admin, live_until_ledger);
        Streak::extend_instance_ttl(e);
    }

    fn accept_admin_transfer(e: &Env) {
        storage_accept_admin_transfer(e);
        Streak::extend_instance_ttl(e);
    }

    fn set_role_admin(e: &Env, role: Symbol, admin_role: Symbol) {
        storage_set_role_admin(e, &role, &admin_role);
        Streak::extend_instance_ttl(e);
    }

    fn renounce_admin(e: &Env) {
        storage_renounce_admin(e);
        Streak::extend_instance_ttl(e);
    }
}

#[cfg(test)]
mod test;
