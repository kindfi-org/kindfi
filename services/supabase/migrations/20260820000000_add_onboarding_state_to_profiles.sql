-- Required, role-aware onboarding flow: persist onboarding progress on profiles

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_step text NOT NULL DEFAULT 'role',
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS product_tour_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_version integer NOT NULL DEFAULT 1;

DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_onboarding_step_check
    CHECK (onboarding_step IN ('role', 'personal_info', 'confirm', 'completed'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed_at
  ON public.profiles (onboarding_completed_at);

COMMENT ON COLUMN public.profiles.onboarding_step IS 'Current required onboarding step: role, personal_info, confirm, completed';
COMMENT ON COLUMN public.profiles.onboarding_completed_at IS 'Timestamp when required onboarding (role + display name + bio) was completed; null means onboarding is still required';
COMMENT ON COLUMN public.profiles.product_tour_completed_at IS 'Timestamp when the optional role-specific guided product tour was completed or skipped';
COMMENT ON COLUMN public.profiles.onboarding_version IS 'Version of the onboarding flow the user completed, for future flow changes';

-- Backfill existing users who already have a role and personal info so they are
-- not forced through the new required onboarding flow again.
UPDATE public.profiles
SET
  onboarding_step = 'completed',
  onboarding_completed_at = COALESCE(onboarding_completed_at, updated_at, now())
WHERE
  role IN ('donor', 'creator', 'admin')
  AND display_name IS NOT NULL
  AND btrim(display_name) <> ''
  AND bio IS NOT NULL
  AND btrim(bio) <> ''
  AND onboarding_completed_at IS NULL;

-- Users with a role but missing required personal info stay in the personal_info
-- step so they resume onboarding there instead of re-selecting a role.
UPDATE public.profiles
SET onboarding_step = 'personal_info'
WHERE
  role IN ('donor', 'creator', 'admin')
  AND onboarding_completed_at IS NULL
  AND onboarding_step = 'role';
