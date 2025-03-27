CREATE TABLE IF NOT EXISTS project_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    creator_id UUID NOT NULL REFERENCES kindlers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_update_notifications (
    update_id UUID NOT NULL REFERENCES project_updates(id) ON DELETE CASCADE,
    kindler_id UUID NOT NULL REFERENCES kindlers(id) ON DELETE CASCADE,
    PRIMARY KEY (update_id, kindler_id)
);

CREATE INDEX IF NOT EXISTS idx_project_updates_project_id 
    ON project_updates(project_id);

CREATE INDEX IF NOT EXISTS idx_project_updates_creator_id 
    ON project_updates(creator_id);

CREATE INDEX IF NOT EXISTS idx_project_update_notifications_kindler_id 
    ON project_update_notifications(kindler_id);

-- Enable Row Level Security (RLS) on the table
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY select_project_updates 
    ON project_updates 
    FOR SELECT 
    USING (creator_id = auth.uid() OR auth.role() = 'admin');

CREATE POLICY insert_project_updates 
    ON project_updates 
    FOR INSERT 
    WITH CHECK (creator_id = auth.uid() OR auth.role() = 'admin');

CREATE POLICY update_project_updates 
    ON project_updates 
    FOR UPDATE 
    USING (creator_id = auth.uid() OR auth.role() = 'admin')
    WITH CHECK (creator_id = auth.uid() OR auth.role() = 'admin');

CREATE POLICY delete_project_updates 
    ON project_updates 
    FOR DELETE 
    USING (creator_id = auth.uid() OR auth.role() = 'admin');
