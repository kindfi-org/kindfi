-- Migration file for project updates
-- Timestamp: 1707804000000 (2025-02-13 00:00:00 UTC)

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
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(update_id, kindler_id)
);

-- Create comments table for project updates
CREATE TABLE project_update_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    update_id UUID NOT NULL REFERENCES project_updates(id) ON DELETE CASCADE,
    kindler_id UUID NOT NULL REFERENCES kindlers(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indices for better query performance
CREATE INDEX idx_project_updates_project_id ON project_updates(project_id);
CREATE INDEX idx_project_updates_created_by ON project_updates(created_by);
CREATE INDEX idx_project_updates_status ON project_updates(status);
CREATE INDEX idx_project_update_notifications_kindler ON project_update_notifications(kindler_id);
CREATE INDEX idx_project_update_notifications_update ON project_update_notifications(update_id);
CREATE INDEX idx_project_update_comments_update ON project_update_comments(update_id);
CREATE INDEX idx_project_update_comments_kindler ON project_update_comments(kindler_id);

-- Add trigger for updating updated_at timestamp
CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON project_updates
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Create trigger to automatically create notifications for project followers
CREATE OR REPLACE FUNCTION notify_project_followers()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'published' THEN
        INSERT INTO project_update_notifications (update_id, kindler_id)
        SELECT NEW.id, pf.kindler_id
        FROM project_followers pf
        WHERE pf.project_id = NEW.project_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_update_notification_trigger
    AFTER INSERT ON project_updates
    FOR EACH ROW
    EXECUTE FUNCTION notify_project_followers();

-- Set up Row Level Security (RLS)
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_update_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_update_comments ENABLE ROW LEVEL SECURITY;

-- Project Updates RLS Policies
CREATE POLICY "Public can view published updates" ON project_updates
    FOR SELECT
    USING (status = 'published');

CREATE POLICY "Project members can manage updates" ON project_updates
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = project_updates.project_id
            AND pm.kindler_id = auth.uid()
        )
    );

-- Notifications RLS Policies
CREATE POLICY "Users can view their own notifications" ON project_update_notifications
    FOR SELECT
    USING (kindler_id = auth.uid());

CREATE POLICY "System can create notifications" ON project_update_notifications
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can mark their notifications as read" ON project_update_notifications
    FOR UPDATE
    USING (kindler_id = auth.uid())
    WITH CHECK (kindler_id = auth.uid());

-- Comments RLS Policies
CREATE POLICY "Public can view comments on published updates" ON project_update_comments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM project_updates pu
            WHERE pu.id = project_update_comments.update_id
            AND pu.status = 'published'
        )
    );

CREATE POLICY "Authenticated users can create comments" ON project_update_comments
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own comments" ON project_update_comments
    FOR ALL
    USING (kindler_id = auth.uid());
