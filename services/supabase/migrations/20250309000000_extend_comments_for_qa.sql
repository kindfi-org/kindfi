-- Make ENUM creation idempotent
DROP TYPE IF EXISTS comment_type;
CREATE TYPE comment_type AS ENUM ('comment', 'question', 'answer');

-- Enable RLS on comments table
ALTER TABLE comments
  ENABLE ROW LEVEL SECURITY;

-- Add type field using ENUM
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS type comment_type NOT NULL DEFAULT 'comment';

-- Add metadata JSONB field
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Backfill legacy Q&A comments
UPDATE comments
SET type = CASE
  WHEN parent_comment_id IS NULL THEN 'question'
  ELSE 'answer'
END
WHERE type = 'comment';

-- Backfill existing question rows with a default status of 'new'
UPDATE comments
SET metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{status}', to_jsonb('new'), true)
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

-- Only project members can mark answers as official (restricted to official flag only)
-- Tightened RLS to prevent unintended changes
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
    -- Only allow updates to the is_official flag
    (OLD.metadata - 'is_official' = NEW.metadata - 'is_official') AND
    -- Ensure other fields remain unchanged
    OLD.content = NEW.content AND
    OLD.type = NEW.type AND
    OLD.parent_comment_id = NEW.parent_comment_id AND
    OLD.project_id = NEW.project_id
  );

-- Only question authors can update question status (restricted to status only)
-- Prevent unintended project transfers
CREATE POLICY update_question_status ON comments
  FOR UPDATE
  USING (
    type = 'question' AND
    author_id = auth.uid()
  )
  WITH CHECK (
    type = 'question' AND
    author_id = auth.uid() AND
    -- Only allow updates to the status field
    (OLD.metadata - 'status' = NEW.metadata - 'status') AND
    -- Ensure other fields remain unchanged
    OLD.content = NEW.content AND
    OLD.type = NEW.type AND
    OLD.parent_comment_id = NEW.parent_comment_id AND
    OLD.project_id = NEW.project_id
  );