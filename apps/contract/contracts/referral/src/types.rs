use soroban_sdk::{contracttype, Address};

/// Referral status tracking.
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ReferralStatus {
    /// Referral code created but not used
    Pending = 0,
    /// Referred user completed onboarding
    Onboarded = 1,
    /// Referred user made their first donation
    FirstDonation = 2,
    /// Referred user is active (multiple donations)
    Active = 3,
}

/// Referral record for a referred user.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReferralRecord {
    /// Referrer address
    pub referrer: Address,
    /// Referred user address
    pub referred: Address,
    /// Referral status
    pub status: ReferralStatus,
    /// Timestamp when referral was created
    pub created_at: u64,
    /// Timestamp when user onboarded
    pub onboarded_at: u64,
    /// Timestamp when user made first donation
    pub first_donation_at: u64,
    /// Total donations made by referred user
    pub total_donations: u32,
}

/// Referrer statistics.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReferrerStats {
    /// Total referrals
    pub total_referrals: u32,
    /// Active referrals (users who made donations)
    pub active_referrals: u32,
    /// Total reward points earned
    pub total_reward_points: u32,
}

/// Storage keys for the Referral contract.
#[contracttype]
#[derive(Clone)]
pub enum StorageKey {
    /// Admin address
    Admin,
    /// Reputation contract address
    ReputationContract,
    /// Referral record: ReferralRecord(referred) -> ReferralRecord
    ReferralRecord(Address),
    /// Referrer stats: ReferrerStats(referrer) -> ReferrerStats
    ReferrerStats(Address),
    /// Referrer's referrals list: ReferrerReferrals(referrer) -> Vec<Address>
    ReferrerReferrals(Address),
    /// Contract initialized flag
    Initialized,
}
