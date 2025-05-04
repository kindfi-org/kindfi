#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, panic_with_error, Address, Env, IntoVal, Map, Symbol, Vec,
};

mod errors;
mod events;

use crate::errors::Error;
use crate::events::{EligibilityVerifiedEventData, InitializedEventData, ACADEMY, CERTIFIED, INITIALIZED};

/// Storage keys for the contract
#[contracttype]
#[derive(Clone)]
enum DataKey {
    ProgressTracker,
    BadgeTracker,
    GraduationNFT,
}

#[contracttype]
#[derive(Clone)]
pub struct VerificationResult {
    /// Overall verification status (true if all checks passed)
    pub is_fully_certified: bool,
    /// Progress certification status
    pub has_completely_progressed: bool,
    /// Badge completion status
    pub has_all_badges: bool,
    /// Graduation NFT ownership status
    pub has_graduated: bool,
}

#[contract]
pub struct AcademyVerifier;

#[contractimpl]
impl AcademyVerifier {
    /// Initialize the contract with addresses to the other academy contracts
    pub fn init(
        env: Env,
        progress_tracker: Address,
        badge_tracker: Address,
        graduation_nft: Address,
    ) {
        // Prevent re-initialization
        if env.storage().instance().has(&DataKey::ProgressTracker) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }

        // Store the contract addresses
        env.storage()
            .instance()
            .set(&DataKey::ProgressTracker, &progress_tracker);
        env.storage()
            .instance()
            .set(&DataKey::BadgeTracker, &badge_tracker);
        env.storage()
            .instance()
            .set(&DataKey::GraduationNFT, &graduation_nft);

        // Publish event for initialization
        env.events().publish(
            (ACADEMY, INITIALIZED),
            InitializedEventData {
                progress_tracker: progress_tracker.clone(),
                graduation_nft: graduation_nft.clone(),
                badge_tracker: badge_tracker.clone(),
            },
        );
    }

    /// Retrieves the user's progress as a map of chapter IDs to lesson counts
    pub fn get_user_progress(env: Env, user: Address) -> Map<u32, u32> {
        // Get the progress tracker contract address
        let progress_tracker = env
            .storage()
            .instance()
            .get::<DataKey, Address>(&DataKey::ProgressTracker)
            .unwrap_or_else(|| panic_with_error!(&env, Error::ContractNotInitialized));

        // Call into the progress tracker contract to get user progress
        env.invoke_contract(
            &progress_tracker,
            &Symbol::new(&env, "get_user_progress"),
            Vec::from_array(&env, [user.into_val(&env)]),
        )
    }

    /// Checks if a user has completed all required chapters and lessons
    pub fn has_completed_all_chapters(env: Env, user: Address) -> bool {
        // Get the progress tracker contract address
        let progress_tracker = env
            .storage()
            .instance()
            .get::<DataKey, Address>(&DataKey::ProgressTracker)
            .unwrap_or_else(|| panic_with_error!(&env, Error::ContractNotInitialized));

        // Call into the progress tracker contract to get user progress
        let progress: u32 = env.invoke_contract(
            &progress_tracker,
            &Symbol::new(&env, "get_chapter_completion_percent"),
            Vec::from_array(&env, [user.into_val(&env)]),
        );

        progress == 100
    }

    /// Lists the badges earned by the user
    pub fn get_user_badges(env: Env, user: Address) -> Vec<Symbol> {
        // Get the badge tracker contract address
        let badge_tracker = env
            .storage()
            .instance()
            .get::<DataKey, Address>(&DataKey::BadgeTracker)
            .unwrap_or_else(|| panic_with_error!(&env, Error::ContractNotInitialized));

        // Call into the badge tracker contract to get badges
        env.invoke_contract(
            &badge_tracker,
            &Symbol::new(&env, "get_user_badges"),
            Vec::from_array(&env, [user.into_val(&env)]),
        )
    }

    /// Helper function to check if a user has badges for all completed chapters
    /// Takes a list of chapter IDs and verifies badges for each from the badge tracker
    pub fn has_all_chapter_badges(env: Env, user: Address, chapter_ids: Vec<u32>) -> bool {
        // Get the badge tracker contract address
        let badge_tracker = env
            .storage()
            .instance()
            .get::<DataKey, Address>(&DataKey::BadgeTracker)
            .unwrap_or_else(|| panic_with_error!(&env, Error::ContractNotInitialized));

        // Check if the user has a badge for each chapter ID
        chapter_ids.iter().all(|chapter_id| {
            // Call badge tracker to check for each chapter badge
            let has_badge: bool = env.invoke_contract(
                &badge_tracker,
                &Symbol::new(&env, "has_badge"),
                Vec::from_array(
                    &env,
                    [
                        user.clone().into_val(&env),
                        Symbol::new(&env, "chapter").into_val(&env),
                        (chapter_id).into_val(&env),
                    ],
                ),
            );
            has_badge
        })
    }

    /// Determines if a user has all badges for their completed chapters
    pub fn has_all_progress_badges(env: Env, user: Address) -> bool {
        // Get the user's progress
        let progress = Self::get_user_progress(env.clone(), user.clone());

        // If no progress found, return false
        if progress.is_empty() {
            return false;
        }

        // Extract all chapter IDs from the progress data
        let mut chapter_ids = Vec::new(&env);
        for (chapter_id, lesson_count) in progress.iter() {
            // Only consider chapters where the user has completed lessons
            if lesson_count > 0 {
                chapter_ids.push_back(chapter_id);
            }
        }

        // Check if the user has badges for all completed chapters
        Self::has_all_chapter_badges(env, user, chapter_ids)
    }

    /// Checks if the user owns a valid graduation NFT
    pub fn has_graduation_nft(env: Env, user: Address) -> bool {
        // Get the graduation NFT contract address
        let graduation_nft = env
            .storage()
            .instance()
            .get::<DataKey, Address>(&DataKey::GraduationNFT)
            .unwrap_or_else(|| panic_with_error!(&env, Error::ContractNotInitialized));

        // Call into the graduation NFT contract to check ownership
        env.invoke_contract(
            &graduation_nft,
            &Symbol::new(&env, "has_graduation_nft"),
            Vec::from_array(&env, [user.into_val(&env)]),
        )
    }

    /// Returns a detailed verification result for the user
    pub fn is_user_fully_certified(env: Env, user: Address) -> VerificationResult {
        // Check all verification metrics
        let has_completely_progressed = Self::has_completed_all_chapters(env.clone(), user.clone());
        let has_all_badges = Self::has_all_progress_badges(env.clone(), user.clone());
        let has_graduated = Self::has_graduation_nft(env.clone(), user.clone());

        // Overall verification status (all checks must pass)
        let is_fully_certified = has_completely_progressed && has_all_badges && has_graduated;

        // Create verification result
        let result = VerificationResult {
            is_fully_certified,
            has_completely_progressed,
            has_all_badges,
            has_graduated,
        };

        // Publish event for this verification
        env.events().publish(
            (ACADEMY, CERTIFIED),
            EligibilityVerifiedEventData {
                user: user.clone(),
                is_fully_certified,
                has_completely_progressed,
                has_all_badges,
                has_graduated,
            },
        );

        result
    }

    /// Returns only the boolean verification status
    pub fn is_user_certified(env: Env, user: Address) -> bool {
        let result = Self::is_user_fully_certified(env, user);
        result.is_fully_certified
    }

    /// Returns the address of the progress tracker contract
    pub fn get_progress_tracker_address(env: Env) -> Address {
        env.storage()
            .instance()
            .get::<DataKey, Address>(&DataKey::ProgressTracker)
            .unwrap_or_else(|| panic_with_error!(&env, Error::ContractNotInitialized))
    }

    /// Returns the address of the badge tracker contract
    pub fn get_badge_tracker_address(env: Env) -> Address {
        env.storage()
            .instance()
            .get::<DataKey, Address>(&DataKey::BadgeTracker)
            .unwrap_or_else(|| panic_with_error!(&env, Error::ContractNotInitialized))
    }

    /// Returns the address of the graduation NFT contract
    pub fn get_graduation_nft_address(env: Env) -> Address {
        env.storage()
            .instance()
            .get::<DataKey, Address>(&DataKey::GraduationNFT)
            .unwrap_or_else(|| panic_with_error!(&env, Error::ContractNotInitialized))
    }
}

#[cfg(test)]
mod test;
