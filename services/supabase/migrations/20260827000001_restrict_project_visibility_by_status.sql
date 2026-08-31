-- Restrict public project visibility to active/paused/funded campaigns.
-- Draft and review projects remain accessible to:
--   • Platform admins (role = 'admin')
--   • The project owner (kindler_id = auth.uid())
--   • Authorized project members (core / admin / editor roles)

-- Drop the existing permissive public-read policy
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON projects;

-- Recreate with status guard
CREATE POLICY "Projects are publicly visible when active"
  ON projects
  FOR SELECT
  USING (
    -- Public: only active-ish projects, excluding dev-only
    (status IN ('active', 'paused', 'funded') AND NOT development_only)
    -- Platform admins see everything
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
    -- Project owner sees their own project at any status
    OR kindler_id = auth.uid()
    -- Authorized project members see the project
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = projects.id
        AND pm.user_id = auth.uid()
        AND pm.role IN ('core', 'admin', 'editor')
    )
  );
