-- Create project_updates table
CREATE TABLE project_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    update_type VARCHAR(50) NOT NULL CHECK (update_type IN ('milestone', 'progress', 'announcement', 'general')),
    status VARCHAR(50) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    media_urls JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES kindlers(id),
    updated_by UUID NOT NULL REFERENCES kindlers(id)
);

-- Create notification tracking table for many-to-many relationship with kindlers
CREATE TABLE project_update_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    update_id UUID NOT NULL REFERENCES project_updates(id) ON DELETE CASCADE,
    kindler_id UUID NOT NULL REFERENCES kindlers(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(update_id, kindler_id)
);

-- Create comments table for project updates
CREATE TABLE project_update_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    update_id UUID NOT NULL REFERENCES project_updates(id) ON DELETE CASCADE,
    kindler_id UUID NOT NULL REFERENCES kindlers(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indices for performance
CREATE INDEX idx_project_updates_project_id ON project_updates(project_id);
CREATE INDEX idx_project_updates_created_at ON project_updates(created_at DESC);
CREATE INDEX idx_project_update_notifications_kindler_id ON project_update_notifications(kindler_id);
CREATE INDEX idx_project_update_notifications_update_id ON project_update_notifications(update_id);
CREATE INDEX idx_project_update_comments_update_id ON project_update_comments(update_id);

-- Add RLS policies
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_update_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_update_comments ENABLE ROW LEVEL SECURITY;

-- Project Updates policies
CREATE POLICY "Project updates are viewable by authenticated users"
    ON project_updates FOR SELECT
    TO authenticated
    USING (status = 'published');

CREATE POLICY "Project updates can be created by project team members"
    ON project_updates FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = project_id
            AND (
                p.creator_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM project_team_members ptm
                    WHERE ptm.project_id = p.id
                    AND ptm.kindler_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Project updates can be modified by project team members"
    ON project_updates FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = project_id
            AND (
                p.creator_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM project_team_members ptm
                    WHERE ptm.project_id = p.id
                    AND ptm.kindler_id = auth.uid()
                )
            )
        )
    );

-- Notification policies
CREATE POLICY "Users can view their own notifications"
    ON project_update_notifications FOR SELECT
    TO authenticated
    USING (kindler_id = auth.uid());

CREATE POLICY "System can create notifications"
    ON project_update_notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can mark their own notifications as read"
    ON project_update_notifications FOR UPDATE
    TO authenticated
    USING (kindler_id = auth.uid());

-- Comment policies
CREATE POLICY "Comments are viewable by authenticated users"
    ON project_update_comments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can create comments"
    ON project_update_comments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = kindler_id);

CREATE POLICY "Users can update their own comments"
    ON project_update_comments FOR UPDATE
    TO authenticated
    USING (auth.uid() = kindler_id);

-- Create function to notify users when a project update is created
CREATE OR REPLACE FUNCTION notify_project_followers()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO project_update_notifications (update_id, kindler_id)
    SELECT NEW.id, pf.kindler_id
    FROM project_followers pf
    WHERE pf.project_id = NEW.project_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create notifications
CREATE TRIGGER project_update_notification_trigger
    AFTER INSERT ON project_updates
    FOR EACH ROW
    WHEN (NEW.status = 'published')
    EXECUTE FUNCTION notify_project_followers();

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_updates_updated_at
    BEFORE UPDATE ON project_updates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_update_comments_updated_at
    BEFORE UPDATE ON project_update_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
