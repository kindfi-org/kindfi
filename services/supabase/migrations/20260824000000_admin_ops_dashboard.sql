/*
  migration: admin operations dashboard aggregates
  purpose:
    - Provide a single aggregate RPC (public.get_admin_dashboard_stats) so the
      admin dashboard can render counts without downloading full tables and
      aggregating in application code.
    - Add indexes backing the new server-side admin list filters (project
      status/category/foundation, escrow state, profile signup date/role,
      latest KYC review per user).
  affected objects:
    - function: public.get_admin_dashboard_stats()
    - indexes on: public.projects, public.escrow_contracts, public.profiles,
      public.kyc_reviews
  safety:
    - additive only; idempotent (CREATE INDEX IF NOT EXISTS / CREATE OR REPLACE).
    - the RPC is SECURITY DEFINER and rejects callers that are neither the
      service role nor a platform admin. EXECUTE is revoked from anon.
*/

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Callable only by the server (service role) or an authenticated platform admin.
  IF NOT (coalesce(auth.role(), '') = 'service_role' OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'forbidden: platform admin required' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'projects', jsonb_build_object(
      'total', (SELECT count(*) FROM public.projects),
      'by_status', (
        SELECT coalesce(jsonb_object_agg(s.status, s.cnt), '{}'::jsonb)
        FROM (
          SELECT status::text AS status, count(*) AS cnt
          FROM public.projects
          GROUP BY status
        ) s
      ),
      'dev_only', (SELECT count(*) FROM public.projects WHERE development_only),
      'without_escrow', (
        SELECT count(*)
        FROM public.projects p
        WHERE p.status IN ('active', 'funded')
          AND NOT EXISTS (
            SELECT 1 FROM public.project_escrows pe WHERE pe.project_id = p.id
          )
      )
    ),
    'escrows', jsonb_build_object(
      'total', (SELECT count(*) FROM public.escrow_contracts),
      'by_state', (
        SELECT coalesce(jsonb_object_agg(e.state, e.cnt), '{}'::jsonb)
        FROM (
          SELECT current_state::text AS state, count(*) AS cnt
          FROM public.escrow_contracts
          GROUP BY current_state
        ) e
      )
    ),
    'users', jsonb_build_object(
      'total', (SELECT count(*) FROM public.profiles),
      'by_role', (
        SELECT coalesce(jsonb_object_agg(r.role, r.cnt), '{}'::jsonb)
        FROM (
          SELECT role::text AS role, count(*) AS cnt
          FROM public.profiles
          GROUP BY role
        ) r
      ),
      'new_today', (
        SELECT count(*) FROM public.profiles
        WHERE created_at >= date_trunc('day', now())
      ),
      'new_week', (
        SELECT count(*) FROM public.profiles
        WHERE created_at >= now() - interval '7 days'
      ),
      'new_month', (
        SELECT count(*) FROM public.profiles
        WHERE created_at >= now() - interval '30 days'
      )
    ),
    'kyc', (
      WITH latest AS (
        SELECT DISTINCT ON (user_id) user_id, status
        FROM public.kyc_reviews
        ORDER BY user_id, created_at DESC
      )
      SELECT jsonb_build_object(
        'not_started', (
          SELECT count(*) FROM public.profiles pr
          WHERE NOT EXISTS (SELECT 1 FROM latest l WHERE l.user_id = pr.id)
        ),
        'pending', (SELECT count(*) FROM latest WHERE status = 'pending'),
        'approved', (SELECT count(*) FROM latest WHERE status IN ('approved', 'verified')),
        'rejected', (SELECT count(*) FROM latest WHERE status = 'rejected')
      )
    ),
    'milestone_reviews', jsonb_build_object(
      'pending', (
        SELECT count(*) FROM public.milestone_review_requests WHERE status = 'pending'
      )
    ),
    'contributions', jsonb_build_object(
      'count', (SELECT count(*) FROM public.contributions),
      'total_amount', (SELECT coalesce(sum(amount), 0) FROM public.contributions)
    ),
    'foundations', jsonb_build_object(
      'total', (SELECT count(*) FROM public.foundations)
    ),
    'governance', jsonb_build_object(
      'rounds_total', (SELECT count(*) FROM public.governance_rounds),
      'rounds_active', (
        SELECT count(*) FROM public.governance_rounds WHERE status = 'active'
      )
    ),
    'generated_at', now()
  )
  INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_dashboard_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_admin_dashboard_stats() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated, service_role;

COMMENT ON FUNCTION public.get_admin_dashboard_stats() IS
  'Aggregate counts for the admin operations dashboard. Admin/service-role only.';

-- Indexes backing the new admin list filters. kyc_reviews(user_id) and
-- milestone_review_requests(status) already exist from earlier migrations.
CREATE INDEX IF NOT EXISTS idx_projects_status_created_at
  ON public.projects (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_category_id
  ON public.projects (category_id);

CREATE INDEX IF NOT EXISTS idx_projects_foundation_id
  ON public.projects (foundation_id);

CREATE INDEX IF NOT EXISTS idx_escrow_contracts_current_state
  ON public.escrow_contracts (current_state);

CREATE INDEX IF NOT EXISTS idx_escrow_contracts_project_id
  ON public.escrow_contracts (project_id);

CREATE INDEX IF NOT EXISTS idx_profiles_created_at
  ON public.profiles (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles (role);

CREATE INDEX IF NOT EXISTS idx_kyc_reviews_user_created_at
  ON public.kyc_reviews (user_id, created_at DESC);
