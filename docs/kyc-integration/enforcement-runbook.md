# Didit KYC enforcement runbook

Operational runbook for the Didit-backed KYC authorization system. This
system is **shipped disabled** and must stay that way in production until
KindFi has reviewed monitor-mode metrics and explicitly activates it.

Didit is the sole KYC provider. Do not introduce another vendor or a
provider-abstraction layer.

Related code:

- Feature flag: `apps/web/lib/kyc/enforcement-config.ts`
- Authorization service: `apps/web/lib/kyc/authorization-service.ts`
- Status mapping: `apps/web/lib/kyc/status.ts` and [status-mapping.md](./status-mapping.md)
- Didit session store: `kyc.didit_sessions` (dedicated relation; not `notes`)
- Admin metrics: `/admin/kyc`
- Schema: `services/supabase/migrations/20260825000000_kyc_didit_enforcement_infrastructure.sql`

## Environment variables

Server-only (never `NEXT_PUBLIC_*`):

```env
KYC_ENFORCEMENT_MODE=disabled
KYC_ENFORCED_ACTIONS=send_assets,use_off_ramp
```

Supported modes: `disabled` | `monitor` | `enforced`.

Missing `KYC_ENFORCEMENT_MODE` resolves to `disabled`. Invalid values resolve
to `disabled` and log an operational warning.

Missing `KYC_ENFORCED_ACTIONS` resolves to an empty list (nothing is gated
even in `enforced` mode). Unknown action names are skipped with a warning.

### Redeploy requirement

These variables are read from `process.env` in the Next.js server runtime.
**Changing them is not instant.** On Vercel, update the project environment
variables and **redeploy**. For a long-running `next start` process, restart
the process. Preview and production each need their own env + deploy.

The browser may receive a derived hint (`mode` + `enforcedActions`) from
`GET /api/kyc/status` for rendering. That hint is **not** an authorization
boundary. `authorizeFinancialAction` always decides on the server.

## 1. Review monitor-mode metrics

1. Set `KYC_ENFORCEMENT_MODE=monitor` and redeploy.
2. Optionally set `KYC_ENFORCED_ACTIONS` to the actions you intend to gate
   (recommended first set: `send_assets,use_off_ramp`).
3. After a representative traffic window, open `/admin/kyc` (compliance admin)
   and review:
   - Actions performed without approved Didit KYC
   - **Would have blocked** count and per-action breakdown
   - Didit status distribution
   - Status-resolution failures
   - Daily trend
4. Query `kyc.authorization_events` for per-decision detail. Events contain
   user id, action, canonical status, mode, actual vs hypothetical decision,
   reason code, timestamp, and optional asset/amount. They do **not** contain
   identity documents, biometrics, or Didit decision payloads.

Disabled and monitor modes never block or redirect users.

## 2. Select the actions that require enforcement

Allowed action names:

- `donate`
- `submit_campaign`
- `release_escrow_funds`
- `send_assets`
- `use_on_ramp`
- `use_off_ramp`

Only listed actions are evaluated. Everything else is `action_not_covered`
and remains allowed.

## 3. Configure `KYC_ENFORCED_ACTIONS`

Set the comma-separated list in the hosting environment, for example:

```env
KYC_ENFORCED_ACTIONS=send_assets,use_off_ramp
```

## 4. Set `KYC_ENFORCEMENT_MODE=enforced`

Enforced mode requires canonical Didit status `approved` for the configured
actions. Direct API calls cannot bypass this check; each server entry point
calls `authorizeFinancialAction`.

## 5. Redeploy or restart

Redeploy the web app (Vercel) or restart `next start` so the new env values
are loaded. Do not treat this as an instant runtime toggle.

## 6. Verify with test accounts

- **Approved Didit user**: configured actions succeed.
- **Not started / pending / in review / rejected / expired**: configured
  actions return HTTP 403 with `reasonCode` and `requiredAction`
  (`start_kyc`, `wait_for_review`, or `contact_support`). Unlisted actions
  still succeed.
- Confirm Pollar wallet activation still runs after Didit `Approved`.

## 7. Monitor rejection and Didit availability

Watch `/admin/kyc` daily after activation:

- Spike in actual denials vs the monitor-mode baseline
- `provider_unavailable` / status-resolution failures
- Application logs prefixed with `[kyc]` (no Didit decision payloads)

## 8. Rollback

Set `KYC_ENFORCEMENT_MODE=monitor` or `disabled` and **redeploy**. Rollback
does not delete session, history, or audit rows. Users are not blocked while
the mode is `monitor` or `disabled`.

## Protected server entry points

| Action | Entry point |
| ------ | ----------- |
| `donate` | `POST /api/contributions/create`, Trustless Work `escrow/*/fund-escrow` |
| `submit_campaign` | `PATCH /api/projects/[slug]/manage/status` when marking `review` |
| `release_escrow_funds` | Trustless Work `escrow/*/release-funds` |
| `send_assets` | `POST /api/stellar/transfer/prepare`, `POST /api/stellar/transfer/submit`, `POST /api/kyc/authorize` (wallet send preflight) |
| `use_on_ramp` | `POST /api/etherfuse/on-ramp` |
| `use_off_ramp` | `POST /api/etherfuse/off-ramp` |
