-- Create enum for project member roles
CREATE TYPE project_member_role AS ENUM ('admin', 'editor');

-- Create project_members table
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role project_member_role NOT NULL DEFAULT 'editor',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX idx_project_members_user_id ON public.project_members(user_id);

-- RLS Policy: View project members
CREATE POLICY "Project members are viewable by authenticated users"
ON public.project_members
FOR SELECT
TO authenticated
USING (
    -- User can see members of their own projects
    project_id IN (
        SELECT id FROM public.projects 
        WHERE owner_id = auth.uid()
    )
    OR 
    -- User can see members of projects they are part of
    EXISTS (
        SELECT 1 FROM public.project_members 
        WHERE project_id = project_members.project_id 
        AND user_id = auth.uid()
    )
);

-- RLS Policy: Insert project members
CREATE POLICY "Project owners can add members"
ON public.project_members
FOR INSERT
TO authenticated
WITH CHECK (
    -- Only project owners can add members
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = project_id 
        AND owner_id = auth.uid()
    )
);

-- RLS Policy: Update project members
CREATE POLICY "Project owners can update member roles"
ON public.project_members
FOR UPDATE
TO authenticated
USING (
    -- Only project owners can modify member details
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = project_id 
        AND owner_id = auth.uid()
    )
)
WITH CHECK (
    -- Allow updates via triggers (e.g., automatic timestamp updates) or enforce valid role changes
    role IN ('admin', 'editor') OR pg_trigger_depth() > 0
);

-- RLS Policy: Delete project members
CREATE POLICY "Project owners can remove members"
ON public.project_members
FOR DELETE
TO authenticated
USING (
    -- Project owners can remove any member
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = project_id 
        AND owner_id = auth.uid()
    )
    OR 
    -- Users can remove themselves
    user_id = auth.uid()
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_project_member_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_project_member_timestamp
BEFORE UPDATE ON public.project_members
FOR EACH ROW
EXECUTE FUNCTION public.set_project_member_updated_at();

-- Grant permissions
GRANT ALL ON public.project_members TO authenticated;
GRANT SELECT ON public.project_members TO anon;