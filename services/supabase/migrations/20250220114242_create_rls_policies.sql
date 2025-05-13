-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE kindler_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

-- Profiles table policies

-- TEMPORARY POLICY: Allows public read access while there's no authentication
-- ⚠️ Remove or replace this policy when auth is active
CREATE POLICY "Public read access to profiles"
ON public.profiles
FOR SELECT 
USING (true);

-- CREATE POLICY "Profiles are viewable by everyone"
--     ON profiles
--     FOR SELECT
--     TO authenticated
--     USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Projects are viewable by everyone"
    ON projects 
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Projects can be created by authenticated users"
    ON projects 
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Projects can be updated by owner"
    ON projects 
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Projects can be deleted by owner"
    ON projects 
    FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_id);

-- Kindler_projects policies
CREATE POLICY "Kindler-project relationships viewable by everyone"
    ON kindler_projects
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can join projects as kindlers"
    ON kindler_projects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = kindler_id 
        AND EXISTS (
            SELECT 1 FROM projects 
            WHERE id = project_id 
            AND target_amount > current_amount
        )
    );

CREATE POLICY "Users can leave projects"
    ON kindler_projects
    FOR DELETE
    TO authenticated
    USING (auth.uid() = kindler_id);

-- Project updates policies
CREATE POLICY "Project updates are viewable by everyone"
    ON project_updates
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Project updates can be created by project members"
    ON project_updates
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = author_id 
        AND (
            -- Allow if user is project owner
            EXISTS (
                SELECT 1 
                FROM projects 
                WHERE id = project_id 
                AND owner_id = auth.uid()
            )
            OR 
            -- Allow if user is a kindler (contributor) to the project
            EXISTS (
                SELECT 1 
                FROM kindler_projects 
                WHERE project_id = project_updates.project_id 
                AND kindler_id = auth.uid()
            )
        )
    );

CREATE POLICY "Project updates can be modified by authors"
    ON project_updates
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (
        auth.uid() = author_id
        AND (
            -- Only allow updates if the project is still active
            EXISTS (
                SELECT 1 
                FROM projects 
                WHERE id = project_id 
                AND current_amount < target_amount
            )
        )
    );

CREATE POLICY "Project updates can be deleted by authors or project owners"
    ON project_updates
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() = author_id
        OR 
        EXISTS (
            SELECT 1 
            FROM projects 
            WHERE id = project_id 
            AND owner_id = auth.uid()
        )
    );

-- Grant appropriate permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON projects TO authenticated;
GRANT ALL ON kindler_projects TO authenticated;
GRANT ALL ON project_updates TO authenticated;

GRANT SELECT ON profiles TO anon;
GRANT SELECT ON projects TO anon;
GRANT SELECT ON kindler_projects TO anon;
GRANT SELECT ON project_updates TO anon;