#![cfg(feature = "testutils")]

use soroban_sdk::{Env, Address, BytesN, Symbol, IntoVal, Val, Vec};
use crate::ProgressTracker;

pub fn register_test_contract(e: &Env) -> Address {
    let contract_id = BytesN::from_array(e, &[0; 32]);
    e.register_contract(&contract_id, ProgressTracker);
    Address::from_contract_id(e, &contract_id)
}

pub struct ProgressTrackerClient {
    env: Env,
    contract_id: Address,
}

impl ProgressTrackerClient {
    pub fn new(env: &Env, contract_id: &Address) -> Self {
        Self {
            env: env.clone(),
            contract_id: contract_id.clone(),
        }
    }

    pub fn mark_lesson_complete(&self, user: &Address, chapter_id: &u32, lesson_id: &u32) {
        let args = (user, chapter_id, lesson_id).into_val(&self.env);
        self.env.invoke_contract(&self.contract_id, &Symbol::new(&self.env, "mark_lesson_complete"), args);
    }

    pub fn get_completed_lessons(&self, user: &Address, chapter_id: &u32) -> Vec<u32> {
        let args = (user, chapter_id).into_val(&self.env);
        self.env.invoke_contract(&self.contract_id, &Symbol::new(&self.env, "get_completed_lessons"), args)
    }

    pub fn set_chapter_lessons(&self, chapter_id: &u32, total_lessons: &u32) {
        let args = (chapter_id, total_lessons).into_val(&self.env);
        self.env.invoke_contract(&self.contract_id, &Symbol::new(&self.env, "set_chapter_lessons"), args);
    }
} 