use soroban_sdk::{contracterror, panic_with_error, Env};

#[contracterror]
#[derive(Copy, Clone, Eq, PartialEq, Debug)]
pub enum Error {
    /// Returned when attempting to mark a lesson as completed that is already completed
    LessonAlreadyCompleted = 1,
    /// Returned when an invalid chapter ID is provided
    InvalidChapterId = 2,
    /// Returned when an invalid lesson ID is provided
    InvalidLessonId = 3,
    /// Returned when operations are performed for a user that doesn't exist
    UserNotFound = 4,
    /// Returned when an operation is attempted by an unauthorized user
    Unauthorized = 5,
    /// Returned when operations are performed on a chapter that doesn't exist
    ChapterNotFound = 6,
    /// Returned when invalid progress values are provided
    InvalidProgress = 7,
}

pub fn panic_with_error(env: &Env, error: Error) -> ! {
    panic_with_error!(env, error);
} 