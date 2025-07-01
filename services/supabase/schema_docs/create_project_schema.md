# Project Schema Design Documentation

## Overview

This document describes the design of the `projects` table for kindif. The table is designed to store all essential information related to investment projects, while maintaining data integrity and security through appropriate constraints and policies.

## Table Structure

### projects

The central table storing all project information.

| Column Name         | Data Type                | Constraints                              | Description                         |
| ------------------- | ------------------------ | ---------------------------------------- | ----------------------------------- |
| id                  | UUID                     | PK, NOT NULL, DEFAULT uuid_generate_v4() | Unique identifier for each project  |
| title               | TEXT                     | NOT NULL                                 | Project title                       |
| description         | TEXT                     |                                          | Detailed project description        |
| current_amount      | NUMERIC(12,2)            | NOT NULL, DEFAULT 0                      | Current funds raised                |
| target_amount       | NUMERIC(12,2)            | NOT NULL, CHECK > 0                      | Total funding goal                  |
| min_investment      | NUMERIC(12,2)            | NOT NULL, CHECK <= target_amount         | Minimum allowed investment amount   |
| percentage_complete | NUMERIC(5,2)             | NOT NULL, DEFAULT 0                      | Percentage of funding goal achieved |
| kinder_count        | INTEGER                  | NOT NULL, DEFAULT 0                      | Number of unique investors          |
| created_at          | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP                | When project was created            |
| updated_at          | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP                | When project was last updated       |
| category_id         | TEXT                     |                                          | References future categories table  |
| image_url           | TEXT                     |                                          | URL to project cover image          |
| owner_id            | UUID                     | NOT NULL, FK to auth.users(id)           | Project creator reference           |

## Constraints and Indices

### Primary Key

- `projects_pkey` on `id` column

### Foreign Keys

- `projects_owner_id_fkey`: Links `owner_id` to `auth.users(id)`

### Check Constraints

- `check_min_investment_less_than_target`: Ensures minimum investment doesn't exceed the target amount
- `check_positive_target_amount`: Ensures target amount is greater than zero

### Indices

- `idx_projects_category_id`: Optimizes queries filtering by category
- `idx_projects_owner_id`: Optimizes queries filtering by owner

## Triggers

- `update_projects_modtime`: Updates the `updated_at` timestamp whenever a project record is modified

## Row Level Security (RLS) Policies

RLS is enabled on the table with the following policies:

### Creation Policy

```sql
policy "Allow authenticated users to create projects"
  on "public"."projects"
  as permissive
  for insert
  to public
  with check ((auth.role() = 'authenticated'::text) AND (auth.uid() = owner_id));
```

_Only authenticated users can create projects, and they must be set as the owner._

### Update Policy

```sql
policy "Allow project owners to update their projects"
  on "public"."projects"
  as permissive
  for update
  to public
  using ((auth.uid() = owner_id));
```

_Only project owners can update their own projects._

### Read Policy

```sql
policy "Allow public read access to projects"
  on "public"."projects"
  as permissive
  for select
  to public
  using (true);
```

_All users (including anonymous) can view project details._

## Future Relationships

The table is designed to integrate with several other tables that will be created in separate tasks:

1. **Categories**: Will be linked via the `category_id` column (currently TEXT type)
2. **Project Tags**: Will be implemented through a junction table
3. **Project Updates**: Will reference back to projects
4. **Project Investors**: Will track investments in projects

## Implementation Notes

- The `category_id` is defined as TEXT to accommodate future integration with a categories table.
- Automated calculations for `percentage_complete` and `kinder_count` will be handled by triggers when the investor table is implemented.
- The schema uses appropriate numeric precision (12,2) for monetary values to handle amounts up to 10 billion with 2 decimal places.
