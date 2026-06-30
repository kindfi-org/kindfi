-- Support individual campaign creators (not only NGOs/foundations)
-- and ensure Humanitarian Aid category exists for AID campaigns (e.g. Venezuela).

-- ---------------------------------------------------------------------------
-- 1. Creator entity type enum
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'creator_entity_type' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.creator_entity_type AS ENUM ('individual', 'ngo', 'foundation');
  END IF;
END $$;

COMMENT ON TYPE public.creator_entity_type IS
  'Campaign organizer type: individual person, NGO, or foundation organization';

-- ---------------------------------------------------------------------------
-- 2. Profile fields for individual creators
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS creator_entity_type public.creator_entity_type,
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS country char(3),
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.profiles.creator_entity_type IS
  'When set to individual, the user runs campaigns under their profile (no foundation required)';
COMMENT ON COLUMN public.profiles.headline IS
  'Short public tagline shown on individual creator pages';
COMMENT ON COLUMN public.profiles.country IS
  'ISO 3166-1 alpha-3 country code for the creator''s primary location';
COMMENT ON COLUMN public.profiles.website_url IS
  'Optional public website for individual creators';
COMMENT ON COLUMN public.profiles.social_links IS
  'Public social links for individual creators (e.g. twitter, instagram)';

CREATE INDEX IF NOT EXISTS idx_profiles_creator_entity_type
  ON public.profiles (creator_entity_type)
  WHERE creator_entity_type IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 3. Organization type on foundations (NGO vs foundation)
-- ---------------------------------------------------------------------------
ALTER TABLE public.foundations
  ADD COLUMN IF NOT EXISTS entity_type public.creator_entity_type NOT NULL DEFAULT 'foundation';

ALTER TABLE public.foundations
  DROP CONSTRAINT IF EXISTS foundations_entity_type_check;

ALTER TABLE public.foundations
  ADD CONSTRAINT foundations_entity_type_check
  CHECK (entity_type IN ('ngo', 'foundation'));

COMMENT ON COLUMN public.foundations.entity_type IS
  'Organization type: NGO or registered foundation (individuals use profiles instead)';

CREATE INDEX IF NOT EXISTS idx_foundations_entity_type
  ON public.foundations (entity_type);

-- ---------------------------------------------------------------------------
-- 4. Humanitarian Aid category (slug: aid)
-- ---------------------------------------------------------------------------
INSERT INTO public.categories (name, color)
VALUES ('Humanitarian Aid', '#C62828')
ON CONFLICT (name) DO NOTHING;

-- Ensure slug is "aid" for campaign filters and URLs
UPDATE public.categories
SET slug = 'aid'
WHERE name = 'Humanitarian Aid';
