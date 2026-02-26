-- Create project_team table for displaying team members (not linked to auth.users)
-- This is separate from project_members which is for access control
CREATE TABLE IF NOT EXISTS public.project_team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    bio TEXT,
    photo_url TEXT,
    years_involved INTEGER,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT project_team_full_name_check CHECK (char_length(trim(full_name)) > 0),
    CONSTRAINT project_team_role_title_check CHECK (char_length(trim(role_title)) > 0),
    CONSTRAINT project_team_years_involved_check CHECK (years_involved IS NULL OR years_involved >= 0)
);

-- Enable Row Level Security
ALTER TABLE public.project_team ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_project_team_project_id ON public.project_team(project_id);
CREATE INDEX idx_project_team_order_index ON public.project_team(project_id, order_index);

-- RLS Policy: Anyone can view project team members
CREATE POLICY "Project team members are viewable by everyone"
ON public.project_team
FOR SELECT
USING (true);

-- RLS Policy: Only project owners and editors can manage team members
CREATE POLICY "Project owners and editors can insert team members"
ON public.project_team
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_team.project_id
        AND (
            p.kindler_id = public.current_auth_user_id()
            OR EXISTS (
                SELECT 1 FROM public.project_members pm
                WHERE pm.project_id = p.id
                AND pm.user_id = public.current_auth_user_id()
                AND pm.role IN ('admin', 'core', 'editor')
            )
        )
    )
);

CREATE POLICY "Project owners and editors can update team members"
ON public.project_team
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_team.project_id
        AND (
            p.kindler_id = public.current_auth_user_id()
            OR EXISTS (
                SELECT 1 FROM public.project_members pm
                WHERE pm.project_id = p.id
                AND pm.user_id = public.current_auth_user_id()
                AND pm.role IN ('admin', 'core', 'editor')
            )
        )
    )
);

CREATE POLICY "Project owners and editors can delete team members"
ON public.project_team
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_team.project_id
        AND (
            p.kindler_id = public.current_auth_user_id()
            OR EXISTS (
                SELECT 1 FROM public.project_members pm
                WHERE pm.project_id = p.id
                AND pm.user_id = public.current_auth_user_id()
                AND pm.role IN ('admin', 'core', 'editor')
            )
        )
    )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_project_team_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_project_team_timestamp
BEFORE UPDATE ON public.project_team
FOR EACH ROW
EXECUTE FUNCTION public.set_project_team_updated_at();

-- Grant permissions
GRANT ALL ON public.project_team TO authenticated;
GRANT SELECT ON public.project_team TO anon;
