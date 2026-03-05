use soroban_sdk::{contracttype, Address, String};

/// Quest types that define different goal-based challenges.
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum QuestType {
    /// Donate to campaigns in N different regions
    MultiRegionDonation = 0,
    /// Donate N weeks in a row
    WeeklyStreak = 1,
    /// Donate to N different categories
    MultiCategoryDonation = 2,
    /// Refer N users who complete onboarding
    ReferralQuest = 3,
    /// Donate a total amount across all campaigns
    TotalDonationAmount = 4,
    /// Complete N quests
    QuestMaster = 5,
}

/// Quest status tracking.
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum QuestStatus {
    /// Quest is active and can be completed
    Active = 0,
    /// Quest has been completed by the user
    Completed = 1,
    /// Quest has expired
    Expired = 2,
}

/// Quest definition stored on-chain.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct QuestDefinition {
    /// Unique quest ID
    pub quest_id: u32,
    /// Type of quest
    pub quest_type: QuestType,
    /// Human-readable name
    pub name: String,
    /// Description of the quest
    pub description: String,
    /// Target value (e.g., number of regions, weeks, amount)
    pub target_value: u32,
    /// Points awarded upon completion
    pub reward_points: u32,
    /// Expiration timestamp (0 = no expiration)
    pub expires_at: u64,
    /// Whether quest is currently active
    pub is_active: bool,
}

/// User's progress on a quest.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct QuestProgress {
    /// Quest ID
    pub quest_id: u32,
    /// Current progress value
    pub current_value: u32,
    /// Whether quest is completed
    pub is_completed: bool,
    /// Completion timestamp (0 if not completed)
    pub completed_at: u64,
}

/// Storage keys for the Quest contract.
#[contracttype]
#[derive(Clone)]
pub enum StorageKey {
    /// Admin address
    Admin,
    /// Reputation contract address
    ReputationContract,
    /// Quest definitions: QuestDefinition(quest_id) -> QuestDefinition
    QuestDefinition(u32),
    /// User quest progress: UserQuestProgress(user, quest_id) -> QuestProgress
    UserQuestProgress(Address, u32),
    /// User's completed quests: UserCompletedQuests(user) -> Vec<u32>
    UserCompletedQuests(Address),
    /// Next quest ID counter
    NextQuestId,
    /// Contract initialized flag
    Initialized,
}
