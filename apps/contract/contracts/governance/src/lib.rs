#![no_std]

mod errors;
mod events;
mod reputation_client;
mod storage;
mod types;

use soroban_sdk::{contract, contractimpl, panic_with_error, Address, Env, String, Symbol};
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
use crate::events::{OptionAddedEvent, RoundClosedEvent, RoundCreatedEvent, VoteCastEvent};
use crate::reputation_client::ReputationClient;
use crate::storage::{
    get_next_option_id, get_next_round_id, get_option, get_reputation_contract, get_round,
    get_user_vote, get_voter_count, increment_option_id, increment_round_id,
    increment_voter_count, is_initialized, set_initialized, set_option,
    set_reputation_contract, set_round, set_user_vote,
};
use crate::types::{GovernanceOption, GovernanceRound, NftTier, RoundStatus, UserVote, VoteType};

// ============================================================================
// Constants
// ============================================================================

const DAY_IN_LEDGERS: u32 = 17_280;
const INSTANCE_TTL_AMOUNT: u32 = 60 * DAY_IN_LEDGERS;
const INSTANCE_TTL_THRESHOLD: u32 = INSTANCE_TTL_AMOUNT - DAY_IN_LEDGERS;

/// Role identifier for addresses that can create rounds and add options.
pub const ADMIN_ROLE: &str = "admin";

/// Role identifier for the service account that records votes on behalf of users.
pub const RECORDER_ROLE: &str = "recorder";

// ============================================================================
// Contract
// ============================================================================

/// KindFi Governance Contract
///
/// Manages community fund governance rounds with NFT-weighted voting.
///
/// Features:
/// - Admin-gated round and option management
/// - Per-round upvote/downvote with tier-based weight
/// - Two voting paths:
///   1. `record_vote` — recorder service records on behalf of users (API integration)
///   2. `cast_vote`   — voter signs directly via their own wallet
/// - Double-vote prevention enforced on-chain
/// - On-chain winner determination by highest weighted upvotes
/// - Event emissions for full auditability
#[contract]
pub struct Governance;

#[contractimpl]
impl Governance {
    // ========================================================================
    // Initialization
    // ========================================================================

    /// Initialize the Governance contract.
    ///
    /// # Arguments
    /// * `admin` - Address with admin privileges
    /// * `reputation_contract` - Address of the Reputation contract (for tier lookup)
    ///
    /// # Errors
    /// * `Error::AlreadyInitialized` - Contract was already initialized
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
    // Admin — Round Management
    // ========================================================================

    /// Create a new governance round.
    ///
    /// Requires the "admin" role.
    ///
    /// # Arguments
    /// * `caller`       - Admin address
    /// * `title`        - Human-readable round title
    /// * `start_ledger` - Ledger sequence when voting opens
    /// * `end_ledger`   - Ledger sequence when voting closes
    /// * `fund_amount`  - Community fund at stake in stroops (0 if unset)
    ///
    /// # Returns
    /// The newly assigned `round_id`
    #[only_role(caller, "admin")]
    pub fn create_round(
        e: &Env,
        caller: Address,
        title: String,
        start_ledger: u32,
        end_ledger: u32,
        fund_amount: i128,
    ) -> u32 {
        if title.len() == 0 {
            panic_with_error!(e, Error::EmptyTitle);
        }
        if start_ledger >= end_ledger {
            panic_with_error!(e, Error::InvalidLedgerRange);
        }
        if fund_amount < 0 {
            panic_with_error!(e, Error::InvalidFundAmount);
        }

        let round_id = increment_round_id(e);
        let current = e.ledger().sequence();
        let status = if current >= end_ledger {
            RoundStatus::Ended
        } else if current >= start_ledger {
            RoundStatus::Active
        } else {
            RoundStatus::Upcoming
        };

        let round = GovernanceRound {
            round_id,
            title: title.clone(),
            status,
            start_ledger,
            end_ledger,
            fund_amount,
            winner_option_id: None,
            option_count: 0,
            created_at: e.ledger().timestamp(),
        };
        set_round(e, &round);

        RoundCreatedEvent {
            creator: caller,
            round_id,
            title,
            start_ledger,
            end_ledger,
            fund_amount,
        }
        .publish(e);

        Self::extend_instance_ttl(e);
        round_id
    }

    /// Add a redistribution option to an existing round.
    ///
    /// Requires the "admin" role.
    ///
    /// # Returns
    /// The newly assigned `option_id`
    #[only_role(caller, "admin")]
    pub fn add_option(
        e: &Env,
        caller: Address,
        round_id: u32,
        title: String,
    ) -> u32 {
        if title.len() == 0 {
            panic_with_error!(e, Error::EmptyTitle);
        }

        let mut round = get_round(e, round_id)
            .unwrap_or_else(|| panic_with_error!(e, Error::RoundNotFound));

        if round.status == RoundStatus::Ended {
            panic_with_error!(e, Error::RoundAlreadyEnded);
        }

        let option_id = increment_option_id(e, round_id);
        let option = GovernanceOption {
            option_id,
            round_id,
            title: title.clone(),
            upvote_weight: 0,
            downvote_weight: 0,
            vote_count: 0,
        };
        set_option(e, &option);

        round.option_count = option_id + 1;
        set_round(e, &round);

        OptionAddedEvent {
            round_id,
            option_id,
            title,
        }
        .publish(e);

        Self::extend_instance_ttl(e);
        option_id
    }

    /// Close a round and compute the winner.
    ///
    /// Requires the "admin" role.
    /// Can only be called once `end_ledger` has been reached.
    ///
    /// # Returns
    /// Winning option ID (None if no upvotes were cast)
    #[only_role(caller, "admin")]
    pub fn close_round(e: &Env, caller: Address, round_id: u32) -> Option<u32> {
        let mut round = get_round(e, round_id)
            .unwrap_or_else(|| panic_with_error!(e, Error::RoundNotFound));

        if round.status == RoundStatus::Ended {
            panic_with_error!(e, Error::RoundAlreadyEnded);
        }

        let current = e.ledger().sequence();
        if current < round.end_ledger {
            panic_with_error!(e, Error::RoundNotYetEnded);
        }

        let winner_option_id = Self::compute_winner(e, &round);

        round.status = RoundStatus::Ended;
        round.winner_option_id = winner_option_id;
        set_round(e, &round);

        let total_voters = get_voter_count(e, round_id);

        RoundClosedEvent {
            round_id,
            winner_option_id,
            total_voters,
        }
        .publish(e);

        Self::extend_instance_ttl(e);
        winner_option_id
    }

    // ========================================================================
    // Voting — Recorder path (API / service account)
    // ========================================================================

    /// Record a vote on behalf of a voter via the trusted recorder service.
    ///
    /// Requires the "recorder" role.
    ///
    /// This is the primary API integration path. Eligibility and tier are verified
    /// off-chain; the supplied `tier` is the authoritative vote weight source.
    ///
    /// # Arguments
    /// * `caller`    - Recorder address (must have recorder role)
    /// * `voter`     - Address of the voter
    /// * `round_id`  - Active governance round ID
    /// * `option_id` - Option to vote for
    /// * `vote_type` - Up or Down
    /// * `tier`      - Voter's NFT tier (verified off-chain by the API)
    ///
    /// # Returns
    /// The vote weight applied
    #[only_role(caller, "recorder")]
    pub fn record_vote(
        e: &Env,
        caller: Address,
        voter: Address,
        round_id: u32,
        option_id: u32,
        vote_type: VoteType,
        tier: NftTier,
    ) -> u32 {
        let weight = tier.vote_weight();
        if weight == 0 {
            panic_with_error!(e, Error::NotEligible);
        }
        Self::apply_vote_internal(e, &voter, round_id, option_id, vote_type, weight, tier)
    }

    // ========================================================================
    // Voting — Self-sign path (direct wallet integration)
    // ========================================================================

    /// Cast a weighted vote directly — the voter signs this transaction.
    ///
    /// Tier and weight are resolved via cross-contract call to the Reputation contract.
    ///
    /// # Returns
    /// The vote weight applied
    pub fn cast_vote(
        e: &Env,
        voter: Address,
        round_id: u32,
        option_id: u32,
        vote_type: VoteType,
    ) -> u32 {
        voter.require_auth();

        let reputation_contract = get_reputation_contract(e)
            .unwrap_or_else(|| panic_with_error!(e, Error::ReputationContractNotSet));

        let tier = ReputationClient::get_tier(e, &reputation_contract, &voter)
            .unwrap_or_else(|| panic_with_error!(e, Error::ReputationQueryFailed));

        let weight = tier.vote_weight();
        if weight == 0 {
            panic_with_error!(e, Error::NotEligible);
        }
        Self::apply_vote_internal(e, &voter, round_id, option_id, vote_type, weight, tier)
    }

    // ========================================================================
    // Query Functions
    // ========================================================================

    /// Get a governance round by ID.
    pub fn get_round(e: &Env, round_id: u32) -> Option<GovernanceRound> {
        get_round(e, round_id)
    }

    /// Get a governance option by round and option ID.
    pub fn get_option(e: &Env, round_id: u32, option_id: u32) -> Option<GovernanceOption> {
        get_option(e, round_id, option_id)
    }

    /// Get a user's vote record for a round (None if not voted).
    pub fn get_vote(e: &Env, voter: Address, round_id: u32) -> Option<UserVote> {
        get_user_vote(e, &voter, round_id)
    }

    /// Get the total number of voters in a round.
    pub fn get_voter_count(e: &Env, round_id: u32) -> u32 {
        get_voter_count(e, round_id)
    }

    /// Get the live status of a round (automatically computes from current ledger).
    pub fn get_round_status(e: &Env, round_id: u32) -> Option<RoundStatus> {
        let round = get_round(e, round_id)?;
        let current = e.ledger().sequence();
        let live_status = if round.status == RoundStatus::Ended {
            RoundStatus::Ended
        } else if current > round.end_ledger {
            RoundStatus::Ended
        } else if current >= round.start_ledger {
            RoundStatus::Active
        } else {
            RoundStatus::Upcoming
        };
        Some(live_status)
    }

    /// Query a voter's NFT tier from the Reputation contract.
    pub fn get_voter_tier(e: &Env, voter: Address) -> Option<NftTier> {
        let reputation_contract = get_reputation_contract(e)?;
        ReputationClient::get_tier(e, &reputation_contract, &voter)
    }

    /// Get the next round ID that would be assigned.
    pub fn get_next_round_id(e: &Env) -> u32 {
        get_next_round_id(e)
    }

    /// Get the next option ID that would be assigned for a round.
    pub fn get_next_option_id(e: &Env, round_id: u32) -> u32 {
        get_next_option_id(e, round_id)
    }

    // ========================================================================
    // Admin — Configuration
    // ========================================================================

    /// Update the Reputation contract address.
    ///
    /// Only the contract admin can call this.
    pub fn set_reputation_contract(e: &Env, caller: Address, reputation_contract: Address) {
        let admin = storage_get_admin(e);
        if admin.is_none() || admin.unwrap() != caller {
            panic_with_error!(e, Error::Unauthorized);
        }
        caller.require_auth();
        set_reputation_contract(e, &reputation_contract);
        Self::extend_instance_ttl(e);
    }

    /// Get the configured Reputation contract address.
    pub fn get_reputation_contract(e: &Env) -> Option<Address> {
        get_reputation_contract(e)
    }

    /// Get the admin role symbol.
    pub fn admin_role(e: &Env) -> Symbol {
        Symbol::new(e, ADMIN_ROLE)
    }

    /// Get the recorder role symbol.
    pub fn recorder_role(e: &Env) -> Symbol {
        Symbol::new(e, RECORDER_ROLE)
    }

    // ========================================================================
    // Internal Helpers
    // ========================================================================

    /// Shared vote logic used by both `record_vote` and `cast_vote`.
    fn apply_vote_internal(
        e: &Env,
        voter: &Address,
        round_id: u32,
        option_id: u32,
        vote_type: VoteType,
        weight: u32,
        tier: NftTier,
    ) -> u32 {
        // Validate and potentially auto-activate the round
        let mut round = get_round(e, round_id)
            .unwrap_or_else(|| panic_with_error!(e, Error::RoundNotFound));

        let current = e.ledger().sequence();
        if round.status != RoundStatus::Active {
            if current >= round.start_ledger && current <= round.end_ledger {
                round.status = RoundStatus::Active;
                set_round(e, &round);
            } else {
                panic_with_error!(e, Error::RoundNotActive);
            }
        }
        if current > round.end_ledger {
            panic_with_error!(e, Error::RoundNotActive);
        }

        // Validate the option belongs to this round
        let mut option = get_option(e, round_id, option_id)
            .unwrap_or_else(|| panic_with_error!(e, Error::OptionNotFound));

        if option.round_id != round_id {
            panic_with_error!(e, Error::OptionNotInRound);
        }

        // Prevent double voting
        if get_user_vote(e, voter, round_id).is_some() {
            panic_with_error!(e, Error::AlreadyVoted);
        }

        // Record the vote
        let vote = UserVote {
            option_id,
            vote_type,
            weight,
            tier,
            voted_at: e.ledger().timestamp(),
        };
        set_user_vote(e, voter, round_id, &vote);
        increment_voter_count(e, round_id);

        // Update option weight tallies
        match vote_type {
            VoteType::Up => {
                option.upvote_weight = option.upvote_weight.saturating_add(weight);
            }
            VoteType::Down => {
                option.downvote_weight = option.downvote_weight.saturating_add(weight);
            }
        }
        option.vote_count = option.vote_count.saturating_add(1);
        set_option(e, &option);

        VoteCastEvent {
            round_id,
            voter: voter.clone(),
            option_id,
            vote_type,
            weight,
            tier,
        }
        .publish(e);

        Self::extend_instance_ttl(e);
        weight
    }

    /// Scan all options and return the one with the highest upvote_weight.
    fn compute_winner(e: &Env, round: &GovernanceRound) -> Option<u32> {
        if round.option_count == 0 {
            return None;
        }

        let mut best_id: Option<u32> = None;
        let mut best_weight: u32 = 0;

        for i in 0..round.option_count {
            if let Some(opt) = get_option(e, round.round_id, i) {
                if opt.upvote_weight > best_weight {
                    best_weight = opt.upvote_weight;
                    best_id = Some(opt.option_id);
                }
            }
        }

        if best_weight > 0 { best_id } else { None }
    }

    fn extend_instance_ttl(e: &Env) {
        e.storage()
            .instance()
            .extend_ttl(INSTANCE_TTL_THRESHOLD, INSTANCE_TTL_AMOUNT);
    }
}

// ============================================================================
// AccessControl (mirrors all other KindFi contracts)
// ============================================================================

#[contractimpl]
impl AccessControl for Governance {
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
        Governance::extend_instance_ttl(e);
    }
    fn revoke_role(e: &Env, account: Address, role: Symbol, caller: Address) {
        storage_revoke_role(e, &account, &role, &caller);
        Governance::extend_instance_ttl(e);
    }
    fn renounce_role(e: &Env, role: Symbol, caller: Address) {
        storage_renounce_role(e, &role, &caller);
        Governance::extend_instance_ttl(e);
    }
    fn transfer_admin_role(e: &Env, new_admin: Address, live_until_ledger: u32) {
        storage_transfer_admin_role(e, &new_admin, live_until_ledger);
        Governance::extend_instance_ttl(e);
    }
    fn accept_admin_transfer(e: &Env) {
        storage_accept_admin_transfer(e);
        Governance::extend_instance_ttl(e);
    }
    fn set_role_admin(e: &Env, role: Symbol, admin_role: Symbol) {
        storage_set_role_admin(e, &role, &admin_role);
        Governance::extend_instance_ttl(e);
    }
    fn renounce_admin(e: &Env) {
        storage_renounce_admin(e);
        Governance::extend_instance_ttl(e);
    }
}

#[cfg(test)]
mod test;
