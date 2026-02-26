#![no_std]

mod errors;
mod events;
mod nft_client;
mod storage;
mod types;

use soroban_sdk::{contract, contractimpl, panic_with_error, Address, Env, Map, Symbol};
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
use crate::events::{
    LevelUpEventData, NFTContractSetEventData, NFTUpgradedEventData, PointValuesUpdatedData,
    ReputationEventData, ThresholdsUpdatedData, UserNFTRegisteredData,
};
use crate::storage::{
    add_user_event, get_event_point_value, get_level_threshold, get_nft_contract,
    get_permission_threshold, get_points, get_user_events, get_user_level, get_user_nft_token_id,
    is_initialized, set_event_point_value, set_initialized, set_level_threshold, set_nft_contract,
    set_permission_threshold, set_points, set_user_level, set_user_nft_token_id,
};
use crate::types::{EventType, Level, ReputationEventRecord, ThresholdType};

// ============================================================================
// Constants
// ============================================================================

/// Number of ledgers in a day (assuming ~5 second block time)
const DAY_IN_LEDGERS: u32 = 17280;

/// TTL extension amount for instance storage (30 days)
const INSTANCE_TTL_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;

/// TTL threshold before extending (29 days)
const INSTANCE_TTL_THRESHOLD: u32 = INSTANCE_TTL_AMOUNT - DAY_IN_LEDGERS;

/// Role identifier for addresses that can record reputation events.
pub const RECORDER_ROLE: &str = "recorder";

/// Role identifier for addresses that can update configuration.
pub const CONFIG_ROLE: &str = "config";

// ============================================================================
// Contract
// ============================================================================

/// KindFi Reputation Contract
///
/// Tracks user reputation points, calculates levels, and integrates with NFT contracts
/// for automatic upgrades. Built on OpenZeppelin Stellar Contracts.
///
/// Features:
/// - Multiple event types with configurable point values
/// - Five-tier level system (Rookie, Bronze, Silver, Gold, Diamond)
/// - Permission thresholds for platform features
/// - NFT integration for automatic metadata updates
/// - Role-based access control (recorder, config)
#[contract]
pub struct Reputation;

#[contractimpl]
impl Reputation {
    /// Initialize the Reputation contract.
    ///
    /// # Arguments
    /// * `admin` - Address that will have admin privileges and can grant roles
    /// * `nft_contract` - Optional NFT contract address for integration
    ///
    /// # Errors
    /// * `Error::AlreadyInitialized` - If the contract has already been initialized
    pub fn __constructor(e: &Env, admin: Address, nft_contract: Option<Address>) {
        admin.require_auth();

        if is_initialized(e) {
            panic_with_error!(e, Error::AlreadyInitialized);
        }

        // Set the admin for access control
        set_admin(e, &admin);
        set_initialized(e);

        // Set NFT contract if provided
        if let Some(nft_addr) = nft_contract {
            set_nft_contract(e, &nft_addr);
        }

        Self::extend_instance_ttl(e);
    }

    // ========================================================================
    // Core Functions
    // ========================================================================

    /// Record a reputation event for a user.
    ///
    /// Requires the "recorder" role.
    ///
    /// # Arguments
    /// * `caller` - Address initiating the record (must have recorder role)
    /// * `user` - Address receiving the reputation points
    /// * `event_type` - Type of event being recorded
    ///
    /// # Returns
    /// The user's new total points
    #[only_role(caller, "recorder")]
    pub fn record_event(e: &Env, caller: Address, user: Address, event_type: EventType) -> u32 {
        let points = get_event_point_value(e, event_type);
        Self::record_event_internal(e, &user, event_type, points)
    }

    /// Record a reputation event with custom points.
    ///
    /// Requires the "recorder" role.
    ///
    /// # Arguments
    /// * `caller` - Address initiating the record (must have recorder role)
    /// * `user` - Address receiving the reputation points
    /// * `event_type` - Type of event being recorded
    /// * `points` - Custom points to award
    ///
    /// # Returns
    /// The user's new total points
    ///
    /// # Errors
    /// * `Error::InvalidPoints` - If points is 0
    /// * `Error::PointsOverflow` - If adding points would overflow
    #[only_role(caller, "recorder")]
    pub fn record_event_with_points(
        e: &Env,
        caller: Address,
        user: Address,
        event_type: EventType,
        points: u32,
    ) -> u32 {
        if points == 0 {
            panic_with_error!(e, Error::InvalidPoints);
        }
        Self::record_event_internal(e, &user, event_type, points)
    }

    /// Internal function to record an event.
    fn record_event_internal(
        e: &Env,
        user: &Address,
        event_type: EventType,
        points: u32,
    ) -> u32 {
        // Get current points and check overflow
        let current_points = get_points(e, user);
        let new_total = current_points.checked_add(points);

        let new_total = match new_total {
            Some(total) => total,
            None => panic_with_error!(e, Error::PointsOverflow),
        };

        // Update points
        set_points(e, user, new_total);

        // Record event in history
        let event_record = ReputationEventRecord {
            event_type,
            points,
            timestamp: e.ledger().timestamp(),
        };
        add_user_event(e, user, event_record);

        // Emit reputation event
        ReputationEventData {
            user: user.clone(),
            event_type,
            points,
            new_total_points: new_total,
        }
        .publish(e);

        // Check for level up
        let old_level = get_user_level(e, user);
        let new_level = Self::calculate_level_internal(e, new_total);

        if new_level > old_level {
            set_user_level(e, user, new_level);

            // Emit level up event
            LevelUpEventData {
                user: user.clone(),
                old_level,
                new_level,
                total_points: new_total,
            }
            .publish(e);

            // Try to upgrade NFT with new level and points
            Self::try_upgrade_nft_internal(e, user, new_level, new_total);
        } else {
            // Even if level didn't change, update NFT points if user has an NFT
            // This ensures points attribute stays current
            if let Some(nft_contract) = get_nft_contract(e) {
                if let Some(token_id) = get_user_nft_token_id(e, user) {
                    let reputation_contract = e.current_contract_address();
                    
                    // Update NFT points even if level didn't change
                    let _ = nft_client::try_upgrade_nft(
                        e,
                        &nft_contract,
                        &reputation_contract,
                        token_id,
                        old_level, // Keep same level
                        new_total, // Update points
                    );
                }
            }
        }

        Self::extend_instance_ttl(e);
        new_total
    }

    // ========================================================================
    // Query Functions
    // ========================================================================

    /// Get a user's current level.
    ///
    /// # Arguments
    /// * `user` - Address to query
    ///
    /// # Returns
    /// The user's level as u32 (0=Rookie, 1=Bronze, 2=Silver, 3=Gold, 4=Diamond)
    pub fn get_level(e: &Env, user: Address) -> u32 {
        get_user_level(e, &user).as_u32()
    }

    /// Get a user's total points.
    ///
    /// # Arguments
    /// * `user` - Address to query
    ///
    /// # Returns
    /// The user's total points
    pub fn get_points(e: &Env, user: Address) -> u32 {
        get_points(e, &user)
    }

    /// Calculate what level a given point total would achieve.
    ///
    /// # Arguments
    /// * `points` - Point total to evaluate
    ///
    /// # Returns
    /// The level as u32
    pub fn calculate_level(e: &Env, points: u32) -> u32 {
        Self::calculate_level_internal(e, points).as_u32()
    }

    /// Internal function to calculate level from points
    fn calculate_level_internal(e: &Env, points: u32) -> Level {
        let diamond_threshold = get_level_threshold(e, Level::Diamond);
        let gold_threshold = get_level_threshold(e, Level::Gold);
        let silver_threshold = get_level_threshold(e, Level::Silver);
        let bronze_threshold = get_level_threshold(e, Level::Bronze);

        if points >= diamond_threshold {
            Level::Diamond
        } else if points >= gold_threshold {
            Level::Gold
        } else if points >= silver_threshold {
            Level::Silver
        } else if points >= bronze_threshold {
            Level::Bronze
        } else {
            Level::Rookie
        }
    }

    /// Check if a user meets a permission threshold.
    ///
    /// # Arguments
    /// * `user` - Address to check
    /// * `threshold_type` - Type of threshold to check against
    ///
    /// # Returns
    /// True if user's level meets or exceeds the threshold
    pub fn meets_threshold(e: &Env, user: Address, threshold_type: ThresholdType) -> bool {
        let user_level = get_user_level(e, &user);
        let required_level = get_permission_threshold(e, threshold_type);
        user_level >= required_level
    }

    /// Get the point threshold for a specific level.
    ///
    /// # Arguments
    /// * `level` - Level to query (0-4)
    ///
    /// # Returns
    /// Points required for that level
    pub fn get_level_threshold(e: &Env, level: u32) -> u32 {
        let level_enum = Level::from_u32(level).unwrap_or(Level::Rookie);
        get_level_threshold(e, level_enum)
    }

    /// Get the point value for a specific event type.
    ///
    /// # Arguments
    /// * `event_type` - Event type to query
    ///
    /// # Returns
    /// Points awarded for that event type
    pub fn get_event_point_value(e: &Env, event_type: EventType) -> u32 {
        get_event_point_value(e, event_type)
    }

    /// Get a user's event history.
    ///
    /// # Arguments
    /// * `user` - Address to query
    ///
    /// # Returns
    /// Vector of ReputationEventRecord
    pub fn get_user_events(
        e: &Env,
        user: Address,
    ) -> soroban_sdk::Vec<ReputationEventRecord> {
        get_user_events(e, &user)
    }

    /// Get the NFT token ID registered for a user.
    ///
    /// # Arguments
    /// * `user` - Address to query
    ///
    /// # Returns
    /// Option containing the token ID if registered
    pub fn get_user_nft_token_id(e: &Env, user: Address) -> Option<u32> {
        get_user_nft_token_id(e, &user)
    }

    // ========================================================================
    // Admin Functions
    // ========================================================================

    /// Set level thresholds.
    ///
    /// Requires the "config" role.
    ///
    /// # Arguments
    /// * `caller` - Address initiating the update (must have config role)
    /// * `thresholds` - Map of level (u32) to point threshold
    #[only_role(caller, "config")]
    pub fn set_level_thresholds(e: &Env, caller: Address, thresholds: Map<u32, u32>) {
        for (level_u32, threshold) in thresholds.iter() {
            if let Some(level) = Level::from_u32(level_u32) {
                set_level_threshold(e, level, threshold);
            }
        }

        ThresholdsUpdatedData {
            admin: caller.clone(),
            timestamp: e.ledger().timestamp(),
        }
        .publish(e);

        Self::extend_instance_ttl(e);
    }

    /// Set event point values.
    ///
    /// Requires the "config" role.
    ///
    /// # Arguments
    /// * `caller` - Address initiating the update (must have config role)
    /// * `event_points` - Map of EventType to point value
    #[only_role(caller, "config")]
    pub fn set_event_point_values(
        e: &Env,
        caller: Address,
        event_points: Map<EventType, u32>,
    ) {
        for (event_type, points) in event_points.iter() {
            set_event_point_value(e, event_type, points);
        }

        PointValuesUpdatedData {
            admin: caller.clone(),
            timestamp: e.ledger().timestamp(),
        }
        .publish(e);

        Self::extend_instance_ttl(e);
    }

    /// Set a permission threshold.
    ///
    /// Requires the "config" role.
    ///
    /// # Arguments
    /// * `caller` - Address initiating the update (must have config role)
    /// * `threshold_type` - Type of threshold to set
    /// * `level` - Required level (0-4)
    #[only_role(caller, "config")]
    pub fn set_permission_threshold(
        e: &Env,
        caller: Address,
        threshold_type: ThresholdType,
        level: u32,
    ) {
        let level_enum = Level::from_u32(level).unwrap_or(Level::Rookie);
        set_permission_threshold(e, threshold_type, level_enum);
        Self::extend_instance_ttl(e);
    }

    /// Set the NFT contract address for integration.
    ///
    /// Only admin can call this function.
    ///
    /// # Arguments
    /// * `caller` - Admin address
    /// * `nft_address` - NFT contract address
    pub fn set_nft_contract(e: &Env, caller: Address, nft_address: Address) {
        let admin = storage_get_admin(e);
        if admin.is_none() || admin.unwrap() != caller {
            panic_with_error!(e, Error::Unauthorized);
        }
        caller.require_auth();

        set_nft_contract(e, &nft_address);

        NFTContractSetEventData {
            admin: caller,
            nft_contract: nft_address,
        }
        .publish(e);

        Self::extend_instance_ttl(e);
    }

    /// Register a user's NFT token ID.
    ///
    /// Requires the "recorder" role.
    ///
    /// # Arguments
    /// * `caller` - Address initiating the registration (must have recorder role)
    /// * `user` - User address
    /// * `token_id` - NFT token ID to register
    #[only_role(caller, "recorder")]
    pub fn register_user_nft(e: &Env, caller: Address, user: Address, token_id: u32) {
        set_user_nft_token_id(e, &user, token_id);

        UserNFTRegisteredData {
            user,
            token_id,
        }
        .publish(e);

        Self::extend_instance_ttl(e);
    }

    // ========================================================================
    // NFT Integration
    // ========================================================================

    /// Try to upgrade the user's NFT with the new level and points.
    /// Gracefully handles cases where NFT is not configured or user has no NFT.
    fn try_upgrade_nft_internal(e: &Env, user: &Address, new_level: Level, total_points: u32) {
        // Check if NFT contract is configured
        let nft_contract = match get_nft_contract(e) {
            Some(addr) => addr,
            None => return, // No NFT contract configured, skip silently
        };

        // Check if user has an NFT registered
        let token_id = match get_user_nft_token_id(e, user) {
            Some(id) => id,
            None => return, // User has no NFT, skip silently
        };

        // Get this contract's address to use as the caller for the NFT update
        // The reputation contract needs the metadata_manager role on the NFT contract
        let reputation_contract = e.current_contract_address();

        // Try to upgrade the NFT metadata with the new level and points
        let success = nft_client::try_upgrade_nft(
            e,
            &nft_contract,
            &reputation_contract,
            token_id,
            new_level,
            total_points,
        );

        // Emit event if upgrade was successful
        if success {
            NFTUpgradedEventData {
                user: user.clone(),
                token_id,
                new_level,
            }
            .publish(e);
        }
    }

    // ========================================================================
    // Role Helper Functions
    // ========================================================================

    /// Get the recorder role symbol.
    pub fn recorder_role(e: &Env) -> Symbol {
        Symbol::new(e, RECORDER_ROLE)
    }

    /// Get the config role symbol.
    pub fn config_role(e: &Env) -> Symbol {
        Symbol::new(e, CONFIG_ROLE)
    }

    /// Extend the TTL of instance storage.
    fn extend_instance_ttl(e: &Env) {
        e.storage()
            .instance()
            .extend_ttl(INSTANCE_TTL_THRESHOLD, INSTANCE_TTL_AMOUNT);
    }
}

/// Implementation of the AccessControl trait.
/// Provides role management functionality using OpenZeppelin storage functions.
#[contractimpl]
impl AccessControl for Reputation {
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
        Reputation::extend_instance_ttl(e);
    }

    fn revoke_role(e: &Env, account: Address, role: Symbol, caller: Address) {
        storage_revoke_role(e, &account, &role, &caller);
        Reputation::extend_instance_ttl(e);
    }

    fn renounce_role(e: &Env, role: Symbol, caller: Address) {
        storage_renounce_role(e, &role, &caller);
        Reputation::extend_instance_ttl(e);
    }

    fn transfer_admin_role(e: &Env, new_admin: Address, live_until_ledger: u32) {
        storage_transfer_admin_role(e, &new_admin, live_until_ledger);
        Reputation::extend_instance_ttl(e);
    }

    fn accept_admin_transfer(e: &Env) {
        storage_accept_admin_transfer(e);
        Reputation::extend_instance_ttl(e);
    }

    fn set_role_admin(e: &Env, role: Symbol, admin_role: Symbol) {
        storage_set_role_admin(e, &role, &admin_role);
        Reputation::extend_instance_ttl(e);
    }

    fn renounce_admin(e: &Env) {
        storage_renounce_admin(e);
        Reputation::extend_instance_ttl(e);
    }
}

#[cfg(test)]
mod test;
