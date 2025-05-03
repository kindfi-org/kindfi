-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    is_team_member BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create comments table if it doesn't exist with TEXT IDs instead of UUID
CREATE TABLE IF NOT EXISTS public.comments (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    project_id TEXT,
    author_id UUID,
    type TEXT DEFAULT 'question',  -- Default type is 'question', can be 'answer' or 'reply'
    parent_comment_id TEXT,        -- For answers, this points to question ID; for replies, to answer ID
    is_resolved BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON public.comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_type ON public.comments(type);

-- Add example test users if they don't exist
INSERT INTO public.profiles (id, full_name, is_team_member)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Regular User', FALSE),
  ('22222222-2222-2222-2222-222222222222', 'Team Member', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Add example questions
INSERT INTO public.comments (id, content, project_id, author_id, type, parent_comment_id, is_resolved)
VALUES 
  ('q1', 'What is this project about?', 'test-project-123', '11111111-1111-1111-1111-111111111111', 'question', NULL, FALSE),
  ('q2', 'When will the beta version be available?', 'test-project-123', '22222222-2222-2222-2222-222222222222', 'question', NULL, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Add example answers
INSERT INTO public.comments (id, content, project_id, author_id, type, parent_comment_id, is_resolved)
VALUES 
  ('a1', 'This project is about building a community Q&A system for project pages.', 'test-project-123', '22222222-2222-2222-2222-222222222222', 'answer', 'q1', FALSE),
  ('a2', 'We plan to launch the beta version next month!', 'test-project-123', '11111111-1111-1111-1111-111111111111', 'answer', 'q2', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Add example replies
INSERT INTO public.comments (id, content, project_id, author_id, type, parent_comment_id, is_resolved)
VALUES 
  ('r1', 'Thanks for the information! This is really helpful.', 'test-project-123', '11111111-1111-1111-1111-111111111111', 'reply', 'a1', FALSE)
ON CONFLICT (id) DO NOTHING;