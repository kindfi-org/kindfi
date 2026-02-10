use soroban_sdk::{Address, ConversionError, Env, IntoVal, InvokeError, Symbol};

/// Client for interacting with the Reputation contract.
pub struct ReputationClient;

impl ReputationClient {
    /// Record a streak donation event in the reputation contract.
    /// 
    /// # Arguments
    /// * `e` - The environment
    /// * `reputation_contract` - Address of the reputation contract
    /// * `caller` - Address making the call (must have recorder role)
    /// * `user` - User who maintained the streak
    /// 
    /// # Returns
    /// * `Some(u32)` - New total points if successful
    /// * `None` - If the call failed
    pub fn record_streak_donation(
        e: &Env,
        reputation_contract: &Address,
        caller: &Address,
        user: &Address,
    ) -> Option<u32> {
        // Call reputation contract's record_event function
        // EventType::StreakDonation = 1
        let event_type: u32 = 1;
        
        let result: Result<Result<u32, ConversionError>, Result<InvokeError, InvokeError>> =
            e.try_invoke_contract(
                reputation_contract,
                &Symbol::new(e, "record_event"),
                (caller, user, event_type).into_val(e),
            );

        match result {
            Ok(Ok(points)) => Some(points),
            _ => None,
        }
    }
}
