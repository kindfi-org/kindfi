-- Migration: Create upsert function for escrow_contracts
-- Purpose: Provide a SQL function to insert or update escrow contracts without duplicates
-- Uses: ON CONFLICT to handle both contract_id and engagement_id unique constraints

-- Function to upsert escrow contract
-- This function will insert a new escrow contract or update an existing one
-- based on contract_id (primary identifier) or engagement_id (fallback)
CREATE OR REPLACE FUNCTION upsert_escrow_contract(
  p_contract_id TEXT,
  p_engagement_id TEXT,
  p_project_id UUID,
  p_contribution_id UUID,
  p_payer_address TEXT,
  p_receiver_address TEXT,
  p_amount NUMERIC(20,7),
  p_platform_fee NUMERIC(5,2),
  p_current_state escrow_status_type DEFAULT 'NEW',
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_escrow_id UUID;
BEGIN
  -- Try to upsert based on contract_id (primary unique constraint)
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
    metadata,
    updated_at
  )
  VALUES (
    p_contract_id,
    p_engagement_id,
    p_project_id,
    p_contribution_id,
    p_payer_address,
    p_receiver_address,
    p_amount,
    p_platform_fee,
    p_current_state,
    p_metadata,
    CURRENT_TIMESTAMP
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
  RETURNING id INTO v_escrow_id;

  -- If contract_id conflict didn't match, try engagement_id
  -- (This handles edge cases where engagement_id might be different but contract_id is the same)
  IF v_escrow_id IS NULL THEN
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
      metadata,
      updated_at
    )
    VALUES (
      p_contract_id,
      p_engagement_id,
      p_project_id,
      p_contribution_id,
      p_payer_address,
      p_receiver_address,
      p_amount,
      p_platform_fee,
      p_current_state,
      p_metadata,
      CURRENT_TIMESTAMP
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
    RETURNING id INTO v_escrow_id;
  END IF;

  RETURN v_escrow_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upsert_escrow_contract TO authenticated;

-- Comment on function
COMMENT ON FUNCTION upsert_escrow_contract IS 
'Upserts an escrow contract record. If contract_id exists, updates the record. If engagement_id exists but contract_id is different, updates based on engagement_id. Otherwise creates a new record. Returns the UUID of the escrow contract.';
