use core::error;

use crate::interface::MetadataOperations;
use crate::{
    AcademyGraduationNFT,
    datatype::{DataKeys, GraduationNFT, NFTError},
    interface::MintingOperations,
};
use soroban_sdk::{Address, Env, String, Symbol, Val, Vec, symbol_short, vec};

impl MintingOperations for AcademyGraduationNFT {
    /// Mints a graduation NFT for a recipient
    fn mint_graduation_nft(env: &Env, recipient: Address) -> Result<(), NFTError> {
        // Step 1: Authenticate the recipient
        recipient.require_auth();

        // Step 2: Check for existing NFT
        let nft_key = DataKeys::GraduationNFT(recipient.clone());
        if env.storage().persistent().has(&nft_key) {
            return Err(NFTError::AlreadyMinted);
        }

        // Step 3: Retrieve progress tracker address
        let progress_tracker = env
            .storage()
            .persistent()
            .get(&DataKeys::ProgressTracker)
            .ok_or(NFTError::Uninitialized)?;

        // Step 4: Verify module completion
        let function_name = Symbol::new(&env, "is_completed");
        let args: Vec<Val> = vec![&env, recipient.clone().to_val()];
        let is_completed: bool = env
            .try_invoke_contract::<bool, soroban_sdk::Error>(
                &progress_tracker,
                &function_name,
                args,
            )
            .unwrap_or(Ok(false))
            .unwrap();

        if !is_completed {
            return Err(NFTError::NotCompleted);
        }

        // Step 5: Retrieve badge tracker address
        let function_name = Symbol::new(&env, "is_completed");
        let badge_tracker = env
            .storage()
            .persistent()
            .get(&DataKeys::BadgeTracker)
            .ok_or(NFTError::Uninitialized)?;

        // Step 6: Fetch badges
        let badges = {
            let args = vec![&env, recipient.clone().to_val()];
            env.try_invoke_contract::<Vec<String>, soroban_sdk::Error>(
                &badge_tracker,
                &function_name,
                args,
            )
            .unwrap_or(Ok(Vec::new(&env)))
            .unwrap()
        };

        // Step 7: Create metadata
        let metadata = Self::create_nft_metadata(
            env.ledger().timestamp(),
            String::from_str(env, "v1.0"),
            badges,
        )?;

        // Step 8: Create and store NFT
        let nft = GraduationNFT {
            owner: recipient.clone(),
            metadata,
        };
        env.storage().persistent().set(&nft_key, &nft);

        // Step 9: Return success
        Ok(())
    }
}
