use soroban_sdk::{Address, Env};

use crate::types::{GovernanceOption, GovernanceRound, StorageKey, UserVote};

// ============================================================================
// TTL Constants  (~5 second ledger time)
// ============================================================================

const DAY_IN_LEDGERS: u32 = 17_280;
const PERSISTENT_TTL_AMOUNT: u32 = 60 * DAY_IN_LEDGERS;
const PERSISTENT_TTL_THRESHOLD: u32 = PERSISTENT_TTL_AMOUNT - DAY_IN_LEDGERS;

// ============================================================================
// Initialization
// ============================================================================

pub fn is_initialized(e: &Env) -> bool {
    e.storage().instance().has(&StorageKey::Initialized)
}

pub fn set_initialized(e: &Env) {
    e.storage().instance().set(&StorageKey::Initialized, &true);
}

// ============================================================================
// Reputation Contract Address
// ============================================================================

pub fn get_reputation_contract(e: &Env) -> Option<Address> {
    e.storage().instance().get(&StorageKey::ReputationContract)
}

pub fn set_reputation_contract(e: &Env, address: &Address) {
    e.storage()
        .instance()
        .set(&StorageKey::ReputationContract, address);
}

// ============================================================================
// Round Counter
// ============================================================================

pub fn get_next_round_id(e: &Env) -> u32 {
    e.storage()
        .instance()
        .get(&StorageKey::NextRoundId)
        .unwrap_or(0_u32)
}

pub fn increment_round_id(e: &Env) -> u32 {
    let id = get_next_round_id(e);
    e.storage()
        .instance()
        .set(&StorageKey::NextRoundId, &(id + 1));
    id
}

// ============================================================================
// Round Storage
// ============================================================================

pub fn get_round(e: &Env, round_id: u32) -> Option<GovernanceRound> {
    let key = StorageKey::Round(round_id);
    let round: Option<GovernanceRound> = e.storage().persistent().get(&key);
    if round.is_some() {
        e.storage()
            .persistent()
            .extend_ttl(&key, PERSISTENT_TTL_THRESHOLD, PERSISTENT_TTL_AMOUNT);
    }
    round
}

pub fn set_round(e: &Env, round: &GovernanceRound) {
    let key = StorageKey::Round(round.round_id);
    e.storage().persistent().set(&key, round);
    e.storage()
        .persistent()
        .extend_ttl(&key, PERSISTENT_TTL_THRESHOLD, PERSISTENT_TTL_AMOUNT);
}

// ============================================================================
// Option Counter per Round
// ============================================================================

pub fn get_next_option_id(e: &Env, round_id: u32) -> u32 {
    let key = StorageKey::NextOptionId(round_id);
    e.storage().persistent().get(&key).unwrap_or(0_u32)
}

pub fn increment_option_id(e: &Env, round_id: u32) -> u32 {
    let id = get_next_option_id(e, round_id);
    let key = StorageKey::NextOptionId(round_id);
    e.storage().persistent().set(&key, &(id + 1));
    e.storage()
        .persistent()
        .extend_ttl(&key, PERSISTENT_TTL_THRESHOLD, PERSISTENT_TTL_AMOUNT);
    id
}

// ============================================================================
// Option Storage
// ============================================================================

pub fn get_option(e: &Env, round_id: u32, option_id: u32) -> Option<GovernanceOption> {
    let key = StorageKey::Option(round_id, option_id);
    let opt: Option<GovernanceOption> = e.storage().persistent().get(&key);
    if opt.is_some() {
        e.storage()
            .persistent()
            .extend_ttl(&key, PERSISTENT_TTL_THRESHOLD, PERSISTENT_TTL_AMOUNT);
    }
    opt
}

pub fn set_option(e: &Env, option: &GovernanceOption) {
    let key = StorageKey::Option(option.round_id, option.option_id);
    e.storage().persistent().set(&key, option);
    e.storage()
        .persistent()
        .extend_ttl(&key, PERSISTENT_TTL_THRESHOLD, PERSISTENT_TTL_AMOUNT);
}

// ============================================================================
// User Vote Storage
// ============================================================================

pub fn get_user_vote(e: &Env, voter: &Address, round_id: u32) -> Option<UserVote> {
    let key = StorageKey::UserVote(voter.clone(), round_id);
    let vote: Option<UserVote> = e.storage().persistent().get(&key);
    if vote.is_some() {
        e.storage()
            .persistent()
            .extend_ttl(&key, PERSISTENT_TTL_THRESHOLD, PERSISTENT_TTL_AMOUNT);
    }
    vote
}

pub fn set_user_vote(e: &Env, voter: &Address, round_id: u32, vote: &UserVote) {
    let key = StorageKey::UserVote(voter.clone(), round_id);
    e.storage().persistent().set(&key, vote);
    e.storage()
        .persistent()
        .extend_ttl(&key, PERSISTENT_TTL_THRESHOLD, PERSISTENT_TTL_AMOUNT);
}

// ============================================================================
// Voter Count per Round
// ============================================================================

pub fn get_voter_count(e: &Env, round_id: u32) -> u32 {
    let key = StorageKey::VoterCount(round_id);
    e.storage().persistent().get(&key).unwrap_or(0_u32)
}

pub fn increment_voter_count(e: &Env, round_id: u32) {
    let count = get_voter_count(e, round_id);
    let key = StorageKey::VoterCount(round_id);
    e.storage().persistent().set(&key, &(count + 1));
    e.storage()
        .persistent()
        .extend_ttl(&key, PERSISTENT_TTL_THRESHOLD, PERSISTENT_TTL_AMOUNT);
}
