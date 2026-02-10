#![no_std]

mod errors;
mod events;
mod reputation_client;
mod storage;
mod types;

use soroban_sdk::{contract, contractimpl, panic_with_error, Address, Env, Symbol, Vec};
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
use crate::events::{PublishEvent, ReferralCreatedEvent, ReferralStatusUpdatedEvent};
use crate::reputation_client::ReputationClient;
use crate::storage::{
    add_referrer_referral, get_referral_record, get_referrer_referrals, get_referrer_stats,
    get_reputation_contract, is_initialized, set_initialized, set_referral_record,
    set_referrer_stats, set_reputation_contract,
};
use crate::types::{ReferralRecord, ReferralStatus, ReferrerStats};

// ============================================================================
// Constants
// ============================================================================

/// Number of ledgers in a day (assuming ~5 second block time)
const DAY_IN_LEDGERS: u32 = 17280;

/// TTL extension amount for instance storage (30 days)
const INSTANCE_TTL_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;

/// TTL threshold before extending (29 days)
const INSTANCE_TTL_THRESHOLD: u32 = INSTANCE_TTL_AMOUNT - DAY_IN_LEDGERS;

/// Points awarded for onboarding (50 points)
const ONBOARDING_REWARD_POINTS: u32 = 50;

/// Points awarded for first donation (25 points)
const FIRST_DONATION_REWARD_POINTS: u32 = 25;

/// Role identifier for addresses that can record referral events.
pub const RECORDER_ROLE: &str = "recorder";

// ============================================================================
// Contract
// ============================================================================

/// KindFi Referral Contract
///
/// Tracks referred users and issues reward points to referrers based on
/// verified onboarding and donation activity of referred users.
/// Integrates with the Reputation contract to award referral bonuses.
///
/// Features:
/// - Referral code creation and tracking
/// - Onboarding verification
/// - Donation activity tracking
/// - Automatic reward distribution
#[contract]
pub struct Referral;

#[contractimpl]
impl Referral {
    /// Initialize the Referral contract.
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
    // Referral Management
    // ========================================================================

    /// Create a referral relationship.
    ///
    /// Requires recorder role.
    ///
    /// # Arguments
    /// * `caller` - Address initiating the creation (must have recorder role)
    /// * `referrer` - Address of the referrer
    /// * `referred` - Address of the referred user
    ///
    /// # Errors
    /// * `Error::SelfReferral` - If user tries to refer themselves
    /// * `Error::ReferralAlreadyExists` - If referral already exists
    #[only_role(caller, "recorder")]
    pub fn create_referral(
        e: &Env,
        caller: Address,
        referrer: Address,
        referred: Address,
    ) {
        if referrer == referred {
            panic_with_error!(e, Error::SelfReferral);
        }

        // Check if referral already exists
        if get_referral_record(e, &referred).is_some() {
            panic_with_error!(e, Error::ReferralAlreadyExists);
        }

        let current_time = e.ledger().timestamp();

        let record = ReferralRecord {
            referrer: referrer.clone(),
            referred: referred.clone(),
            status: ReferralStatus::Pending,
            created_at: current_time,
            onboarded_at: 0,
            first_donation_at: 0,
            total_donations: 0,
        };

        set_referral_record(e, &record);
        add_referrer_referral(e, &referrer, &referred);

        // Update referrer stats
        let mut stats = get_referrer_stats(e, &referrer).unwrap_or_else(|| ReferrerStats {
            total_referrals: 0,
            active_referrals: 0,
            total_reward_points: 0,
        });
        stats.total_referrals += 1;
        set_referrer_stats(e, &referrer, &stats);

        ReferralCreatedEvent {
            referrer: referrer.clone(),
            referred: referred.clone(),
        }
        .publish(e);

        Self::extend_instance_ttl(e);
    }

    /// Mark referred user as onboarded.
    ///
    /// Requires recorder role.
    ///
    /// # Arguments
    /// * `caller` - Address initiating the update (must have recorder role)
    /// * `referred` - Address of the referred user
    ///
    /// # Returns
    /// Reward points awarded to referrer
    #[only_role(caller, "recorder")]
    pub fn mark_onboarded(e: &Env, caller: Address, referred: Address) -> u32 {
        let mut record = match get_referral_record(e, &referred) {
            Some(r) => r,
            None => panic_with_error!(e, Error::ReferralNotFound),
        };

        if record.status != ReferralStatus::Pending {
            return 0; // Already processed
        }

        let current_time = e.ledger().timestamp();
        let old_status = record.status;
        record.status = ReferralStatus::Onboarded;
        record.onboarded_at = current_time;

        set_referral_record(e, &record);

        // Award reward points to referrer
        let reward_points = ONBOARDING_REWARD_POINTS;
        Self::award_referral_reward(e, &record.referrer, reward_points);

        // Update referrer stats
        let mut stats = get_referrer_stats(e, &record.referrer).unwrap_or_else(|| ReferrerStats {
            total_referrals: 0,
            active_referrals: 0,
            total_reward_points: 0,
        });
        stats.total_reward_points += reward_points;
        set_referrer_stats(e, &record.referrer, &stats);

        ReferralStatusUpdatedEvent {
            referrer: record.referrer.clone(),
            referred: record.referred.clone(),
            old_status,
            new_status: record.status,
            reward_points,
        }
        .publish(e);

        Self::extend_instance_ttl(e);
        reward_points
    }

    /// Record a donation by a referred user.
    ///
    /// Requires recorder role.
    ///
    /// # Arguments
    /// * `caller` - Address initiating the record (must have recorder role)
    /// * `referred` - Address of the referred user
    ///
    /// # Returns
    /// Reward points awarded to referrer (if first donation)
    #[only_role(caller, "recorder")]
    pub fn record_donation(e: &Env, caller: Address, referred: Address) -> u32 {
        let mut record = match get_referral_record(e, &referred) {
            Some(r) => r,
            None => return 0, // Not a referred user, skip silently
        };

        let current_time = e.ledger().timestamp();
        let old_status = record.status;
        record.total_donations += 1;

        let mut reward_points = 0u32;

        // Check if this is the first donation
        if record.first_donation_at == 0 {
            record.first_donation_at = current_time;
            record.status = ReferralStatus::FirstDonation;
            reward_points = FIRST_DONATION_REWARD_POINTS;
        } else if record.total_donations >= 3 {
            // Mark as active after 3+ donations
            record.status = ReferralStatus::Active;
        }

        set_referral_record(e, &record);

        // Award reward points for first donation
        if reward_points > 0 {
            Self::award_referral_reward(e, &record.referrer, reward_points);

            // Update referrer stats
            let mut stats = get_referrer_stats(e, &record.referrer).unwrap_or_else(|| ReferrerStats {
                total_referrals: 0,
                active_referrals: 0,
                total_reward_points: 0,
            });
            stats.total_reward_points += reward_points;
            if record.status == ReferralStatus::Active {
                stats.active_referrals += 1;
            }
            set_referrer_stats(e, &record.referrer, &stats);

            ReferralStatusUpdatedEvent {
                referrer: record.referrer.clone(),
                referred: record.referred.clone(),
                old_status,
                new_status: record.status,
                reward_points,
            }
            .publish(e);
        }

        Self::extend_instance_ttl(e);
        reward_points
    }

    /// Award referral reward via reputation contract.
    fn award_referral_reward(e: &Env, referrer: &Address, _reward_points: u32) {
        let reputation_contract = match get_reputation_contract(e) {
            Some(addr) => addr,
            None => return, // No reputation contract, skip silently
        };

        let referral_contract = e.current_contract_address();
        let _ = ReputationClient::record_successful_referral(e, &reputation_contract, &referral_contract, referrer);
    }

    /// Get referral record for a user.
    ///
    /// # Arguments
    /// * `referred` - Address of the referred user
    ///
    /// # Returns
    /// Referral record if found
    pub fn get_referral(e: &Env, referred: Address) -> Option<ReferralRecord> {
        get_referral_record(e, &referred)
    }

    /// Get referrer statistics.
    ///
    /// # Arguments
    /// * `referrer` - Address of the referrer
    ///
    /// # Returns
    /// Referrer statistics if found
    pub fn get_referrer_statistics(e: &Env, referrer: Address) -> Option<ReferrerStats> {
        get_referrer_stats(e, &referrer)
    }

    /// Get list of users referred by a referrer.
    ///
    /// # Arguments
    /// * `referrer` - Address of the referrer
    ///
    /// # Returns
    /// Vector of referred user addresses
    pub fn get_referrals(e: &Env, referrer: Address) -> Vec<Address> {
        get_referrer_referrals(e, &referrer)
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
impl AccessControl for Referral {
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
        Referral::extend_instance_ttl(e);
    }

    fn revoke_role(e: &Env, account: Address, role: Symbol, caller: Address) {
        storage_revoke_role(e, &account, &role, &caller);
        Referral::extend_instance_ttl(e);
    }

    fn renounce_role(e: &Env, role: Symbol, caller: Address) {
        storage_renounce_role(e, &role, &caller);
        Referral::extend_instance_ttl(e);
    }

    fn transfer_admin_role(e: &Env, new_admin: Address, live_until_ledger: u32) {
        storage_transfer_admin_role(e, &new_admin, live_until_ledger);
        Referral::extend_instance_ttl(e);
    }

    fn accept_admin_transfer(e: &Env) {
        storage_accept_admin_transfer(e);
        Referral::extend_instance_ttl(e);
    }

    fn set_role_admin(e: &Env, role: Symbol, admin_role: Symbol) {
        storage_set_role_admin(e, &role, &admin_role);
        Referral::extend_instance_ttl(e);
    }

    fn renounce_admin(e: &Env) {
        storage_renounce_admin(e);
        Referral::extend_instance_ttl(e);
    }
}

#[cfg(test)]
mod test;
