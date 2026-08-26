-- Pollar onboarding integration fields on profiles

DO $$ BEGIN
  CREATE TYPE public.onboarding_provider AS ENUM ('legacy_passkey', 'pollar');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_provider public.onboarding_provider NOT NULL DEFAULT 'legacy_passkey',
  ADD COLUMN IF NOT EXISTS pollar_user_id text,
  ADD COLUMN IF NOT EXISTS pollar_wallet_address text,
  ADD COLUMN IF NOT EXISTS pollar_wallet_activated_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_pollar_user_id_key
  ON public.profiles (pollar_user_id)
  WHERE pollar_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_provider
  ON public.profiles (onboarding_provider);

COMMENT ON COLUMN public.profiles.onboarding_provider IS 'Signup path: legacy passkey or Pollar social/email wallet';
COMMENT ON COLUMN public.profiles.pollar_user_id IS 'Pollar platform user id from token verify';
COMMENT ON COLUMN public.profiles.pollar_wallet_address IS 'Custodial G-address provisioned by Pollar';
