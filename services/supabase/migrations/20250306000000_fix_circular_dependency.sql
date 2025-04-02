-- Migration to resolve circular foreign key dependency between project_milestones and escrow_milestones
-- By making constraints deferrable, we allow flexible insertion order while maintaining referential integrity
-- Deferrable constraints are checked at the end of the transaction rather than after each statement
-- Note: This migration MUST run within a transaction to ensure atomic changes and constraint consistency

BEGIN;

-- Drop existing foreign key constraints if they exist
ALTER TABLE project_milestones
DROP CONSTRAINT IF EXISTS project_milestones_milestone_id_fkey;

ALTER TABLE escrow_milestones
DROP CONSTRAINT IF EXISTS escrow_milestones_project_milestone_id_fkey;

-- Recreate foreign key constraints as deferrable
-- This allows us to insert records in either table first, as long as both records exist
-- by the end of the transaction, solving the chicken-and-egg problem
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

COMMIT; 