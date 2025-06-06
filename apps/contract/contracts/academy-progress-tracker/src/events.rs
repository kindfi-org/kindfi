use soroban_sdk::{contracttype, symbol_short, Address, Symbol};

pub const LESSON: Symbol = symbol_short!("LESSON");
pub const CHAPTER: Symbol = symbol_short!("CHAPTER");
pub const COMPLETED: Symbol = symbol_short!("COMPLETED");
pub const UPDATED: Symbol = symbol_short!("UPDATED");

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LessonCompletedEventData {
    pub user: Address,
    pub chapter_id: u32,
    pub lesson_id: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ChapterCompletedEventData {
    pub user: Address,
    pub chapter_id: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ChapterUpdatedEventData {
    pub chapter_id: u32,
    pub total_lessons: u32,
}