-- Add slug to profiles with uniqueness and basic format constraint
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS slug TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_slug_key ON public.profiles (slug);

-- Optional: constrain slug format at DB-level (letters, numbers, hyphen)
-- Note: Keep permissive; enforce stricter rules in app if needed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_profiles_slug_format'
    ) THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT chk_profiles_slug_format
        CHECK (
            slug IS NULL OR slug ~ '^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$'
        );
    END IF;
END $$;

-- Create user_follows table
CREATE TABLE IF NOT EXISTS public.user_follows (
    follower_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows (following_id);

-- RLS policies
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Anyone can read follow relationships
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_follows' AND policyname = 'user_follows_select'
    ) THEN
        CREATE POLICY user_follows_select ON public.user_follows
            FOR SELECT
            TO public
            USING (true);
    END IF;
END $$;

-- Authenticated users can follow others (insert rows where they are the follower)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_follows' AND policyname = 'user_follows_insert'
    ) THEN
        CREATE POLICY user_follows_insert ON public.user_follows
            FOR INSERT
            TO authenticated
            WITH CHECK (follower_id = auth.uid());
    END IF;
END $$;

-- Authenticated users can unfollow (delete rows where they are the follower)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_follows' AND policyname = 'user_follows_delete'
    ) THEN
        CREATE POLICY user_follows_delete ON public.user_follows
            FOR DELETE
            TO authenticated
            USING (follower_id = auth.uid());
    END IF;
END $$;


