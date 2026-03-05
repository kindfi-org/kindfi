use soroban_sdk::{contracttype, Address};

/// Streak period types.
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum StreakPeriod {
    /// Weekly streak (7 days)
    Weekly = 0,
    /// Monthly streak (30 days)
    Monthly = 1,
}

/// User's streak information.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StreakInfo {
    /// Current streak count
    pub current_streak: u32,
    /// Longest streak achieved
    pub longest_streak: u32,
    /// Last donation timestamp
    pub last_donation_timestamp: u64,
    /// Streak period type
    pub period: StreakPeriod,
}

/// Storage keys for the Streak contract.
#[contracttype]
#[derive(Clone)]
pub enum StorageKey {
    /// Admin address
    Admin,
    /// Reputation contract address
    ReputationContract,
    /// User streak info: UserStreak(user, period) -> StreakInfo
    UserStreak(Address, StreakPeriod),
    /// Contract initialized flag
    Initialized,
}
