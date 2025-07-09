-- Remove redundant milestones column from projects
ALTER TABLE projects DROP COLUMN IF EXISTS milestones;

-- Drop both sides of the circular foreign key relationship
ALTER TABLE escrow_milestones
DROP CONSTRAINT IF EXISTS escrow_milestones_project_milestone_id_fkey;

ALTER TABLE project_milestones
DROP CONSTRAINT IF EXISTS project_milestones_milestone_id_fkey;

-- Remove obsolete project_milestone_id column
ALTER TABLE escrow_milestones
DROP COLUMN IF EXISTS project_milestone_id CASCADE;

-- Drop the intermediate project_milestones table
DROP TABLE IF EXISTS project_milestones;

-- Rename escrow_milestones to milestones
ALTER TABLE escrow_milestones RENAME TO milestones;

-- Add direct reference to project from milestones
ALTER TABLE milestones
ADD COLUMN project_id UUID NOT NULL REFERENCES projects(id);

-- Remove escrow_id from milestones
-- Now the relationship is handled through escrow_milestones table
ALTER TABLE milestones
DROP COLUMN IF EXISTS escrow_id;

-- Join table between escrow_contracts and milestones
-- Defines which escrows fund which milestones
CREATE TABLE escrow_milestones (
  escrow_id UUID NOT NULL REFERENCES escrow_contracts(id),
  milestone_id UUID NOT NULL REFERENCES milestones(id),
  PRIMARY KEY (escrow_id, milestone_id)
);

-- Enable RLS for both tables
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_milestones ENABLE ROW LEVEL SECURITY;

-- RLS policies for milestones

-- Allow project owners to create milestones
CREATE POLICY "Project owners can create milestones"
ON milestones FOR INSERT WITH CHECK (
  project_id IN (SELECT id FROM projects WHERE kindler_id = auth.uid())
);

-- TEMPORARY POLICY: Allows public read access while there's no authentication
-- ⚠️ Remove or replace this policy when auth is active
CREATE POLICY "Public read access to milestones"
ON public.milestones
FOR SELECT
USING (true);

-- Allow project owners to view milestones
-- CREATE POLICY "Project owners can view milestones"
-- ON milestones FOR SELECT USING (
--   project_id IN (SELECT id FROM projects WHERE kindler_id = auth.uid())
-- );

-- Allow project owners to update milestones
CREATE POLICY "Project owners can update milestones"
ON milestones FOR UPDATE USING (
  project_id IN (SELECT id FROM projects WHERE kindler_id = auth.uid())
);

-- Allow project owners to delete milestones
CREATE POLICY "Project owners can delete milestones"
ON milestones FOR DELETE USING (
  project_id IN (SELECT id FROM projects WHERE kindler_id = auth.uid())
);

-- RLS policies for escrow_milestones

-- Allow project owners to create escrow milestones
CREATE POLICY "Project owners can create escrow milestones"
ON escrow_milestones FOR INSERT WITH CHECK (
  milestone_id IN (
    SELECT id FROM milestones
    WHERE project_id IN (SELECT id FROM projects WHERE kindler_id = auth.uid())
  )
);

-- Allow project owners to view escrow milestones
CREATE POLICY "Project owners can view escrow milestones"
ON escrow_milestones FOR SELECT USING (
  milestone_id IN (
    SELECT id FROM milestones
    WHERE project_id IN (SELECT id FROM projects WHERE kindler_id = auth.uid())
  )
);

-- Allow project owners to update escrow milestones
CREATE POLICY "Project owners can update escrow milestones"
ON escrow_milestones FOR UPDATE USING (
  milestone_id IN (
    SELECT id FROM milestones
    WHERE project_id IN (SELECT id FROM projects WHERE kindler_id = auth.uid())
  )
);

-- Allow project owners to delete escrow milestones
CREATE POLICY "Project owners can delete escrow milestones"
ON escrow_milestones FOR DELETE USING (
  milestone_id IN (
    SELECT id FROM milestones
    WHERE project_id IN (SELECT id FROM projects WHERE kindler_id = auth.uid())
  )
);
