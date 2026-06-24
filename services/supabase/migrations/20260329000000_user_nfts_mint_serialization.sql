-- Mint serialization for user_nfts
--
-- /api/nfts/mint claims a row (token_id = -1) before on-chain mint to prevent
-- duplicate on-chain mints under concurrent requests. The unique constraint on
-- (user_id, contract_address) enforces one row per user per contract.
--
-- Idempotent: constraint may already exist on deployed databases.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.user_nfts'::regclass
      AND conname = 'user_nfts_user_id_contract_address_key'
  ) THEN
    ALTER TABLE public.user_nfts
      ADD CONSTRAINT user_nfts_user_id_contract_address_key
      UNIQUE (user_id, contract_address);
  END IF;
END $$;

COMMENT ON TABLE public.user_nfts IS
  'KindFi Kinder NFT records. token_id = -1 means an on-chain mint is in progress.';
