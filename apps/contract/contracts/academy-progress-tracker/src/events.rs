use soroban_sdk::{contracttype, symbol_short, Address, Symbol};

pub const LESSON: Symbol = symbol_short!("LESSON");
pub const CHAPTER: Symbol = symbol_short!("CHAPTER");
pub const COMPLETED: Symbol = symbol_short!("COMPLETED");

#[contracttype]
#[derive(Clone)]
pub struct LessonCompletedEventData {
    pub user: Address,
    pub chapter_id: u32,
    pub lesson_id: u32,
}

#[contracttype]
#[derive(Clone)]
pub struct ChapterCompletedEventData {
    pub user: Address,
    pub chapter_id: u32,
} 