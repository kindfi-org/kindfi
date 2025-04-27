-- Create ENUM type for comment types
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

-- Add CHECK constraint for valid status values
ALTER TABLE comments
  ADD CONSTRAINT valid_question_status 
  CHECK (
    type != 'question' OR 
    metadata->>'status' IN ('new', 'answered', 'resolved')
  );

-- Backfill existing comments with default status
UPDATE comments 
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{status}', '"new"')
WHERE type = 'question' 
AND (metadata->>'status' IS NULL);

-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_comments_type ON comments(type);
CREATE INDEX IF NOT EXISTS idx_comments_metadata_status ON comments((metadata->>'status')) 
  WHERE type = 'question';
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_question_status();
DROP FUNCTION IF EXISTS handle_official_answer();

-- Create improved trigger function for answer updates
CREATE OR REPLACE FUNCTION update_question_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'answer' THEN
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

-- Create function to handle official answer updates
CREATE OR REPLACE FUNCTION handle_official_answer()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'answer' 
  AND NEW.metadata->>'is_official' = 'true' 
  AND (OLD.metadata->>'is_official' IS NULL OR OLD.metadata->>'is_official' = 'false') THEN
    -- Mark parent question as resolved when answer becomes official
    UPDATE comments
    SET metadata = jsonb_set(
      metadata,
      '{status}',
      to_jsonb('resolved'),
      true
    )
    WHERE id = NEW.parent_comment_id
    AND type = 'question';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_question_status ON comments;
DROP TRIGGER IF EXISTS trigger_handle_official_answer ON comments;

-- Create triggers for status updates
CREATE TRIGGER trigger_update_question_status
  AFTER INSERT ON comments
  FOR EACH ROW
  WHEN (NEW.type = 'answer')
  EXECUTE FUNCTION update_question_status();

CREATE TRIGGER trigger_handle_official_answer
  AFTER UPDATE ON comments
  FOR EACH ROW
  WHEN (NEW.type = 'answer' AND NEW.metadata->>'is_official' = 'true')
  EXECUTE FUNCTION handle_official_answer();

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
    -- Only allow updates to the is_official flag
    (OLD.metadata - 'is_official' = NEW.metadata - 'is_official')
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
    -- Only allow updates to the status field
    (OLD.metadata - 'status' = NEW.metadata - 'status') AND
    -- Ensure other fields remain unchanged
    OLD.content = NEW.content AND
    OLD.type = NEW.type AND
    OLD.parent_comment_id = NEW.parent_comment_id
  );