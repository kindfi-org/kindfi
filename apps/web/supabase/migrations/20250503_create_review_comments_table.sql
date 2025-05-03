-- Creating the review_comments table
CREATE TABLE review_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID NOT NULL REFERENCES escrow_milestones(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES reviewers(id) ON DELETE CASCADE,
    comments TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enabling Row Level Security
ALTER TABLE review_comments ENABLE ROW LEVEL SECURITY;

-- Creating RLS policy for authenticated users to read their own comments
CREATE POLICY select_own_comments ON review_comments
    FOR SELECT
    TO authenticated
    USING (reviewer_id = (SELECT auth.uid()));

-- Creating RLS policy for authenticated users to insert comments
CREATE POLICY insert_comments ON review_comments
    FOR INSERT
    TO authenticated
    WITH CHECK (reviewer_id = (SELECT auth.uid()));

-- Creating RLS policy for authenticated users to update their own comments
CREATE POLICY update_own_comments ON review_comments
    FOR UPDATE
    TO authenticated
    USING (reviewer_id = (SELECT auth.uid()));