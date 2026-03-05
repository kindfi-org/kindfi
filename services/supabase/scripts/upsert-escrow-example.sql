-- Example SQL script to upsert escrow contract without duplicates
-- This script demonstrates how to use the upsert_escrow_contract function

-- Example 1: Upsert using the function (recommended)
-- This will insert if contract_id doesn't exist, or update if it does
SELECT upsert_escrow_contract(
  p_contract_id := 'CABC123...',                    -- Stellar contract address (unique)
  p_engagement_id := 'project-123-escrow-1',        -- Engagement ID (unique)
  p_project_id := '123e4567-e89b-12d3-a456-426614174000'::UUID,
  p_contribution_id := '123e4567-e89b-12d3-a456-426614174001'::UUID,
  p_payer_address := 'GABC123...',                  -- Service provider address
  p_receiver_address := 'GDEF456...',               -- Receiver address
  p_amount := 1000.0000000,                         -- Total amount
  p_platform_fee := 1.00,                            -- Platform fee percentage
  p_current_state := 'NEW',                         -- Escrow status
  p_metadata := '{"title": "Example Escrow"}'::jsonb -- Optional metadata
);

-- Example 2: Direct INSERT with ON CONFLICT (alternative approach)
-- This is what you'd use if calling directly from application code
INSERT INTO public.escrow_contracts (
  contract_id,
  engagement_id,
  project_id,
  contribution_id,
  payer_address,
  receiver_address,
  amount,
  platform_fee,
  current_state,
  metadata
)
VALUES (
  'CABC123...',                                    -- contract_id (unique)
  'project-123-escrow-1',                          -- engagement_id (unique)
  '123e4567-e89b-12d3-a456-426614174000'::UUID,   -- project_id
  '123e4567-e89b-12d3-a456-426614174001'::UUID,   -- contribution_id
  'GABC123...',                                    -- payer_address
  'GDEF456...',                                    -- receiver_address
  1000.0000000,                                    -- amount
  1.00,                                            -- platform_fee
  'NEW',                                           -- current_state
  '{"title": "Example Escrow"}'::jsonb             -- metadata
)
ON CONFLICT (contract_id) 
DO UPDATE SET
  engagement_id = EXCLUDED.engagement_id,
  project_id = EXCLUDED.project_id,
  contribution_id = EXCLUDED.contribution_id,
  payer_address = EXCLUDED.payer_address,
  receiver_address = EXCLUDED.receiver_address,
  amount = EXCLUDED.amount,
  platform_fee = EXCLUDED.platform_fee,
  current_state = EXCLUDED.current_state,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP
RETURNING id;

-- Example 3: Upsert based on engagement_id if contract_id might change
-- Use this if you want to update based on engagement_id instead
INSERT INTO public.escrow_contracts (
  contract_id,
  engagement_id,
  project_id,
  contribution_id,
  payer_address,
  receiver_address,
  amount,
  platform_fee,
  current_state,
  metadata
)
VALUES (
  'CABC123...',
  'project-123-escrow-1',
  '123e4567-e89b-12d3-a456-426614174000'::UUID,
  '123e4567-e89b-12d3-a456-426614174001'::UUID,
  'GABC123...',
  'GDEF456...',
  1000.0000000,
  1.00,
  'NEW',
  '{"title": "Example Escrow"}'::jsonb
)
ON CONFLICT (engagement_id)
DO UPDATE SET
  contract_id = EXCLUDED.contract_id,
  project_id = EXCLUDED.project_id,
  contribution_id = EXCLUDED.contribution_id,
  payer_address = EXCLUDED.payer_address,
  receiver_address = EXCLUDED.receiver_address,
  amount = EXCLUDED.amount,
  platform_fee = EXCLUDED.platform_fee,
  current_state = EXCLUDED.current_state,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP
RETURNING id;

-- Example 4: Upsert project_escrows link (one escrow per project)
-- This ensures the project-escrow relationship is also upserted
INSERT INTO public.project_escrows (
  project_id,
  escrow_id
)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000'::UUID,   -- project_id
  '123e4567-e89b-12d3-a456-426614174002'::UUID    -- escrow_id (from upsert result)
)
ON CONFLICT (project_id)
DO UPDATE SET
  escrow_id = EXCLUDED.escrow_id,
  updated_at = CURRENT_TIMESTAMP
RETURNING project_id, escrow_id;
