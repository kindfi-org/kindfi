use soroban_sdk::{Address, Env, String, Vec};
use crate::{
    datatype::{DataKeys, GraduationNFT, NFTMetadata, NFTError},
    interface::MintingOperations,
    progresstracker, badgetracker,
};

impl MintingOperations for super::AcademyGraduationNFT {
    fn mint_graduation_nft(env: &Env, user: Address) -> Result<GraduationNFT, NFTError> {
        // Check if contract is initialized
        if !env.storage().persistent().has(&DataKeys::ProgressTracker) {
            return Err(NFTError::Uninitialized);
        }

        // Check if NFT already minted
        if env.storage().persistent().has(&DataKeys::GraduationNFT(user.clone())) {
            return Err(NFTError::AlreadyMinted);
        }

        // Get contract addresses
        let progress_tracker: Address = env.storage().persistent().get(&DataKeys::ProgressTracker).unwrap();
        let badge_tracker: Address = env.storage().persistent().get(&DataKeys::BadgeTracker).unwrap();

        // Create client instances
        let progress_client = progresstracker::Client::new(env, &progress_tracker);
        let badge_client = badgetracker::Client::new(env, &badge_tracker);

        // Check completion status
        if !progress_client.is_completed(&user) {
            return Err(NFTError::NotCompleted);
        }

        // Get user's badges
        let badges = badge_client.get_full_badges(&user);
        
        // Validate badge count
        let max_badges: u32 = env.storage().persistent().get(&DataKeys::MaxBadges).unwrap();
        if badges.len() as u32 > max_badges {
            return Err(NFTError::TooManyBadges);
        }

        // Create NFT metadata
        let nft = GraduationNFT {
            owner: user.clone(),
            metadata: NFTMetadata {
                issued_at: env.ledger().timestamp(),
                version: String::from_str(env, "v1.0"),
                badges: badges.clone(),
                achievement_score: calculate_achievement_score(&badges),
                completion_date: env.ledger().timestamp(),
            },
        };

        // Store NFT
        env.storage().persistent().set(&DataKeys::GraduationNFT(user.clone()), &nft);

        // Emit mint event
        env.events().publish(
            ("mint", "graduation_nft"),
            (user, badges.len(), env.ledger().timestamp())
        );

        Ok(nft)
    }
}

// Helper function to calculate achievement score based on badges
fn calculate_achievement_score(badges: &Vec<String>) -> u32 {
    // Simple scoring: 100 points per badge
    // This could be enhanced with different weights for different badges
    (badges.len() as u32) * 100
}
