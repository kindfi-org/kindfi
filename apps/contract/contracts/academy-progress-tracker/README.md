# Academy Progress Tracker Contract

A Soroban smart contract for tracking student progress in an academy setting.

## Features

- Track lesson completion by user and chapter
- Calculate chapter completion percentage
- Emit events for lesson and chapter completion
- Prevent duplicate lesson completion

## Building the Contract

You can build the contract in two ways:

1. From the contract directory:

```bash
cd contracts/academy-progress-tracker
stellar contract build
```

2. From the project root:

```bash
stellar contract build --manifest-path ./contracts/academy-progress-tracker/Cargo.toml
```

## Testing

To run the tests:

```bash
cargo test --features testutils
```

## Contract Functions

- `mark_lesson_complete(user: Address, chapter_id: u32, lesson_id: u32) -> Result<(), Error>`
  Mark a lesson as completed for a user. Returns error if lesson is already completed or invalid.

- `get_completed_lessons(user: Address, chapter_id: u32) -> Vec<u32>`
  Get list of completed lessons for a user in a chapter. Returns empty vector if no lessons completed.

- `get_chapter_completion_percent(user: Address, chapter_id: u32) -> u32`
  Get completion percentage for a chapter. Returns 0 if chapter has no lessons.

- `is_chapter_complete(user: Address, chapter_id: u32) -> bool`
  Check if a chapter is fully completed. Returns true if all lessons are completed.

- `set_chapter_lessons(chapter_id: u32, total_lessons: u32)`
  Set total number of lessons in a chapter.

## Events

- `lesson_completed`: Emitted when a lesson is completed

  ```rust
  pub struct LessonCompletedEventData {
      pub user: Address,
      pub chapter_id: u32,
      pub lesson_id: u32,
  }
  ```

- `chapter_completed`: Emitted when all lessons in a chapter are completed
  ```rust
  pub struct ChapterCompletedEventData {
      pub user: Address,
      pub chapter_id: u32,
  }
  ```

## Error Handling

The contract defines several error types to handle various failure scenarios:

- `LessonAlreadyCompleted`: When trying to complete a lesson that's already done
- `InvalidChapterId`: When the provided chapter ID is invalid
- `InvalidLessonId`: When the lesson ID is 0 or greater than total lessons
- `UserNotFound`: When operations are performed for a non-existent user
- `Unauthorized`: When an operation is attempted by an unauthorized user
- `ChapterNotFound`: When operations target a non-existent chapter
- `InvalidProgress`: When invalid progress values are provided
