# Project Updates Table Schema Documentation

## Overview
The `project_updates` table stores updates related to project progress and is linked to community notifications.

## Columns
| Column      | Type                              | Constraints                         | Description                             |
|-------------|-----------------------------------|-------------------------------------|-----------------------------------------|
| id          | UUID                              | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for each update     |
| project_id  | UUID                              | NOT NULL, FOREIGN KEY               | References the related project          |
| title       | TEXT                              | NOT NULL                           | Title of the update                     |
| content     | TEXT                              | Optional                           | Detailed update information             |
| creator_id  | UUID                              | NOT NULL, FOREIGN KEY               | ID of the user who created the update   |
| created_at  | TIMESTAMP WITH TIME ZONE          | DEFAULT NOW()                      | Creation timestamp                      |
| updated_at  | TIMESTAMP WITH TIME ZONE          | DEFAULT NOW()                      | Last updated timestamp                  |

## Relationships
- **One-to-Many:** Each project can have multiple updates.
- **One-to-Many:** Each update can have multiple comments (handled in another table).
- **Many-to-Many:** Updates can be linked to multiple kindlers via the `project_update_notifications` join table.

## Row-Level Security (RLS)
- Users can only access updates where they are the creator unless they have an admin role.

## Indexes
- Index on `project_id` and `creator_id` for performance optimization.
