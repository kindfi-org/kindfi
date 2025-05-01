use soroban_sdk::{contracterror, panic_with_error, Env};

#[contracterror]
#[derive(Copy, Clone, Eq, PartialEq, Debug)]
pub enum Error {
    LessonAlreadyCompleted = 1,
    InvalidChapterId = 2,
    InvalidLessonId = 3,
    UserNotFound = 4,
    Unauthorized = 5,
    ChapterNotFound = 6,
    InvalidProgress = 7,
}

pub fn panic_with_error(env: &Env, error: Error) -> ! {
    panic_with_error!(env, error);
} 