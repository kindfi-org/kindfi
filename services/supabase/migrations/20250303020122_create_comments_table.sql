CREATE TABLE comments (
    id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    project_update_id UUID REFERENCES project_update(id) ON DELETE CASCADE,  -- Ensure correct foreign key
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT check_project_or_update CHECK (
        (project_id IS NOT NULL AND project_update_id IS NULL) OR
        (project_id IS NULL AND project_update_id IS NOT NULL)
    )
);
