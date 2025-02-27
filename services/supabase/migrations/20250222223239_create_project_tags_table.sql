CREATE TABLE IF NOT EXISTS project_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_tag_relationships (
    project_id UUID NOT NULL
        REFERENCES projects (id)
        ON DELETE CASCADE,
    tag_id UUID NOT NULL
        REFERENCES project_tags (id)
        ON DELETE CASCADE,
    PRIMARY KEY (project_id, tag_id)
);
