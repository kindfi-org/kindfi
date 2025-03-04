CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');

CREATE TABLE project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id),
    milestone_id UUID NOT NULL,
    UNIQUE (project_id, milestone_id)
);

CREATE TABLE escrow_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_id UUID NOT NULL REFERENCES escrow_contracts(id),
    project_milestone_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(20, 7) NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    status milestone_status NOT NULL DEFAULT 'pending',
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT valid_milestone_amount CHECK (amount > 0)
);

ALTER TABLE projects ADD COLUMN milestones UUID[] DEFAULT '{}'::uuid[];

ALTER TABLE project_milestones
ADD CONSTRAINT project_milestones_milestone_id_fkey
FOREIGN KEY (milestone_id) REFERENCES escrow_milestones(id);

ALTER TABLE escrow_milestones
ADD CONSTRAINT escrow_milestones_project_milestone_id_fkey
FOREIGN KEY (project_milestone_id) REFERENCES project_milestones(id);

ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_milestones
-- Project owners can create milestones for their projects
CREATE POLICY "Project owners can create project milestones" ON project_milestones FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
);

-- Project owners can view project milestones for their projects
CREATE POLICY "Project owners can view project milestones" ON project_milestones FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
);

-- Project owners can delete project milestones for their projects
CREATE POLICY "Project owners can delete project milestones" ON project_milestones FOR DELETE USING (
    project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
);

-- Project owners can create escrow milestones for their projects
CREATE POLICY "Project owners can create escrow milestones" ON escrow_milestones FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1
        FROM project_milestones
        WHERE id = escrow_milestones.project_milestone_id
        AND project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
    )
);

-- Project owners can view escrow milestones for their projects
CREATE POLICY "Project owners can view escrow milestones" ON escrow_milestones FOR SELECT USING (
    EXISTS (
        SELECT 1
        FROM project_milestones
        WHERE id = escrow_milestones.project_milestone_id
        AND project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
    )
);

-- Project owners can update escrow milestones for their projects
CREATE POLICY "Project owners can update escrow milestones" ON escrow_milestones FOR UPDATE USING (
    EXISTS (
        SELECT 1
        FROM project_milestones
        WHERE id = escrow_milestones.project_milestone_id
        AND project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
    )
);

-- Project owners can delete escrow milestones for their projects
CREATE POLICY "Project owners can delete escrow milestones" ON escrow_milestones FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM project_milestones
        WHERE id = escrow_milestones.project_milestone_id
        AND project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
    )
);