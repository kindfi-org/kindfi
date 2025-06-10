#![cfg(any(test, feature = "testutils"))]

use soroban_sdk::{
    Address, Env, IntoVal, Symbol, Vec,
};
use crate::ProgressTracker;

pub fn register_test_contract(e: &Env) -> Address {
    let contract_id = e.register_contract(None, ProgressTracker);
    contract_id
}

pub struct ProgressTrackerClient<'a> {
    env: &'a Env,
    contract_id: &'a Address,
}

impl<'a> ProgressTrackerClient<'a> {
    pub fn new(env: &'a Env, contract_id: &'a Address) -> Self {
        Self { env, contract_id }
    }

    pub fn mark_lesson_complete(&self, user: &Address, chapter_id: &u32, lesson_id: &u32) {
        let args = (user, chapter_id, lesson_id).into_val(self.env);
        self.env
            .invoke_contract::<()>(self.contract_id, &Symbol::new(self.env, "mark_lesson_complete"), args);
    }

    pub fn get_completed_lessons(&self, user: &Address, chapter_id: &u32) -> Vec<u32> {
        let args = (user, chapter_id).into_val(self.env);
        self.env.invoke_contract::<Vec<u32>>(self.contract_id, &Symbol::new(self.env, "get_completed_lessons"), args)
    }

    pub fn set_chapter_lessons(&self, admin: &Address, chapter_id: &u32, total_lessons: &u32) {
        let args = (admin, chapter_id, total_lessons).into_val(self.env);
        self.env.invoke_contract::<()>(self.contract_id, &Symbol::new(self.env, "set_chapter_lessons"), args);
    }
} 