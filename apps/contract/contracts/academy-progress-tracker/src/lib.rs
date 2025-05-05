#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, vec, Address, Env, Vec,
};

pub mod events;
pub mod errors;
#[cfg(feature = "testutils")]
pub mod testutils;
#[cfg(test)]
mod test;

use crate::events::{LessonCompletedEventData, ChapterCompletedEventData, LESSON, CHAPTER, COMPLETED};
use crate::errors::Error;

#[contracttype]
#[derive(Clone)]
enum DataKey {
    UserChapterProgress(Address, u32), // Stores progress by user and chapter
    ChapterLessons(u32),
}

#[contract]
pub struct ProgressTracker;

#[contractimpl]
impl ProgressTracker {
    pub fn mark_lesson_complete(
        env: Env,
        user: Address,
        chapter_id: u32,
        lesson_id: u32,
    ) -> Result<(), Error> {
        // Verify that the caller is the same as the specified user
        user.require_auth();

        // Check if the lesson is already completed
        let user_progress = env
            .storage()
            .persistent()
            .get::<DataKey, Vec<u32>>(&DataKey::UserChapterProgress(user.clone(), chapter_id))
            .unwrap_or(vec![&env]);

        if user_progress.contains(&lesson_id) {
            return Err(Error::LessonAlreadyCompleted);
        }

        // Get the total number of lessons in the chapter
        let total_lessons = env
            .storage()
            .persistent()
            .get::<DataKey, u32>(&DataKey::ChapterLessons(chapter_id))
            .unwrap_or(0);

        if lesson_id == 0 || lesson_id > total_lessons {
            return Err(Error::InvalidLessonId);
        }

        // Mark the lesson as completed
        let mut new_progress = user_progress.clone();
        new_progress.push_back(lesson_id);
        env.storage()
            .persistent()
            .set(&DataKey::UserChapterProgress(user.clone(), chapter_id), &new_progress);

        // Emit event
        env.events().publish(
            (LESSON, COMPLETED),
            LessonCompletedEventData {
                user: user.clone(),
                chapter_id,
                lesson_id,
            },
        );

        // Check if the chapter is complete
        if ProgressTracker::is_chapter_complete(env.clone(), user.clone(), chapter_id) {
            env.events().publish(
                (CHAPTER, COMPLETED),
                ChapterCompletedEventData {
                    user: user.clone(),
                    chapter_id,
                },
            );
        }

        Ok(())
    }

    pub fn get_completed_lessons(env: Env, user: Address, chapter_id: u32) -> Vec<u32> {
        env.storage()
            .persistent()
            .get::<DataKey, Vec<u32>>(&DataKey::UserChapterProgress(user, chapter_id))
            .unwrap_or(vec![&env])
    }

    pub fn get_chapter_completion_percent(env: Env, user: Address, chapter_id: u32) -> u32 {
        let completed_lessons = ProgressTracker::get_completed_lessons(env.clone(), user, chapter_id);
        let total_lessons = env
            .storage()
            .persistent()
            .get::<DataKey, u32>(&DataKey::ChapterLessons(chapter_id))
            .unwrap_or(0);

        if total_lessons == 0 {
            return 0;
        }

        (completed_lessons.len() as u32 * 100) / total_lessons
    }

    pub fn is_chapter_complete(env: Env, user: Address, chapter_id: u32) -> bool {
        let completed_lessons = ProgressTracker::get_completed_lessons(env.clone(), user, chapter_id);
        let total_lessons = env
            .storage()
            .persistent()
            .get::<DataKey, u32>(&DataKey::ChapterLessons(chapter_id))
            .unwrap_or(0);

        completed_lessons.len() as u32 == total_lessons
    }

    pub fn set_chapter_lessons(env: Env, chapter_id: u32, total_lessons: u32) {
        env.storage()
            .persistent()
            .set(&DataKey::ChapterLessons(chapter_id), &total_lessons);
    }
}
