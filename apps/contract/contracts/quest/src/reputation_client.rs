use soroban_sdk::{Address, ConversionError, Env, IntoVal, InvokeError, Symbol};

/// Client for interacting with the Reputation contract.
pub struct ReputationClient;

impl ReputationClient {
    /// Record a quest completion event in the reputation contract.
    /// 
    /// # Arguments
    /// * `e` - The environment
    /// * `reputation_contract` - Address of the reputation contract
    /// * `caller` - Address making the call (must have recorder role)
    /// * `user` - User who completed the quest
    /// 
    /// # Returns
    /// * `Some(u32)` - New total points if successful
    /// * `None` - If the call failed
    pub fn record_quest_completion(
        e: &Env,
        reputation_contract: &Address,
        caller: &Address,
        user: &Address,
    ) -> Option<u32> {
        // Call reputation contract's record_event function
        // EventType::QuestCompletion = 5
        let event_type: u32 = 5;
        
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
