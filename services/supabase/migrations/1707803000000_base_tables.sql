-- Migration file for base tables
-- Timestamp: 1707803000000 (2025-02-13 00:00:00 UTC)

-- Create kindlers table first (users)
CREATE TABLE kindlers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES kindlers(id),
    updated_by UUID NOT NULL REFERENCES kindlers(id)
);

-- Create project_members table for project membership
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    kindler_id UUID NOT NULL REFERENCES kindlers(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, kindler_id)
);

-- Create project_followers table for project followers
CREATE TABLE project_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    kindler_id UUID NOT NULL REFERENCES kindlers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, kindler_id)
);

-- Add indices
CREATE INDEX idx_kindlers_auth_id ON kindlers(auth_id);
CREATE INDEX idx_kindlers_username ON kindlers(username);
CREATE INDEX idx_kindlers_email ON kindlers(email);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_kindler ON project_members(kindler_id);
CREATE INDEX idx_project_followers_project ON project_followers(project_id);
CREATE INDEX idx_project_followers_kindler ON project_followers(kindler_id);

-- Add trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_kindlers
    BEFORE UPDATE ON kindlers
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_projects
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Set up Row Level Security (RLS)
ALTER TABLE kindlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_followers ENABLE ROW LEVEL SECURITY;

-- Kindlers RLS Policies
CREATE POLICY "Public can view kindler profiles" ON kindlers
    FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile" ON kindlers
    FOR UPDATE
    USING (auth.uid()::text::uuid = auth_id);

-- Projects RLS Policies
CREATE POLICY "Public can view active projects" ON projects
    FOR SELECT
    USING (status = 'active');

CREATE POLICY "Project members can view all project states" ON projects
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = projects.id
            AND pm.kindler_id = auth.uid()::text::uuid
        )
    );

CREATE POLICY "Project admins can update projects" ON projects
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = projects.id
            AND pm.kindler_id = auth.uid()::text::uuid
            AND pm.role IN ('owner', 'admin')
        )
    );

-- Project Members RLS Policies
CREATE POLICY "Public can view project members" ON project_members
    FOR SELECT
    USING (true);

CREATE POLICY "Project admins can manage members" ON project_members
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = project_members.project_id
            AND pm.kindler_id = auth.uid()::text::uuid
            AND pm.role IN ('owner', 'admin')
        )
    );

-- Project Followers RLS Policies
CREATE POLICY "Public can view project followers" ON project_followers
    FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can follow/unfollow projects" ON project_followers
    FOR ALL
    USING (kindler_id = auth.uid()::text::uuid);
