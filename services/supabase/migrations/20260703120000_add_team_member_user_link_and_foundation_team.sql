-- Link project_team to registered users and add foundation team/member tables
-- Enables selecting platform users as team members with manage permissions

-- 1. Add optional user_id to project_team (links registered users)
ALTER TABLE public.project_team
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_project_team_user_id ON public.project_team(user_id);

-- Prevent duplicate registered users on the same project team
CREATE UNIQUE INDEX IF NOT EXISTS project_team_project_id_user_id_key
ON public.project_team(project_id, user_id)
WHERE user_id IS NOT NULL;

-- 2. Foundation members (access control, mirrors project_members)
CREATE TABLE IF NOT EXISTS public.foundation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    foundation_id UUID NOT NULL REFERENCES public.foundations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.project_member_role NOT NULL DEFAULT 'admin',
    title TEXT NOT NULL DEFAULT '',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (foundation_id, user_id)
);

ALTER TABLE public.foundation_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_foundation_members_foundation_id
ON public.foundation_members(foundation_id);

CREATE INDEX IF NOT EXISTS idx_foundation_members_user_id
ON public.foundation_members(user_id);

CREATE POLICY "Foundation members are viewable by everyone"
ON public.foundation_members
FOR SELECT
USING (true);

CREATE POLICY "Foundation founders and admins can insert members"
ON public.foundation_members
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.foundations f
        WHERE f.id = foundation_members.foundation_id
        AND (
            f.founder_id = public.current_auth_user_id()
            OR EXISTS (
                SELECT 1 FROM public.foundation_members fm
                WHERE fm.foundation_id = f.id
                AND fm.user_id = public.current_auth_user_id()
                AND fm.role IN ('core', 'admin', 'editor')
            )
        )
    )
);

CREATE POLICY "Foundation founders and admins can update members"
ON public.foundation_members
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.foundations f
        WHERE f.id = foundation_members.foundation_id
        AND (
            f.founder_id = public.current_auth_user_id()
            OR EXISTS (
                SELECT 1 FROM public.foundation_members fm
                WHERE fm.foundation_id = f.id
                AND fm.user_id = public.current_auth_user_id()
                AND fm.role IN ('core', 'admin', 'editor')
            )
        )
    )
);

CREATE POLICY "Foundation founders and admins can delete members"
ON public.foundation_members
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.foundations f
        WHERE f.id = foundation_members.foundation_id
        AND (
            f.founder_id = public.current_auth_user_id()
            OR EXISTS (
                SELECT 1 FROM public.foundation_members fm
                WHERE fm.foundation_id = f.id
                AND fm.user_id = public.current_auth_user_id()
                AND fm.role IN ('core', 'admin', 'editor')
            )
        )
    )
    OR user_id = public.current_auth_user_id()
);

CREATE OR REPLACE FUNCTION public.set_foundation_member_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_foundation_member_timestamp
BEFORE UPDATE ON public.foundation_members
FOR EACH ROW
EXECUTE FUNCTION public.set_foundation_member_updated_at();

GRANT ALL ON public.foundation_members TO authenticated;
GRANT SELECT ON public.foundation_members TO anon;

-- 3. Foundation team (display, mirrors project_team)
CREATE TABLE IF NOT EXISTS public.foundation_team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    foundation_id UUID NOT NULL REFERENCES public.foundations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    bio TEXT,
    photo_url TEXT,
    years_involved INTEGER,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT foundation_team_full_name_check CHECK (char_length(trim(full_name)) > 0),
    CONSTRAINT foundation_team_role_title_check CHECK (char_length(trim(role_title)) > 0),
    CONSTRAINT foundation_team_years_involved_check CHECK (years_involved IS NULL OR years_involved >= 0)
);

ALTER TABLE public.foundation_team ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_foundation_team_foundation_id
ON public.foundation_team(foundation_id);

CREATE INDEX IF NOT EXISTS idx_foundation_team_order_index
ON public.foundation_team(foundation_id, order_index);

CREATE INDEX IF NOT EXISTS idx_foundation_team_user_id
ON public.foundation_team(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS foundation_team_foundation_id_user_id_key
ON public.foundation_team(foundation_id, user_id)
WHERE user_id IS NOT NULL;

CREATE POLICY "Foundation team members are viewable by everyone"
ON public.foundation_team
FOR SELECT
USING (true);

CREATE POLICY "Foundation founders and admins can insert team members"
ON public.foundation_team
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.foundations f
        WHERE f.id = foundation_team.foundation_id
        AND (
            f.founder_id = public.current_auth_user_id()
            OR EXISTS (
                SELECT 1 FROM public.foundation_members fm
                WHERE fm.foundation_id = f.id
                AND fm.user_id = public.current_auth_user_id()
                AND fm.role IN ('core', 'admin', 'editor')
            )
        )
    )
);

CREATE POLICY "Foundation founders and admins can update team members"
ON public.foundation_team
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.foundations f
        WHERE f.id = foundation_team.foundation_id
        AND (
            f.founder_id = public.current_auth_user_id()
            OR EXISTS (
                SELECT 1 FROM public.foundation_members fm
                WHERE fm.foundation_id = f.id
                AND fm.user_id = public.current_auth_user_id()
                AND fm.role IN ('core', 'admin', 'editor')
            )
        )
    )
);

CREATE POLICY "Foundation founders and admins can delete team members"
ON public.foundation_team
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.foundations f
        WHERE f.id = foundation_team.foundation_id
        AND (
            f.founder_id = public.current_auth_user_id()
            OR EXISTS (
                SELECT 1 FROM public.foundation_members fm
                WHERE fm.foundation_id = f.id
                AND fm.user_id = public.current_auth_user_id()
                AND fm.role IN ('core', 'admin', 'editor')
            )
        )
    )
);

CREATE OR REPLACE FUNCTION public.set_foundation_team_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_foundation_team_timestamp
BEFORE UPDATE ON public.foundation_team
FOR EACH ROW
EXECUTE FUNCTION public.set_foundation_team_updated_at();

GRANT ALL ON public.foundation_team TO authenticated;
GRANT SELECT ON public.foundation_team TO anon;
