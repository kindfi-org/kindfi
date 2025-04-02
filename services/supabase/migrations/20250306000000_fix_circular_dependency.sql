-- Drop existing foreign key constraints
ALTER TABLE project_milestones
DROP CONSTRAINT project_milestones_milestone_id_fkey;

ALTER TABLE escrow_milestones
DROP CONSTRAINT escrow_milestones_project_milestone_id_fkey;

-- Recreate foreign key constraints as deferrable
ALTER TABLE project_milestones
ADD CONSTRAINT project_milestones_milestone_id_fkey
FOREIGN KEY (milestone_id)
REFERENCES escrow_milestones(id)
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE escrow_milestones
ADD CONSTRAINT escrow_milestones_project_milestone_id_fkey
FOREIGN KEY (project_milestone_id)
REFERENCES project_milestones(id)
DEFERRABLE INITIALLY DEFERRED; 