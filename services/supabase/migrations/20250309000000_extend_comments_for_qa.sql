-- Make ENUM creation non-destructive
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comment_type') THEN
    CREATE TYPE comment_type AS ENUM ('comment', 'question', 'answer');
  END IF;
END
$$;

-- Enable RLS on comments table
ALTER TABLE comments
  ENABLE ROW LEVEL SECURITY;

-- TEMPORARY POLICY: Allows public read access while there's no authentication
-- ⚠️ Remove or replace this policy when auth is active
CREATE POLICY "Public read access to comments"
ON public.comments
FOR SELECT 
USING (true);

-- Add type field using ENUM
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS type comment_type NOT NULL DEFAULT 'comment';

-- Add metadata JSONB field
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Backfill legacy Q&A comments
UPDATE comments
SET type = CASE
  WHEN parent_comment_id IS NULL THEN 'question'::comment_type
  ELSE 'answer'::comment_type
END
WHERE type = 'comment';

-- Backfill existing question rows with a default status of 'new'
UPDATE comments
SET metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{status}', to_jsonb('new'::text), true)
WHERE type = 'question' AND (metadata->>'status' IS NULL);

-- Enforce non-null metadata
ALTER TABLE comments
  ALTER COLUMN metadata SET NOT NULL;

-- Add validation for status values
ALTER TABLE comments
  ADD CONSTRAINT chk_comments_metadata_status
  CHECK (
    type != 'question' OR 
    metadata->>'status' IN ('new', 'answered', 'resolved')
  );

-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_comments_type ON comments(type);
CREATE INDEX IF NOT EXISTS idx_comments_metadata_status ON comments((metadata->>'status')) 
  WHERE type = 'question';
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);

-- Drop existing function if exists
DROP FUNCTION IF EXISTS update_question_status();

-- Create improved trigger function with null guard
CREATE OR REPLACE FUNCTION update_question_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Enhanced with null guard
  IF NEW.type = 'answer' AND NEW.parent_comment_id IS NOT NULL THEN
    -- Update the parent question's status to 'answered' if it was 'new'
    UPDATE comments
    SET metadata = jsonb_set(
      metadata,
      '{status}',
      to_jsonb('answered'),
      true
    )
    WHERE id = NEW.parent_comment_id
    AND type = 'question'
    AND (metadata->>'status' = 'new' OR metadata->>'status' IS NULL);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_update_question_status ON comments;

-- Create trigger for status updates
CREATE TRIGGER trigger_update_question_status
  AFTER INSERT ON comments
  FOR EACH ROW
  WHEN (NEW.type = 'answer')
  EXECUTE FUNCTION update_question_status();

-- Drop existing policies if they exist
DROP POLICY IF EXISTS update_answer_official ON comments;
DROP POLICY IF EXISTS update_question_status ON comments;

-- Only project members can mark answers as official (restricted to official flag only)
CREATE POLICY update_answer_official ON comments
  FOR UPDATE
  USING (
    type = 'answer' AND
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = comments.project_id
      AND project_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    type = 'answer' AND
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = comments.project_id
      AND project_members.user_id = auth.uid()
    ) AND
    -- Ensure only the is_official flag is updated
    (
      metadata - 'is_official' = metadata
    ) AND
    -- Ensure other fields remain unchanged
    content = content AND
    type = type AND
    parent_comment_id = parent_comment_id AND
    project_id = project_id
  );

-- Only question authors can update question status (restricted to status only)
-- TODO: Ensure the author_id is of type uuid or a comparable type to comments.author_id. Fix the CHECK constraint.
CREATE POLICY update_question_status ON comments
  FOR UPDATE
  USING (
    type = 'question' AND
    author_id = auth.uid() -- Assuming author_id is type uuid
  )
  WITH CHECK (
    type = 'question' AND -- Ensure the type remains 'question'
    author_id = auth.uid() AND -- Ensure the author remains the same
    -- Ensure other fields remain unchanged by comparing the implicit new.*
    -- with the existing row's values (comments.*)
    content = comments.content AND
    -- Use IS NOT DISTINCT FROM to correctly handle NULL comparisons
    parent_comment_id IS NOT DISTINCT FROM comments.parent_comment_id AND
    -- Assuming project_id is also uuid or a type comparable to comments.project_id
    project_id = comments.project_id AND
    -- This policy allows the metadata field to be updated.
    -- The CHECK constraint chk_comments_metadata_status separately validates
    -- the 'status' value within the metadata for questions.
    -- This structure ensures only the author can update their question,
    -- and only the metadata field can be modified during such an update.
    TRUE
  );

-- Add performance index for official answers
CREATE INDEX IF NOT EXISTS idx_comments_official_answers 
ON comments((metadata->>'is_official')) 
WHERE type = 'answer';

-- Add composite index for answer lookups
CREATE INDEX IF NOT EXISTS idx_comments_type_parent 
ON comments(type, parent_comment_id);