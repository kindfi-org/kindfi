use crate::errors::NFTError;
use soroban_sdk::{contracttype, symbol_short, Address, Env, Map, Symbol, Vec};

#[contracttype]
#[derive(Clone)]
pub enum RateLimitDataKey {
    Limits(Symbol),                      // Operation -> limit per time window
    WindowDuration(Symbol),              // Operation -> time window in ledgers
    UserOperationCount(Address, Symbol), // User, Operation -> count
    UserLastOperation(Address, Symbol),  // User, Operation -> ledger sequence
}

pub struct RateLimiter;

impl RateLimiter {
    // Set a rate limit for an operation
    pub fn set_limit(env: &Env, operation: Symbol, limit: u32, window_ledgers: u32) {
        env.storage()
            .instance()
            .set(&RateLimitDataKey::Limits(operation.clone()), &limit);
        env.storage().instance().set(
            &RateLimitDataKey::WindowDuration(operation),
            &window_ledgers,
        );
    }

    // Check if an operation would exceed the rate limit
    pub fn check_rate_limit(env: &Env, user: &Address, operation: Symbol) -> Result<(), NFTError> {
        // Get the limit for this operation
        let limit: Option<u32> = env
            .storage()
            .instance()
            .get(&RateLimitDataKey::Limits(operation.clone()));

        // If no limit is set, allow the operation
        if limit.is_none() {
            return Ok(());
        }

        let limit = limit.unwrap();
        let window_ledgers: u32 = env
            .storage()
            .instance()
            .get(&RateLimitDataKey::WindowDuration(operation.clone()))
            .unwrap_or(100); // Default to 100 ledgers if not set

        // Get current ledger sequence
        let current_ledger = env.ledger().sequence();

        // Get the user's last operation time
        let last_operation: Option<u32> =
            env.storage()
                .instance()
                .get(&RateLimitDataKey::UserLastOperation(
                    user.clone(),
                    operation.clone(),
                ));

        let count: u32 = match last_operation {
            Some(last_ledger) => {
                // If we're still in the same time window
                if current_ledger < last_ledger + window_ledgers {
                    // Get the current count
                    let current_count: u32 = env
                        .storage()
                        .instance()
                        .get(&RateLimitDataKey::UserOperationCount(
                            user.clone(),
                            operation,
                        ))
                        .unwrap_or(0);

                    current_count
                } else {
                    // New time window, reset count
                    0
                }
            }
            None => 0, // First operation
        };

        // Check if the operation would exceed the limit
        if count >= limit {
            return Err(NFTError::RateLimitExceeded);
        }

        Ok(())
    }

    // Record an operation for rate limiting
    pub fn record_operation(env: &Env, user: &Address, operation: Symbol) {
        // Get current ledger sequence
        let current_ledger = env.ledger().sequence();

        // Get the user's last operation time
        let last_operation: Option<u32> =
            env.storage()
                .instance()
                .get(&RateLimitDataKey::UserLastOperation(
                    user.clone(),
                    operation.clone(),
                ));

        let window_ledgers: u32 = env
            .storage()
            .instance()
            .get(&RateLimitDataKey::WindowDuration(operation.clone()))
            .unwrap_or(100); // Default to 100 ledgers if not set

        let new_count = match last_operation {
            Some(last_ledger) => {
                // If we're still in the same time window
                if current_ledger < last_ledger + window_ledgers {
                    // Increment the current count
                    let current_count: u32 = env
                        .storage()
                        .instance()
                        .get(&RateLimitDataKey::UserOperationCount(
                            user.clone(),
                            operation,
                        ))
                        .unwrap_or(0);

                    current_count + 1
                } else {
                    // New time window, reset count to 1
                    1
                }
            }
            None => 1, // First operation
        };

        // Update storage
        env.storage().instance().set(
            &RateLimitDataKey::UserOperationCount(user.clone(), operation.clone()),
            &new_count,
        );

        env.storage().instance().set(
            &RateLimitDataKey::UserLastOperation(user.clone(), operation),
            &current_ledger,
        );
    }
}
