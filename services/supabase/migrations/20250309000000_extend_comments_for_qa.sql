-- Define comment types for Q&A workflow using a safer idempotent approach
-- This enum supports the classification of comments into regular comments, questions, and answers
DO $$
BEGIN
  -- Check if the type already exists before attempting to create it
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comment_type') THEN
    CREATE TYPE comment_type AS ENUM ('comment', 'question', 'answer');
  END IF;
END
$$;

-- Enable RLS on comments table
ALTER TABLE comments
  ENABLE ROW LEVEL SECURITY;

-- Add type field using ENUM and metadata JSONB field (combined with NOT NULL for consistency)
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS type comment_type NOT NULL DEFAULT 'comment';

ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Backfill legacy Q&A comments
-- Note: For large tables, consider batching this update or running during low-traffic periods
UPDATE comments
SET type = CASE
  WHEN parent_comment_id IS NULL THEN 'question'
  ELSE 'answer'
END
WHERE type = 'comment';

-- Backfill existing question rows with a default status of 'new'
-- Note: For large tables, consider batching or monitoring with affected row counts
UPDATE comments
SET metadata = jsonb_set(metadata, '{status}', to_jsonb('new'), true)
WHERE type = 'question' AND (metadata->>'status' IS NULL);

-- Add validation for status values
-- Using NOT VALID initially to minimize locking on large tables
ALTER TABLE comments
  ADD CONSTRAINT chk_comments_metadata_status
  CHECK (
    type != 'question' OR 
    metadata->>'status' IN ('new', 'answered', 'resolved')
  ) NOT VALID;

-- Validate the constraint in a separate step (can be run later for large tables)
ALTER TABLE comments
  VALIDATE CONSTRAINT chk_comments_metadata_status;

-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_comments_type ON comments(type);
CREATE INDEX IF NOT EXISTS idx_comments_metadata_status ON comments((metadata->>'status')) 
  WHERE type = 'question';
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);
-- Add composite index for frequent question-answer queries
CREATE INDEX IF NOT EXISTS idx_comments_type_parent_id ON comments(type, parent_comment_id);
-- Add index for official-flag queries
CREATE INDEX IF NOT EXISTS idx_comments_is_official ON comments((metadata->>'is_official')) 
  WHERE type = 'answer';

-- Drop existing function if exists
DROP FUNCTION IF EXISTS update_question_status();

-- Create improved trigger function with null guard
CREATE OR REPLACE FUNCTION update_question_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Enhanced with null guard
  -- Note: This check duplicates the WHEN condition in the trigger for clarity and robustness
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
-- Note: The WHEN condition pre-filters events before function execution for efficiency
CREATE TRIGGER trigger_update_question_status
  AFTER INSERT ON comments
  FOR EACH ROW
  WHEN (NEW.type = 'answer')
  EXECUTE FUNCTION update_question_status();

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
    -- Only allow updates to the is_official flag (explicitly referencing the JSONB path)
    (OLD.metadata - 'is_official' = NEW.metadata - 'is_official') AND
    (OLD.metadata->>'is_official' IS DISTINCT FROM NEW.metadata->>'is_official') AND
    -- Ensure other fields remain unchanged
    OLD.content = NEW.content AND
    OLD.type = NEW.type AND
    OLD.parent_comment_id = NEW.parent_comment_id AND
    OLD.project_id = NEW.project_id
  );

-- Only question authors can update question status (restricted to status only)
CREATE POLICY update_question_status ON comments
  FOR UPDATE
  USING (
    type = 'question' AND
    author_id = auth.uid()
  )
  WITH CHECK (
    type = 'question' AND
    author_id = auth.uid() AND
    -- Only allow updates to the status field (explicitly referencing the JSONB path)
    (OLD.metadata - 'status' = NEW.metadata - 'status') AND
    (OLD.metadata->>'status' IS DISTINCT FROM NEW.metadata->>'status') AND
    -- Ensure other fields remain unchanged
    OLD.content = NEW.content AND
    OLD.type = NEW.type AND
    OLD.parent_comment_id = NEW.parent_comment_id AND
    OLD.project_id = NEW.project_id
  );