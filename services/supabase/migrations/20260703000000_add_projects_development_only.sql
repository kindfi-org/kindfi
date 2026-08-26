/*
  migration: add development_only flag to projects
  purpose:
    - Allow admins to create internal development projects invisible to regular users.
    - Restrict SELECT visibility via RLS so only platform admins can read development_only rows.
    - Prevent non-admins from toggling the flag on update.
  affected objects:
    - public.projects (new column development_only)
    - public.is_platform_admin() helper function
    - RLS policy "Projects are viewable by everyone" on public.projects
    - RLS policy "Owner or editors can update a project" on public.projects
*/

-- Platform admin check (reusable across RLS policies)
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = public.current_auth_user_id()
      AND role = 'admin'
  )
$$;

GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated, anon;

-- Add development-only flag (defaults to false for existing and new user projects)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS development_only boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.projects.development_only IS
  'When true, project is visible and manageable only by platform admins. Used for internal development and testing.';

CREATE INDEX IF NOT EXISTS projects_development_only_idx
  ON public.projects (development_only)
  WHERE development_only = true;

-- Restrict read access: hide development projects from non-admin users
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON public.projects;

CREATE POLICY "Projects are viewable by everyone"
  ON public.projects
  FOR SELECT
  TO authenticated, anon
  USING (NOT development_only OR public.is_platform_admin());

-- Only platform admins may set or change development_only on update
DROP POLICY IF EXISTS "Owner or editors can update a project" ON public.projects;

CREATE POLICY "Owner or editors can update a project"
  ON public.projects
  FOR UPDATE
  TO authenticated
  USING (
    public.current_auth_user_id() = kindler_id
    OR EXISTS (
      SELECT 1
      FROM public.project_members pm
      WHERE pm.project_id = public.projects.id
        AND pm.user_id = public.current_auth_user_id()
        AND pm.role IN ('core', 'admin', 'editor')
    )
    OR public.is_platform_admin()
  )
  WITH CHECK (
    (
      public.current_auth_user_id() = kindler_id
      OR EXISTS (
        SELECT 1
        FROM public.project_members pm
        WHERE pm.project_id = public.projects.id
          AND pm.user_id = public.current_auth_user_id()
          AND pm.role IN ('core', 'admin', 'editor')
      )
      OR public.is_platform_admin()
    )
    AND kindler_id = (
      SELECT p.kindler_id
      FROM public.projects p
      WHERE p.id = public.projects.id
    )
    AND (
      public.is_platform_admin()
      OR development_only = (
        SELECT p.development_only
        FROM public.projects p
        WHERE p.id = public.projects.id
      )
    )
  );
