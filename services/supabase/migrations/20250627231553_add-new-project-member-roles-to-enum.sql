-- Add new values to the existing enum type
ALTER TYPE project_member_role ADD VALUE IF NOT EXISTS 'advisor';
ALTER TYPE project_member_role ADD VALUE IF NOT EXISTS 'community';
ALTER TYPE project_member_role ADD VALUE IF NOT EXISTS 'core';
ALTER TYPE project_member_role ADD VALUE IF NOT EXISTS 'others';

-- Update the RLS policy
DROP POLICY IF EXISTS "Project owners can update member roles"
ON public.project_members;

CREATE POLICY "Project owners can update member roles"
ON public.project_members
FOR UPDATE
TO authenticated
USING (
    -- Only project owners can modify member data
    EXISTS (
        SELECT 1
        FROM public.projects
        WHERE id = project_id
          AND kindler_id = auth.uid()
    )
);
