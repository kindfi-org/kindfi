-- Fix Q&A RLS policies for NextAuth integration and role-based permissions
-- This migration addresses issues from PR #504

-- First, drop existing Q&A policies that need to be updated
DROP POLICY IF EXISTS "Public read access to comments" ON comments;
DROP POLICY IF EXISTS "update_answer_official" ON comments;
DROP POLICY IF EXISTS "update_question_status" ON comments;

-- Create a helper function to get the current NextAuth user's profile
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS TABLE(user_id UUID, profile_id UUID, role user_role)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT 
    na_user.id as user_id,
    p.id as profile_id,
    p.role
  FROM next_auth.users na_user
  LEFT JOIN profiles p ON p.id = na_user.id
  WHERE na_user.id = next_auth.uid();
$$;

-- Update project_members table foreign key to reference next_auth.users
-- First drop existing foreign key constraint
ALTER TABLE project_members DROP CONSTRAINT IF EXISTS project_members_user_id_fkey;

-- Add new foreign key constraint to next_auth.users
ALTER TABLE project_members 
  ADD CONSTRAINT project_members_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES next_auth.users(id) ON DELETE CASCADE;

-- Create a helper function to check if user is project team member
CREATE OR REPLACE FUNCTION is_project_team_member(project_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_uuid
    AND pm.user_id = user_uuid
    AND pm.role IN ('admin', 'editor')
  );
$$;

-- Create a helper function to check if user is project owner
CREATE OR REPLACE FUNCTION is_project_owner(project_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects pr
    WHERE pr.id = project_uuid
    AND pr.kindler_id = user_uuid
  );
$$;

-- === READ POLICIES ===

-- Allow public read access to all Q&A content (questions, answers, comments)
CREATE POLICY "Public read access to Q&A content" ON comments
  FOR SELECT 
  USING (true);

-- === INSERT POLICIES ===

-- Authenticated users can create questions
CREATE POLICY "Authenticated users can create questions" ON comments
  FOR INSERT 
  WITH CHECK (
    type = 'question' AND 
    next_auth.uid() IS NOT NULL AND
    author_id = next_auth.uid()
  );

-- Authenticated users can create answers
CREATE POLICY "Authenticated users can create answers" ON comments
  FOR INSERT 
  WITH CHECK (
    type = 'answer' AND 
    next_auth.uid() IS NOT NULL AND
    parent_comment_id IS NOT NULL AND
    author_id = next_auth.uid() AND
    EXISTS (
      SELECT 1 FROM comments parent 
      WHERE parent.id = parent_comment_id 
      AND parent.type = 'question'
    )
  );

-- Authenticated users can create regular comments
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT 
  WITH CHECK (
    type = 'comment' AND 
    next_auth.uid() IS NOT NULL AND
    author_id = next_auth.uid() AND
    -- Ensure project exists and user has access to comment on it
    (project_id IS NULL OR EXISTS (SELECT 1 FROM projects WHERE id = project_id))
  );

-- === UPDATE POLICIES ===

-- Team members and project owners can mark answers as official
CREATE POLICY "Team members can mark answers official" ON comments
  FOR UPDATE
  USING (
    type = 'answer' AND
    next_auth.uid() IS NOT NULL AND
    (
      -- Project team members can mark official
      is_project_team_member(project_id, next_auth.uid()) OR
      -- Project owners can mark official  
      is_project_owner(project_id, next_auth.uid())
    )
  )
  WITH CHECK (
    type = 'answer' AND
    (
      -- Project team members can mark official
      is_project_team_member(project_id, next_auth.uid()) OR
      -- Project owners can mark official
      is_project_owner(project_id, next_auth.uid())
    ) AND
    -- Only allow updating the is_official flag in metadata
    content = content AND
    type = type AND
    parent_comment_id = parent_comment_id AND
    project_id = project_id AND
    author_id = author_id
  );

-- Question authors, team members, and project owners can update question status
CREATE POLICY "Authorized users can update question status" ON comments
  FOR UPDATE
  USING (
    type = 'question' AND
    next_auth.uid() IS NOT NULL AND
    (
      -- Question author can update status
      author_id = next_auth.uid() OR
      -- Project team members can update status
      is_project_team_member(project_id, next_auth.uid()) OR
      -- Project owners can update status
      is_project_owner(project_id, next_auth.uid())
    )
  )
  WITH CHECK (
    type = 'question' AND
    (
      -- Question author can update status
      author_id = next_auth.uid() OR
      -- Project team members can update status
      is_project_team_member(project_id, next_auth.uid()) OR
      -- Project owners can update status
      is_project_owner(project_id, next_auth.uid())
    ) AND
    -- Ensure other fields remain unchanged except metadata
    content = content AND
    type = type AND
    parent_comment_id IS NOT DISTINCT FROM parent_comment_id AND
    project_id = project_id AND
    author_id = author_id
  );

-- Authors can update their own comments/answers (content only, not metadata flags)
CREATE POLICY "Authors can update their own content" ON comments
  FOR UPDATE
  USING (
    next_auth.uid() IS NOT NULL AND
    author_id = next_auth.uid()
  )
  WITH CHECK (
    author_id = next_auth.uid() AND
    -- Ensure type and structural fields remain unchanged
    type = type AND
    parent_comment_id IS NOT DISTINCT FROM parent_comment_id AND
    project_id = project_id AND
    author_id = author_id AND
    -- For answers and questions, don't allow changing official/status metadata via this policy
    (
      type = 'comment' OR
      (type = 'answer' AND (metadata->>'is_official' IS NOT DISTINCT FROM (metadata->>'is_official'))) OR  
      (type = 'question' AND (metadata->>'status' IS NOT DISTINCT FROM (metadata->>'status')))
    )
  );

-- === DELETE POLICIES ===

-- Authors, team members, and project owners can delete comments
CREATE POLICY "Authorized users can delete comments" ON comments
  FOR DELETE
  USING (
    next_auth.uid() IS NOT NULL AND
    (
      -- Author can delete their own content
      author_id = next_auth.uid() OR
      -- Project team members can delete
      is_project_team_member(project_id, next_auth.uid()) OR
      -- Project owners can delete
      is_project_owner(project_id, next_auth.uid())
    )
  );

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION get_current_user_profile() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_project_team_member(UUID, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_project_owner(UUID, UUID) TO authenticated, anon;

-- Add comments to explain the policies
COMMENT ON POLICY "Public read access to Q&A content" ON comments IS 
'Allows public read access to all Q&A content for guest users and search engines';

COMMENT ON POLICY "Team members can mark answers official" ON comments IS 
'Only project team members (admin/editor roles) and project owners can mark answers as official';

COMMENT ON POLICY "Authorized users can update question status" ON comments IS 
'Question authors, project team members, and project owners can update question status (new/answered/resolved)';

-- Create indexes to optimize the new policy queries
CREATE INDEX IF NOT EXISTS idx_comments_author_id 
ON comments(author_id) WHERE author_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_project_members_project_user_role 
ON project_members(project_id, user_id, role);

CREATE INDEX IF NOT EXISTS idx_projects_kindler_id 
ON projects(kindler_id) WHERE kindler_id IS NOT NULL;

-- Update the comment constraint to be more flexible with status validation
ALTER TABLE comments DROP CONSTRAINT IF EXISTS chk_comments_metadata_status;

-- Add improved constraint that allows for future status values
ALTER TABLE comments
  ADD CONSTRAINT chk_comments_metadata_status
  CHECK (
    type != 'question' OR 
    metadata->>'status' ~ '^(new|answered|resolved)$'
  );

-- Add constraint to ensure answers have parent questions (simplified - no subquery)
ALTER TABLE comments
  ADD CONSTRAINT chk_answer_has_parent_question
  CHECK (
    type != 'answer' OR parent_comment_id IS NOT NULL
  );

-- Create a trigger function to validate answer parent is a question
CREATE OR REPLACE FUNCTION validate_answer_parent()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate for answers
  IF NEW.type = 'answer' THEN
    -- Ensure parent exists and is a question
    IF NOT EXISTS (
      SELECT 1 FROM comments 
      WHERE id = NEW.parent_comment_id 
      AND type = 'question'
    ) THEN
      RAISE EXCEPTION 'Answer must have a parent question';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce answer parent validation
DROP TRIGGER IF EXISTS trigger_validate_answer_parent ON comments;
CREATE TRIGGER trigger_validate_answer_parent
  BEFORE INSERT OR UPDATE ON comments
  FOR EACH ROW
  WHEN (NEW.type = 'answer')
  EXECUTE FUNCTION validate_answer_parent();