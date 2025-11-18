-- Migration reverted - device_id is now computed on-demand from COSE public key
-- This provides better security by not storing the uncompressed key in the database
-- 
-- The device_id (SHA256 hash of uncompressed secp256r1 public key) is computed
-- when needed by the computeDeviceIdFromCoseKey() utility function
--
-- This migration file is kept for historical purposes but has no effect

-- No changes needed - public_key column already stores COSE format
COMMENT ON COLUMN "public"."devices"."public_key" IS 'COSE/CBOR-encoded public key for WebAuthn off-chain verification. Device ID is derived from this on-demand.';

