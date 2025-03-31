DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('general', 'project_update', 'mention');
    ELSE
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
            AND enumlabel = 'project_update'
        ) THEN
            ALTER TYPE notification_type ADD VALUE 'project_update';
        END IF;
    END IF;
END $$;


ALTER TABLE notifications 
  ADD COLUMN IF NOT EXISTS type notification_type NOT NULL DEFAULT 'general';

ALTER TABLE notifications 
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;


CREATE OR REPLACE FUNCTION notify_project_update()
RETURNS TRIGGER AS $$
BEGIN

    INSERT INTO notifications (user_id, type, project_id, title, content)
    SELECT 
        pm.user_id,
        'project_update',
        NEW.project_id,
        'Project Update: ' || NEW.title,
        NEW.content
    FROM project_members pm
    WHERE pm.project_id = NEW.project_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS project_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT proper_title CHECK (char_length(title) > 0)
);


CREATE INDEX IF NOT EXISTS project_updates_project_id_idx ON project_updates(project_id);
CREATE INDEX IF NOT EXISTS project_updates_creator_id_idx ON project_updates(creator_id);

ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project creators can view their own updates"
ON project_updates FOR SELECT 
USING (
    auth.uid() IN (
        SELECT creator_id FROM projects WHERE id = project_id
    )
);

CREATE POLICY "Project members can view project updates"
ON project_updates FOR SELECT 
USING (
    auth.uid() IN (
        SELECT user_id FROM project_members WHERE project_id = project_updates.project_id
    )
);


CREATE POLICY "Project creators can create updates"
ON project_updates FOR INSERT 
WITH CHECK (
    auth.uid() IN (
        SELECT creator_id FROM projects WHERE id = project_id
    )
);

CREATE POLICY "Project creators can update their updates"
ON project_updates FOR UPDATE 
USING (
    auth.uid() IN (
        SELECT creator_id FROM projects WHERE id = project_id
    )
);

CREATE POLICY "Project creators can delete their updates"
ON project_updates FOR DELETE 
USING (
    auth.uid() IN (
        SELECT creator_id FROM projects WHERE id = project_id
    )
);

CREATE TRIGGER project_update_notification
AFTER INSERT ON project_updates
FOR EACH ROW
EXECUTE FUNCTION notify_project_update();

COMMENT ON TABLE project_updates IS 'Stores project update history and announcements';
COMMENT ON COLUMN project_updates.project_id IS 'References the project this update belongs to';
COMMENT ON COLUMN project_updates.creator_id IS 'User who created the update';
COMMENT ON COLUMN project_updates.title IS 'Title of the project update';
COMMENT ON COLUMN project_updates.content IS 'Content of the project update';
