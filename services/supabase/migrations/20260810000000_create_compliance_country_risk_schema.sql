/*
  migration: compliance country-risk schema (issue #1009)
  purpose:
    - Prepare (but do NOT activate) admin-managed country-risk restrictions for
      selected financial actions.
    - Store self-declared and Didit-verified country of residence separately.
    - Version compliance policies, protected-action config, and exceptions so
      an authorized compliance admin can preview/activate/roll back changes.
    - Provide an immutable, append-only audit trail for every policy and
      authorization-decision event.
  notes:
    - No restricted-country list is shipped. All policy tables start empty.
    - `compliance_admin` is a distinct permission from the general `admin`
      role: an admin is not automatically a compliance admin.
    - RLS follows the `public.current_auth_user_id()` helper already used by
      the NextAuth-aware RLS policies in this project (see
      20250925004426_update_rls_to_nextauth.sql). Server code in apps/web
      uses the service-role client for all compliance mutations and always
      re-checks authorization at the application layer as well.
*/

CREATE SCHEMA IF NOT EXISTS compliance;

GRANT USAGE ON SCHEMA compliance TO authenticated, anon, service_role;

-- ---------------------------------------------------------------------------
-- profiles: explicit compliance-admin permission (separate from `role`)
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS compliance_admin boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.compliance_admin IS
  'Explicit permission to manage country-risk compliance policies. Distinct from role = admin.';

-- ---------------------------------------------------------------------------
-- compliance.country_declarations
-- One row per user. Declared (self-reported) and Didit-verified country are
-- kept strictly separate; verified values are only ever written by the
-- Didit sync path (see lib/compliance/didit-country-sync.ts), never by the
-- user-facing declared-country action.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS compliance.country_declarations (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  declared_country char(2),
  declared_country_updated_at timestamptz,
  verified_country char(2),
  verified_country_updated_at timestamptz,
  verification_status text NOT NULL DEFAULT 'unavailable'
    CHECK (verification_status IN ('declared', 'verified', 'mismatched', 'unavailable')),
  ip_country_signal char(2),
  ip_country_signal_recorded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT country_declarations_declared_country_format
    CHECK (declared_country IS NULL OR declared_country ~ '^[A-Z]{2}$'),
  CONSTRAINT country_declarations_verified_country_format
    CHECK (verified_country IS NULL OR verified_country ~ '^[A-Z]{2}$'),
  CONSTRAINT country_declarations_ip_country_format
    CHECK (ip_country_signal IS NULL OR ip_country_signal ~ '^[A-Z]{2}$')
);

CREATE INDEX IF NOT EXISTS idx_country_declarations_verification_status
  ON compliance.country_declarations (verification_status);

ALTER TABLE compliance.country_declarations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages country declarations"
  ON compliance.country_declarations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "User can view own country declaration"
  ON compliance.country_declarations FOR SELECT
  TO authenticated
  USING (user_id = public.current_auth_user_id());

CREATE POLICY "Compliance admin can view all country declarations"
  ON compliance.country_declarations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = public.current_auth_user_id()
        AND p.role = 'admin'
        AND p.compliance_admin = true
    )
  );

-- ---------------------------------------------------------------------------
-- compliance.policies
-- Versioned policy header. Ships empty (no rows) — never pre-populate with a
-- restricted-country list. `status` moves draft -> active -> (rolled_back |
-- disabled). Rolling back or disabling never deletes history.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS compliance.policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version integer NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'rolled_back', 'disabled')),
  reason text NOT NULL,
  policy_reference text NOT NULL,
  effective_start timestamptz NOT NULL,
  effective_end timestamptz,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  activated_by uuid REFERENCES auth.users(id),
  activated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT policies_effective_range CHECK (effective_end IS NULL OR effective_end > effective_start)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_policies_version ON compliance.policies (version);
CREATE INDEX IF NOT EXISTS idx_policies_status ON compliance.policies (status);

-- Only one active policy at a time (enforced at the application layer on
-- activation too, this is defense in depth).
CREATE UNIQUE INDEX IF NOT EXISTS idx_policies_single_active
  ON compliance.policies ((status))
  WHERE status = 'active';

ALTER TABLE compliance.policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages policies"
  ON compliance.policies FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Compliance admin can view policies"
  ON compliance.policies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = public.current_auth_user_id()
        AND p.role = 'admin'
        AND p.compliance_admin = true
    )
  );

-- ---------------------------------------------------------------------------
-- compliance.policy_country_rules
-- Per-policy-version risk level per ISO 3166-1 alpha-2 country. Absence of a
-- row means `standard` risk.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS compliance.policy_country_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid NOT NULL REFERENCES compliance.policies(id) ON DELETE CASCADE,
  country_code char(2) NOT NULL,
  risk_level text NOT NULL CHECK (risk_level IN ('standard', 'enhanced_review', 'restricted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT policy_country_rules_country_format CHECK (country_code ~ '^[A-Z]{2}$'),
  UNIQUE (policy_id, country_code)
);

CREATE INDEX IF NOT EXISTS idx_policy_country_rules_policy_id
  ON compliance.policy_country_rules (policy_id);

ALTER TABLE compliance.policy_country_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages policy country rules"
  ON compliance.policy_country_rules FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Compliance admin can view policy country rules"
  ON compliance.policy_country_rules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = public.current_auth_user_id()
        AND p.role = 'admin'
        AND p.compliance_admin = true
    )
  );

-- ---------------------------------------------------------------------------
-- compliance.policy_actions
-- Financial actions a policy version applies to. The full set of protected
-- actions is defined in application code (lib/compliance/types.ts); only
-- actions explicitly listed here are affected by a given policy version.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS compliance.policy_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid NOT NULL REFERENCES compliance.policies(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN (
    'donate', 'submit_campaign', 'publish_campaign', 'create_escrow',
    'release_escrow_funds', 'send_assets', 'use_on_ramp', 'use_off_ramp'
  )),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (policy_id, action)
);

CREATE INDEX IF NOT EXISTS idx_policy_actions_policy_id ON compliance.policy_actions (policy_id);

ALTER TABLE compliance.policy_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages policy actions"
  ON compliance.policy_actions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Compliance admin can view policy actions"
  ON compliance.policy_actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = public.current_auth_user_id()
        AND p.role = 'admin'
        AND p.compliance_admin = true
    )
  );

-- ---------------------------------------------------------------------------
-- compliance.exceptions
-- Time-limited, justified exceptions to an active policy for a specific
-- user + action. Revocation keeps history (revoked_at/revoked_by/reason)
-- instead of deleting the row.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS compliance.exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN (
    'donate', 'submit_campaign', 'publish_campaign', 'create_escrow',
    'release_escrow_funds', 'send_assets', 'use_on_ramp', 'use_off_ramp'
  )),
  policy_id uuid REFERENCES compliance.policies(id),
  reason text NOT NULL,
  requested_by uuid NOT NULL REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  revoked_by uuid REFERENCES auth.users(id),
  revoke_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exceptions_expiry_after_start CHECK (expires_at > starts_at),
  CONSTRAINT exceptions_separation_of_duties CHECK (
    approved_by IS NULL OR approved_by <> requested_by
  )
);

CREATE INDEX IF NOT EXISTS idx_exceptions_user_id ON compliance.exceptions (user_id);
CREATE INDEX IF NOT EXISTS idx_exceptions_expires_at ON compliance.exceptions (expires_at);

ALTER TABLE compliance.exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages exceptions"
  ON compliance.exceptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Compliance admin can view exceptions"
  ON compliance.exceptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = public.current_auth_user_id()
        AND p.role = 'admin'
        AND p.compliance_admin = true
    )
  );

-- ---------------------------------------------------------------------------
-- compliance.audit_log
-- Append-only. No UPDATE/DELETE policy is granted to anyone (including
-- compliance admins) so history is immutable at the RLS layer as well.
-- Never store identity documents, biometrics, or full Didit payloads here —
-- only country codes, status enums, and reason text.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS compliance.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN (
    'policy_created', 'policy_updated', 'policy_activated', 'policy_rolled_back',
    'policy_disabled', 'exception_created', 'exception_revoked',
    'authorization_decision', 'mismatch_detected', 'declared_country_set'
  )),
  actor_id uuid REFERENCES auth.users(id),
  target_user_id uuid REFERENCES auth.users(id),
  action text,
  declared_country char(2),
  verified_country char(2),
  effective_country char(2),
  verification_status text,
  enforcement_mode text CHECK (enforcement_mode IN ('disabled', 'monitor', 'enforced')),
  policy_version integer,
  decision_allowed boolean,
  hypothetical_allowed boolean,
  reason_code text,
  exception_id uuid REFERENCES compliance.exceptions(id),
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_compliance_audit_log_event_type ON compliance.audit_log (event_type);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_log_target_user_id ON compliance.audit_log (target_user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_log_created_at ON compliance.audit_log (created_at);

ALTER TABLE compliance.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert audit events"
  ON compliance.audit_log FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read audit events"
  ON compliance.audit_log FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Compliance admin can view audit log"
  ON compliance.audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = public.current_auth_user_id()
        AND p.role = 'admin'
        AND p.compliance_admin = true
    )
  );

-- Intentionally no UPDATE/DELETE policies on compliance.audit_log for any role
-- other than service_role's implicit bypass being restricted to INSERT/SELECT
-- above (no ALL policy is created for audit_log, unlike the other tables).
