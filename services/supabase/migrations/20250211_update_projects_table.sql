-- Add new fields to projects table for updates and notifications
ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS update_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_update_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS next_milestone_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS milestone_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"email": true, "push": true}'::jsonb,
    ADD COLUMN IF NOT EXISTS update_categories TEXT[] DEFAULT ARRAY['milestone', 'progress', 'announcement', 'general'];

-- Create an index for performance on commonly queried fields
CREATE INDEX IF NOT EXISTS idx_projects_last_update ON projects(last_update_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_next_milestone ON projects(next_milestone_date);

-- Create a function to update the project's update statistics
CREATE OR REPLACE FUNCTION update_project_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment update count
        UPDATE projects 
        SET update_count = update_count + 1,
            last_update_at = NEW.created_at,
            milestone_count = CASE 
                WHEN NEW.update_type = 'milestone' 
                THEN milestone_count + 1 
                ELSE milestone_count 
            END
        WHERE id = NEW.project_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to maintain project statistics
DROP TRIGGER IF EXISTS project_stats_trigger ON project_updates;
CREATE TRIGGER project_stats_trigger
    AFTER INSERT ON project_updates
    FOR EACH ROW
    EXECUTE FUNCTION update_project_stats();

-- Add comment for documentation
COMMENT ON TABLE projects IS 'Projects table enhanced with update tracking and notification settings';
