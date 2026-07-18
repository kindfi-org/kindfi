-- Milestone review requests: off-chain coordination between project owners and platform admins.
CREATE TABLE IF NOT EXISTS milestone_review_requests (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    escrow_contract_id TEXT NOT NULL,
    milestone_index INTEGER NOT NULL CHECK (milestone_index >= 0),
    milestone_title TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    request_notes TEXT,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS milestone_review_requests_project_id_idx
    ON milestone_review_requests(project_id);

CREATE INDEX IF NOT EXISTS milestone_review_requests_status_idx
    ON milestone_review_requests(status);

CREATE INDEX IF NOT EXISTS milestone_review_requests_created_at_idx
    ON milestone_review_requests(created_at DESC);

-- Prevent duplicate pending requests for the same milestone.
CREATE UNIQUE INDEX IF NOT EXISTS milestone_review_requests_pending_unique_idx
    ON milestone_review_requests(project_id, escrow_contract_id, milestone_index)
    WHERE status = 'pending';

ALTER TABLE milestone_review_requests ENABLE ROW LEVEL SECURITY;

-- Project managers can view requests for their projects.
CREATE POLICY "Project managers can view milestone review requests"
    ON milestone_review_requests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = milestone_review_requests.project_id
            AND (
                p.kindler_id = public.current_auth_user_id()
                OR EXISTS (
                    SELECT 1 FROM project_members pm
                    WHERE pm.project_id = p.id
                    AND pm.user_id = public.current_auth_user_id()
                    AND pm.role IN ('core', 'admin', 'editor')
                )
            )
        )
        OR EXISTS (
            SELECT 1 FROM profiles pr
            WHERE pr.id = public.current_auth_user_id()
            AND pr.role = 'admin'
        )
    );

-- Project managers can submit pending review requests.
CREATE POLICY "Project managers can create milestone review requests"
    ON milestone_review_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (
        requester_id = public.current_auth_user_id()
        AND status = 'pending'
        AND EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = milestone_review_requests.project_id
            AND (
                p.kindler_id = public.current_auth_user_id()
                OR EXISTS (
                    SELECT 1 FROM project_members pm
                    WHERE pm.project_id = p.id
                    AND pm.user_id = public.current_auth_user_id()
                    AND pm.role IN ('core', 'admin', 'editor')
                )
            )
        )
    );

-- Platform admins can update review requests (approve/reject).
CREATE POLICY "Platform admins can update milestone review requests"
    ON milestone_review_requests
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles pr
            WHERE pr.id = public.current_auth_user_id()
            AND pr.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles pr
            WHERE pr.id = public.current_auth_user_id()
            AND pr.role = 'admin'
        )
    );

GRANT SELECT, INSERT, UPDATE ON milestone_review_requests TO authenticated;
GRANT ALL ON milestone_review_requests TO service_role;
