use crate::access::{AccessControl, DEFAULT_ADMIN_ROLE};
use crate::errors::NFTError;
use soroban_sdk::{contracttype, symbol_short, Address, Env, Symbol};
use stellar_pausable::{Pausable, PausableError};

pub const PAUSE_KEY: Symbol = symbol_short!("PAUSE");

#[contracttype]
#[derive(Clone)]
pub enum PauseOperation {
    MintPause,
    TransferPause,
    MetadataPause,
    GlobalPause,
}

pub struct NFTPausable;

impl NFTPausable {
    // Initialize pausable states
    pub fn initialize(env: &Env) {
        // Initialize with all operations active (not paused)
        env.storage()
            .instance()
            .set(&PauseOperation::MintPause, &false);
        env.storage()
            .instance()
            .set(&PauseOperation::TransferPause, &false);
        env.storage()
            .instance()
            .set(&PauseOperation::MetadataPause, &false);
        env.storage()
            .instance()
            .set(&PauseOperation::GlobalPause, &false);
    }

    // Check if an operation is paused
    pub fn is_paused(env: &Env, operation: &PauseOperation) -> bool {
        // Global pause overrides all other pause states
        let global_paused: bool = env
            .storage()
            .instance()
            .get(&PauseOperation::GlobalPause)
            .unwrap_or(false);

        if global_paused {
            return true;
        }

        // Check operation-specific pause state
        env.storage().instance().get(operation).unwrap_or(false)
    }

    // Pause an operation
    pub fn pause(env: &Env, operation: &PauseOperation, account: &Address) -> Result<(), NFTError> {
        // Check if the caller has admin role
        AccessControl::require_role(env, DEFAULT_ADMIN_ROLE, account)?;

        // Set pause state
        env.storage().instance().set(operation, &true);

        Ok(())
    }

    // Unpause an operation
    pub fn unpause(
        env: &Env,
        operation: &PauseOperation,
        account: &Address,
    ) -> Result<(), NFTError> {
        // Check if the caller has admin role
        AccessControl::require_role(env, DEFAULT_ADMIN_ROLE, account)?;

        // Set pause state
        env.storage().instance().set(operation, &false);

        Ok(())
    }

    // Require that an operation is not paused
    pub fn require_not_paused(env: &Env, operation: &PauseOperation) -> Result<(), NFTError> {
        if Self::is_paused(env, operation) {
            return Err(NFTError::Paused);
        }

        Ok(())
    }
}
