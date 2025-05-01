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

- `mark_lesson_complete`: Mark a lesson as completed for a user
- `get_completed_lessons`: Get list of completed lessons for a user in a chapter
- `get_chapter_completion_percent`: Get completion percentage for a chapter
- `is_chapter_complete`: Check if a chapter is fully completed
- `set_chapter_lessons`: Set total number of lessons in a chapter

## Events

- `lesson_completed`: Emitted when a lesson is completed
- `chapter_completed`: Emitted when all lessons in a chapter are completed 