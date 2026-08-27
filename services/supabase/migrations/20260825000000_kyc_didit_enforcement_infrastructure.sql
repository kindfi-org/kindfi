/*
  migration: Didit KYC enforcement infrastructure
  purpose:
    - Store Didit session identifiers in a dedicated relation (stop searching notes).
    - Idempotent webhook processing with event ids and provider timestamps.
    - Append-only status history and privacy-conscious authorization audit events.
    - Prepare (but do NOT activate) server-side KYC gating. Production mode stays
      `disabled` via KYC_ENFORCEMENT_MODE.
  notes:
    - Didit remains the sole KYC provider. These tables record Didit state only.
    - RLS is service-role for writes. Users already read status via public.kyc_reviews.
*/

CREATE SCHEMA IF NOT EXISTS kyc;

GRANT USAGE ON SCHEMA kyc TO authenticated, anon, service_role;

-- ---------------------------------------------------------------------------
-- kyc.didit_sessions
-- One row per Didit verification session. Lookups use session_id, never notes.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kyc.didit_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
  kyc_review_id uuid REFERENCES public.kyc_reviews(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  session_token text,
  verification_url text,
  didit_status text,
  canonical_status text NOT NULL DEFAULT 'not_started'
    CHECK (canonical_status IN (
      'not_started',
      'pending',
      'in_review',
      'approved',
      'rejected',
      'expired',
      'manual_review',
      'provider_unavailable'
    )),
  last_provider_event_id text,
  last_provider_event_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT didit_sessions_session_id_unique UNIQUE (session_id)
);

CREATE INDEX IF NOT EXISTS idx_didit_sessions_user_id
  ON kyc.didit_sessions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_didit_sessions_canonical_status
  ON kyc.didit_sessions (canonical_status);

ALTER TABLE kyc.didit_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages didit sessions"
  ON kyc.didit_sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- kyc.webhook_events
-- Idempotency key is event_id. Delayed events are stored even when skipped.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kyc.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  session_id text NOT NULL,
  user_id uuid REFERENCES next_auth.users(id) ON DELETE SET NULL,
  webhook_type text,
  didit_status text,
  processing_result text NOT NULL DEFAULT 'applied'
    CHECK (processing_result IN ('applied', 'duplicate', 'stale', 'unmapped', 'error')),
  provider_event_at timestamptz,
  processed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT webhook_events_event_id_unique UNIQUE (event_id)
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_session_id
  ON kyc.webhook_events (session_id, processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_events_processing_result
  ON kyc.webhook_events (processing_result, processed_at DESC);

ALTER TABLE kyc.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages webhook events"
  ON kyc.webhook_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- kyc.status_history
-- Append-only audit of canonical status transitions. No identity documents.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kyc.status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
  session_id text,
  from_didit_status text,
  to_didit_status text,
  from_canonical_status text,
  to_canonical_status text NOT NULL,
  source text NOT NULL
    CHECK (source IN ('webhook', 'callback', 'check_status', 'create_session', 'backfill')),
  provider_event_id text,
  provider_event_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_status_history_user_id
  ON kyc.status_history (user_id, created_at DESC);

ALTER TABLE kyc.status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages status history"
  ON kyc.status_history FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- kyc.authorization_events
-- Privacy-conscious monitor/enforced decision log. No Didit decision payloads.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kyc.authorization_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  current_kyc_status text NOT NULL,
  enforcement_mode text NOT NULL
    CHECK (enforcement_mode IN ('disabled', 'monitor', 'enforced')),
  decision_allowed boolean NOT NULL,
  hypothetical_allowed boolean NOT NULL,
  policy_result text NOT NULL
    CHECK (policy_result IN ('allow', 'deny')),
  reason_code text,
  amount numeric,
  asset text,
  network text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_authorization_events_created_at
  ON kyc.authorization_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_authorization_events_action
  ON kyc.authorization_events (action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_authorization_events_hypothetical
  ON kyc.authorization_events (hypothetical_allowed, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_authorization_events_status
  ON kyc.authorization_events (current_kyc_status, created_at DESC);

ALTER TABLE kyc.authorization_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages authorization events"
  ON kyc.authorization_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Compliance admin can view authorization events"
  ON kyc.authorization_events FOR SELECT
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
-- Backfill Didit session ids previously stored in kyc_reviews.notes JSON.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION kyc.try_parse_notes(notes text)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF notes IS NULL OR btrim(notes) = '' THEN
    RETURN '{}'::jsonb;
  END IF;
  RETURN notes::jsonb;
EXCEPTION WHEN others THEN
  RETURN '{}'::jsonb;
END;
$$;

CREATE OR REPLACE FUNCTION kyc.to_canonical_status(status text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  status_key text;
  compact_key text;
BEGIN
  IF status IS NULL OR status = '' THEN
    RETURN 'not_started';
  END IF;

  status_key := lower(regexp_replace(btrim(status), '\s+', ' ', 'g'));
  compact_key := regexp_replace(status_key, '[\s_-]', '', 'g');

  IF status_key IN ('approved', 'verified') THEN RETURN 'approved'; END IF;
  IF status_key IN ('declined', 'rejected', 'denied') THEN RETURN 'rejected'; END IF;
  IF status_key IN ('in review', 'in_review') OR compact_key = 'inreview' THEN
    RETURN 'in_review';
  END IF;
  IF status_key IN ('not started', 'not_started') OR compact_key = 'notstarted' THEN
    RETURN 'not_started';
  END IF;
  IF status_key IN ('in progress', 'in_progress', 'pending')
    OR compact_key IN ('inprogress', 'pending') THEN
    RETURN 'pending';
  END IF;
  IF status_key IN ('abandoned', 'expired') THEN RETURN 'expired'; END IF;
  IF status_key IN ('manual review', 'manual_review') OR compact_key = 'manualreview' THEN
    RETURN 'manual_review';
  END IF;
  IF status_key = 'provider_unavailable' OR compact_key = 'providerunavailable' THEN
    RETURN 'provider_unavailable';
  END IF;

  RETURN 'pending';
END;
$$;

-- Do not let malformed or unknown production notes silently become pending.
DO $$
DECLARE
  legacy_row record;
  parsed_notes jsonb;
  status_value text;
  status_key text;
  compact_key text;
BEGIN
  FOR legacy_row IN
    SELECT id, notes
    FROM public.kyc_reviews
    WHERE notes IS NOT NULL AND btrim(notes) <> ''
  LOOP
    BEGIN
      parsed_notes := legacy_row.notes::jsonb;
    EXCEPTION WHEN others THEN
      RAISE EXCEPTION 'Cannot enable KYC backfill: kyc_reviews.id % has malformed notes JSON', legacy_row.id;
    END;

    IF jsonb_typeof(parsed_notes) <> 'object' THEN
      RAISE EXCEPTION 'Cannot enable KYC backfill: kyc_reviews.id % notes must be a JSON object', legacy_row.id;
    END IF;

    IF parsed_notes ? 'diditSessionId'
      AND NULLIF(btrim(parsed_notes->>'diditSessionId'), '') IS NULL THEN
      RAISE EXCEPTION 'Cannot enable KYC backfill: kyc_reviews.id % has an empty diditSessionId', legacy_row.id;
    END IF;

    status_value := NULLIF(parsed_notes->>'diditStatus', '');
    IF status_value IS NOT NULL THEN
      status_key := lower(regexp_replace(btrim(status_value), '\s+', ' ', 'g'));
      compact_key := regexp_replace(status_key, '[\s_-]', '', 'g');
      IF status_key NOT IN (
        'not started', 'not_started', 'notstarted', 'in progress', 'in_progress',
        'inprogress', 'pending', 'in review', 'in_review', 'inreview', 'approved',
        'verified', 'declined', 'rejected', 'denied', 'abandoned', 'expired',
        'manual review', 'manual_review', 'manualreview', 'provider_unavailable',
        'providerunavailable'
      ) AND compact_key NOT IN (
        'notstarted', 'inprogress', 'pending', 'inreview', 'manualreview',
        'providerunavailable'
      ) THEN
        RAISE EXCEPTION 'Cannot enable KYC backfill: kyc_reviews.id % has unknown Didit status %', legacy_row.id, status_value;
      END IF;
    END IF;
  END LOOP;
END;
$$;

INSERT INTO kyc.didit_sessions (
  user_id,
  kyc_review_id,
  session_id,
  session_token,
  didit_status,
  canonical_status,
  last_provider_event_at,
  created_at,
  updated_at
)
SELECT
  kr.user_id,
  kr.id,
  notes.didit_session_id,
  notes.didit_session_token,
  notes.didit_status,
  kyc.to_canonical_status(COALESCE(notes.didit_status, kr.status::text)),
  notes.last_updated,
  kr.created_at,
  kr.updated_at
FROM public.kyc_reviews kr
CROSS JOIN LATERAL (
  SELECT
    NULLIF(parsed->>'diditSessionId', '') AS didit_session_id,
    NULLIF(parsed->>'diditSessionToken', '') AS didit_session_token,
    NULLIF(parsed->>'diditStatus', '') AS didit_status,
    CASE
      WHEN parsed->>'lastUpdated' ~ '^[0-9]{4}-' THEN (parsed->>'lastUpdated')::timestamptz
      ELSE NULL
    END AS last_updated
  FROM (SELECT kyc.try_parse_notes(kr.notes) AS parsed) AS raw
) AS notes
WHERE notes.didit_session_id IS NOT NULL
ON CONFLICT (session_id) DO NOTHING;

COMMENT ON SCHEMA kyc IS
  'Didit KYC session, webhook, and authorization audit data. Didit is the sole KYC provider.';
