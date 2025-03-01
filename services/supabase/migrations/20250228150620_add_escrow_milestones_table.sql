CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');

CREATE TABLE project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id),
    milestone_id UUID NOT NULL REFERENCES escrow_milestones(id),
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
ALTER TABLE escrow_milestones
ADD CONSTRAINT escrow_milestones_project_milestone_id_fkey
FOREIGN KEY (project_milestone_id) REFERENCES project_milestones(id);
ALTER TABLE
    escrow_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to create escrow milestones for their projects" ON "public"."escrow_milestones" AS PERMISSIVE FOR
INSERT
    TO public WITH CHECK (
        auth.role() = 'authenticated'
        AND auth.uid() IN (
            SELECT
                owner_id
            FROM
                projects
            WHERE
                id IN (
                    SELECT
                        project_id
                    FROM
                        project_milestones
                    WHERE
                        milestone_id = escrow_milestones.id
                )
        )
    );

CREATE POLICY "Allow project owners to update escrow milestones" ON "public"."escrow_milestones" AS PERMISSIVE FOR
UPDATE
    TO public USING (
        auth.uid() IN (
            SELECT
                owner_id
            FROM
                projects
            WHERE
                id IN (
                    SELECT
                        project_id
                    FROM
                        project_milestones
                    WHERE
                        milestone_id = escrow_milestones.id
                )
        )
    );

CREATE POLICY "Allow public read access to escrow milestones for public projects" ON "public"."escrow_milestones" AS PERMISSIVE FOR
SELECT
    TO public USING (
        EXISTS (
            SELECT
                1
            FROM
                projects
            WHERE
                id IN (
                    SELECT
                        project_id
                    FROM
                        project_milestones
                    WHERE
                        milestone_id = escrow_milestones.id
                )
                AND public = TRUE
        )
    );