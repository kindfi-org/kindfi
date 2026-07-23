-- UGC content translations: AI-generated locale variants stored separately from source columns

CREATE TYPE public.content_entity_type AS ENUM (
  'foundation',
  'project',
  'project_pitch'
);

CREATE TYPE public.translation_status AS ENUM (
  'pending',
  'complete',
  'failed',
  'stale'
);

ALTER TABLE public.foundations
ADD COLUMN IF NOT EXISTS source_locale text NOT NULL DEFAULT 'en'
  CHECK (source_locale IN ('en', 'es'));

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS source_locale text NOT NULL DEFAULT 'en'
  CHECK (source_locale IN ('en', 'es'));

COMMENT ON COLUMN public.foundations.source_locale IS 'Language in which the foundation profile was authored';
COMMENT ON COLUMN public.projects.source_locale IS 'Language in which the campaign was authored';

CREATE TABLE public.content_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type public.content_entity_type NOT NULL,
  entity_id uuid NOT NULL,
  locale text NOT NULL CHECK (locale IN ('en', 'es')),
  fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_locale text NOT NULL CHECK (source_locale IN ('en', 'es')),
  source_hash text NOT NULL,
  status public.translation_status NOT NULL DEFAULT 'pending',
  error_message text,
  model_id text,
  translated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_translations_entity_locale_unique UNIQUE (entity_type, entity_id, locale),
  CONSTRAINT content_translations_locale_differs_from_source CHECK (locale <> source_locale)
);

CREATE INDEX content_translations_entity_idx
  ON public.content_translations (entity_type, entity_id);

CREATE INDEX content_translations_pending_idx
  ON public.content_translations (status)
  WHERE status IN ('pending', 'stale');

ALTER TABLE public.content_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to complete content translations"
  ON public.content_translations
  FOR SELECT
  USING (status = 'complete');
