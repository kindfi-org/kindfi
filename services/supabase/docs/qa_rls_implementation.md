# Q&A RLS Implementation Guide

This document explains the implementation of Row Level Security (RLS) policies for the Q&A functionality, addressing the requirements from PR #504.

## Overview

The Q&A RLS implementation provides role-based access control for questions, answers, and comments while integrating with NextAuth authentication and project member roles.

## Key Changes

### 1. Migration: `20250822000000_fix_qa_rls_nextauth.sql`

**Fixes Applied:**

- ✅ Fixed author_id type comparison issue using proper UUID comparisons via profiles table
- ✅ Updated policies from `auth.uid()` to `next_auth.uid()` for NextAuth integration
- ✅ Added role-based permissions for project members (admin, editor)
- ✅ Integrated user roles (kinder, kindler) with project member roles
- ✅ Implemented proper guest access policies for public read access
- ✅ Removed temporary public policies in favor of proper RLS

**New Helper Functions:**

- `get_current_user_profile()`: Gets current user's profile and role information
- `is_project_team_member(project_id, user_id)`: Checks if user is a project team member
- `is_project_owner(project_id, user_id)`: Checks if user owns the project

### 2. Enhanced TypeScript Types

**File:** `apps/web/lib/types/qa/types.ts`

**Improvements:**

- Type-safe metadata structures for questions, answers, and comments
- Generic `TypedCommentData<T>` for comment type-specific data
- Separate types for `QuestionData`, `AnswerData`, `RegularCommentData`
- Role-based permission helper types

### 3. Permission Utilities

**File:** `apps/web/lib/utils/qa-permissions.ts`

**Client-side permission checks:**

- `canMarkAnswerOfficial()`: Check if user can mark answers as official
- `canResolveQuestion()`: Check if user can resolve questions
- `canCreateQAContent()`: Check if user can create Q&A content
- `canEditOwnContent()`: Check if user can edit their own content
- `canDeleteQAContent()`: Check if user can delete Q&A content

## RLS Policy Structure

### Read Policies

- **Public read access**: All users (including guests) can read questions, answers, and comments
- Enables guest browsing and search engine indexing

### Insert Policies

- **Authenticated users only**: Must be logged in via NextAuth to create content
- **Author verification**: Ensures `author_id` matches authenticated user's profile
- **Type-specific validation**: Questions, answers, and comments have appropriate constraints

### Update Policies

#### Answer Official Status

- **Who can mark official**: Project team members (admin/editor roles) and project owners
- **What can be updated**: Only the `is_official` flag in metadata
- **Restrictions**: Other fields must remain unchanged

#### Question Status Updates

- **Who can update**: Question authors, project team members, and project owners
- **What can be updated**: Status field in metadata (new → answered → resolved)
- **Restrictions**: Other fields must remain unchanged

#### Content Updates

- **Who can update**: Content authors only
- **What can be updated**: Content field only
- **Restrictions**: Cannot modify official/status flags through this policy

### Delete Policies

- **Who can delete**: Authors, project team members, and project owners
- Provides moderation capabilities for team members

## Role Hierarchy

### User Roles (from `user_role` enum)

- **kinder**: Basic user role
- **kindler**: Project creator role

### Project Member Roles (from `project_member_role` enum)

- **admin**: Full project management privileges
- **editor**: Content management privileges

### Permission Matrix

| Action               | Guest | Authenticated | Author | Team Member | Project Owner |
| -------------------- | ----- | ------------- | ------ | ----------- | ------------- |
| Read Q&A             | ✅    | ✅            | ✅     | ✅          | ✅            |
| Create Q&A           | ❌    | ✅            | ✅     | ✅          | ✅            |
| Edit Own Content     | ❌    | ❌            | ✅     | ✅          | ✅            |
| Mark Answer Official | ❌    | ❌            | ❌     | ✅          | ✅            |
| Resolve Questions    | ❌    | ❌            | ✅\*   | ✅          | ✅            |
| Delete Q&A           | ❌    | ❌            | ✅\*   | ✅          | ✅            |

\*Authors can only perform these actions on their own content

## Database Schema Changes

### New Constraints

- Improved question status validation: `^(new|answered|resolved)$`
- Answer parent validation: Answers must have parent questions
- Metadata type validation based on comment type

### New Indexes

- `idx_profiles_next_auth_user_id_author`: Optimizes author lookups
- `idx_project_members_project_user_role`: Optimizes role checks
- `idx_projects_kindler_id`: Optimizes project owner checks

## Usage Examples

### Client-Side Permission Checking

```typescript
import { canMarkAnswerOfficial, getUserRole } from "@/lib/utils/qa-permissions";

// Check if current user can mark an answer as official
const userRole = getUserRole(
  currentUser,
  projectId,
  projectMembers,
  projectOwnerId,
);
const canMarkOfficial = canMarkAnswerOfficial(userRole, projectId);
```

### Type-Safe Comment Handling

```typescript
import type { QuestionData, AnswerData } from "@/lib/types/qa/types";

// Type-safe question with proper metadata
const question: QuestionData = {
  // ... other fields
  type: "question",
  metadata: { status: "new" }, // Type-safe metadata
};

// Type-safe answer with proper metadata
const answer: AnswerData = {
  // ... other fields
  type: "answer",
  metadata: { is_official: true }, // Type-safe metadata
};
```

## Testing

### Migration Testing

Use `test_qa_rls_scenarios.sql` to validate:

1. Policy enforcement works correctly
2. Helper functions return expected results
3. Constraints prevent invalid data
4. Indexes are properly created

### Integration Testing

1. Test guest read access works
2. Verify authenticated user permissions
3. Validate team member privileges
4. Confirm project owner access
5. Test edge cases and error conditions

## Migration Path

1. **Apply Migration**: Run `20250822000000_fix_qa_rls_nextauth.sql`
2. **Update Code**: Use new TypeScript types and permission utilities
3. **Test Thoroughly**: Validate all permission scenarios
4. **Monitor**: Check for any performance impacts from new policies

## Performance Considerations

- New indexes optimize common permission check queries
- Helper functions use `STABLE SECURITY DEFINER` for efficiency
- Policies are designed to use existing indexes when possible
- Consider connection pooling for high-traffic scenarios

## Security Notes

- All policies enforce proper authentication via NextAuth
- Role-based access prevents privilege escalation
- Guest access is read-only and safe for public content
- Metadata updates are restricted to prevent unauthorized changes
- Helper functions use security definer to ensure consistent permission logic
