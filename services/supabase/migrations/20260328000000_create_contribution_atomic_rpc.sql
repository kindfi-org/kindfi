-- Atomic contribution insert + project totals update.
-- Ensures contributions.current_amount / percentage_complete / kinder_count stay
-- consistent with contribution rows (no partial writes).

CREATE OR REPLACE FUNCTION public.create_contribution_and_update_project(
  p_project_id UUID,
  p_contributor_id UUID,
  p_amount NUMERIC(20, 7)
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contribution_id UUID;
BEGIN
  IF p_project_id IS NULL THEN
    RAISE EXCEPTION 'project_id is required';
  END IF;

  IF p_contributor_id IS NULL THEN
    RAISE EXCEPTION 'contributor_id is required';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'amount must be a positive number';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.projects WHERE id = p_project_id) THEN
    RAISE EXCEPTION 'Project not found: %', p_project_id;
  END IF;

  INSERT INTO public.contributions (project_id, contributor_id, amount)
  VALUES (p_project_id, p_contributor_id, p_amount)
  RETURNING id INTO v_contribution_id;

  UPDATE public.projects
  SET
    current_amount = current_amount + p_amount,
    percentage_complete = CASE
      WHEN target_amount > 0 THEN LEAST((current_amount + p_amount) / target_amount * 100, 100)
      ELSE 0
    END,
    kinder_count = kinder_count + 1
  WHERE id = p_project_id;

  RETURN v_contribution_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_contribution_and_update_project(UUID, UUID, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_contribution_and_update_project(UUID, UUID, NUMERIC) TO service_role;

COMMENT ON FUNCTION public.create_contribution_and_update_project IS
'Inserts a contribution and atomically updates project funding totals in a single transaction. Returns the new contribution id.';
