-- Persist Stellar Wallet Kit G-address for gamification and on-chain lookups while smart accounts are disabled.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS external_wallet_address TEXT;

COMMENT ON COLUMN public.profiles.external_wallet_address IS
  'External Stellar G-address linked via Stellar Wallet Kit (Freighter, xBull, etc.)';

CREATE INDEX IF NOT EXISTS idx_profiles_external_wallet_address
  ON public.profiles (external_wallet_address)
  WHERE external_wallet_address IS NOT NULL;
