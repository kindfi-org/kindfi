#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, contractclient, Address, Env, String, Vec, Map};

mod datatypes;
use datatypes::{Badge, BadgeType};

mod errors;
use errors::BadgeError;

mod events;
use events::{BADGE, BadgeMintedEventData};

mod test;

/// Storage keys for persistent data
#[contracttype]
#[derive(Clone)]
enum DataKey {
    /// Individual badge storage: (user_address, badge_type, reference_id)
    Badge(Address, BadgeType, u32),
    /// User's badge index mapping badge types to reference IDs
    UserIndex(Address),
    /// Address of the external progress tracker contract
    ProgressTrackerAddress,
}

// Client for the external academy-progress-tracker contract
#[contractclient(name = "ProgressTrackerClient")]
pub trait ProgressTracker {
    /// Check if a chapter is complete for a user
    /// Returns false if unable to verify (fail-safe approach)
    fn is_chapter_complete(env: Env, user: Address, chapter_id: u32) -> bool;
}

// Client for the external auth-controller contract used to validate known users
#[contractclient(name = "AuthControllerClient")]
pub trait AuthController {
    /// Returns true if the address belongs to a known authenticated KindFi user
    fn is_authenticated_user(env: Env, address: Address) -> bool;
}

#[contract]
pub struct AcademyBadgeTracker;

#[contractimpl]
impl AcademyBadgeTracker {
    /// Initializes contract with tracker and auth controller addresses, validating the admin
    pub fn init(env: Env, progress_tracker_address: Address, auth_controller_address: Address, admin: Address) -> Result<(), BadgeError> {
        // Call auth contract to check if the admin is a valid KindFi user
        let auth_client = AuthControllerClient::new(&env, &auth_controller_address);
        if !auth_client.is_authenticated_user(&admin) {
            return Err(BadgeError::InvalidKindfiUserAddress);
        }

        // Save progress tracker address to instance storage
        env.storage()
            .instance()
            .set(&DataKey::ProgressTrackerAddress, &progress_tracker_address);

        Ok(())
    }

    /// Mint a badge for a user, validating input and preventing duplicates
    pub fn mint_badge(
        env: Env,
        user: Address,
        badge_type: BadgeType,
        reference_id: u32,
        metadata: String,
    ) -> Result<(), BadgeError> {
        user.require_auth(); // Ensure the user authorizes this operation

        // Validate reference ID (should be > 0)
        if reference_id == 0 {
            return Err(BadgeError::InvalidReferenceId);
        }

        // Validate metadata (should not be empty)
        if metadata.is_empty() {
            return Err(BadgeError::InvalidMetadata);
        }

        // Only check progress if badge type is Chapter
        if badge_type == BadgeType::Chapter {
            // Load progress tracker contract address from instance storage
            let progress_tracker_address = env
                .storage()
                .instance()
                .get::<_, Address>(&DataKey::ProgressTrackerAddress)
                .ok_or(BadgeError::ProgressTrackerAddressNotSet)?;
            let client = ProgressTrackerClient::new(&env, &progress_tracker_address);
            let completed = client.is_chapter_complete(&user, &reference_id);
            if !completed {
                return Err(BadgeError::ProgressNotCompleted);
            }
        }

        // Create unique storage key for the badge
        let badge_key = DataKey::Badge(user.clone(), badge_type.clone(), reference_id);
        if env.storage().persistent().has(&badge_key) {
            return Err(BadgeError::AlreadyMinted); // Prevent duplicate minting
        }

        // Create the badge object
        let badge = Badge {
            badge_id: reference_id,
            badge_type: badge_type.clone(),
            user: user.clone(),
            timestamp: env.ledger().timestamp(),
            metadata,
        };

        // Store the badge in persistent storage
        env.storage().persistent().set(&badge_key, &badge);

        // Update the user's badge index
        let user_index_key = DataKey::UserIndex(user.clone());
        let mut index = env
            .storage()
            .persistent()
            .get::<_, Map<BadgeType, Vec<u32>>>(&user_index_key)
            .unwrap_or(Map::new(&env));

        let mut refs = index.get(badge_type.clone()).unwrap_or(Vec::new(&env));
        refs.push_back(reference_id);
        index.set(badge_type.clone(), refs);
        env.storage().persistent().set(&user_index_key, &index);
        // Extend TTL to keep user index alive longer in storage
        env.storage().persistent().extend_ttl(&user_index_key, 100, 200);

        // Emit an event for external tracking
        env.events().publish(
            (BADGE,),
            BadgeMintedEventData {
                user: user.clone(),
                badge,
            },
        );
        Ok(())
    }

    /// Retrieve all badges earned by the user
    pub fn get_user_badges(env: Env, user: Address) -> Vec<Badge> {
        let mut badges = Vec::new(&env);
        let user_index_key = DataKey::UserIndex(user.clone());

        // Get the list of (badge_type, reference_id) for this user
        let index = env
            .storage()
            .persistent()
            .get::<_, Map<BadgeType, Vec<u32>>>(&user_index_key)
            .unwrap_or(Map::new(&env));

        // Retrieve each badge and add it to the list
        for (badge_type, references) in index.iter() {
            for reference_id in references.iter() {
                let badge_key = DataKey::Badge(user.clone(), badge_type.clone(), reference_id);
                if let Some(badge) = env.storage().persistent().get::<_, Badge>(&badge_key) {
                    badges.push_back(badge);
                }
            }
        }

        badges
    }

    /// Check if the user has a specific badge
    pub fn has_badge(env: Env, user: Address, badge_type: BadgeType, reference_id: u32) -> bool {
        let badge_key = DataKey::Badge(user, badge_type, reference_id);
        env.storage().persistent().has(&badge_key)
    }
}
