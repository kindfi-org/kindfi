# Country-risk compliance runbook

Operational runbook for the country-risk restriction system introduced in
issue #1009. This system is **shipped disabled** and must stay that way in
production until KindFi has approved an actual restricted-jurisdiction
policy through the process below.

Related code:

- Feature flag: `apps/web/lib/compliance/country-risk-config.ts`
- Authorization service: `apps/web/lib/compliance/authorization-service.ts`
- Policy/exception management: `apps/web/lib/compliance/policy-service.ts`
- Country declarations: `apps/web/lib/compliance/country-declaration-service.ts`
- Didit sync stub: `apps/web/lib/compliance/didit-country-sync.ts`
- Admin UI: `apps/web/app/(routes)/admin/compliance/`
- Schema: `services/supabase/migrations/20260810000000_create_compliance_country_risk_schema.sql`

## 1. Validate onboarding country coverage

1. Query `compliance.country_declarations` for users created in the last N
   days and confirm `declared_country` is populated for active accounts.
2. Since the dedicated onboarding flow (issue #1006) is not merged as of
   this change, declared country is currently collected from the **profile
   settings page** (`Settings` tab → "Country of residence" card), not
   signup. Until #1006 lands and is updated to call
   `setDeclaredCountry`/`updateDeclaredCountryAction`, expect a gap for
   users who signed up but never visited profile settings — this is a known,
   documented limitation, not a bug.
3. Coverage gaps do not block anything while `COUNTRY_RISK_MODE=disabled`
   or `monitor`.

## 2. Confirm Didit verified-country sync

`apps/web/lib/compliance/didit-country-sync.ts` is a **stub**. The Didit
webhook (`apps/web/app/api/kyc/didit/webhook/route.ts`) does not currently
call it — it processes verification status only. Before relying on verified
country in any way:

1. Confirm which Didit workflow the KYC session uses and whether it returns
   a country field in the `decision` payload.
2. Wire `syncVerifiedCountryFromDidit(userId, countryCode)` into the webhook
   handler once the payload shape is confirmed.
3. Until this is wired, `verification_status` will never reach `verified`
   for real users — spot-check `compliance.country_declarations` to confirm
   this before turning on `monitor` mode expecting verified-country signal.

## 3. Review monitoring-mode impact

1. Set `COUNTRY_RISK_MODE=monitor` in the target environment and redeploy
   (server-only env var — **requires a redeploy**, cannot be flipped at
   runtime).
2. Create at least one draft policy in `/admin/compliance` with country
   rules and affected actions, then activate it. Monitor mode audits
   hypothetical decisions but never blocks users.
3. After a representative window (a few days of traffic), review the
   metrics tiles on `/admin/compliance`:
   - "Would restrict" count and its trend
   - Mismatch count
   - Manual review signal volume
4. Query `compliance.audit_log` directly for `event_type =
   'authorization_decision'` rows to see per-decision detail
   (`hypothetical_allowed`, `reason_code`, `effective_country`).

## 4. Create and approve a policy version

1. In `/admin/compliance`, use "Create draft policy" — fill in name, a
   mandatory internal reason, a policy reference (e.g. a ticket/legal doc
   ID), effective start (and optional end), country risk rules
   (`CODE:risk_level`), and affected actions.
2. Draft policies never affect live decisions until explicitly activated.
3. Get the policy reference and reason reviewed/approved outside this
   system (legal/compliance sign-off) before activating.

## 5. Configure affected actions

Only actions selected on the active policy version are evaluated —
everything else is `action_not_covered` and always allowed. The full
protected-action surface is defined in `PROTECTED_ACTIONS`
(`apps/web/lib/compliance/types.ts`): `donate`, `submit_campaign`,
`publish_campaign`, `create_escrow`, `release_escrow_funds`, `send_assets`,
`use_on_ramp`, `use_off_ramp`. As of this change, only `donate`
(`apps/web/app/api/contributions/create/route.ts`) has a real server-side
enforcement point calling `evaluateCountryRiskAuthorization`. The others are
defined in the type/policy layer but have no server-side call site yet —
adding one is a prerequisite before including them in an active policy in a
way that has any real effect.

## 6. Activate enforced mode

1. Activate the reviewed policy version in `/admin/compliance` (requires a
   reason).
2. Set `COUNTRY_RISK_MODE=enforced` and redeploy.
3. Enforcement only affects the actions explicitly listed on the active
   policy version. It never blocks account/profile access, KYC status view,
   transaction/donation history, support/appeal info, or approved
   fund-resolution actions — those are outside `PROTECTED_ACTIONS` entirely.

## 7. Test with representative accounts before/after activating

Prepare test accounts covering:

- **Standard**: declared + verified country both map to `standard` risk (or
  no policy rule) — action should succeed.
- **Enhanced review**: country maps to `enhanced_review` — action succeeds
  but is flagged (`requiredAction: 'manual_review'`).
- **Restricted**: country maps to `restricted` — action blocked with
  `requiredAction: 'contact_support'`.
- **Mismatched**: declared and verified country differ — confirm this never
  blocks by itself, only raises a manual-review signal
  (`reasonCode: 'mismatch_manual_review'`).
- **Exception**: create a time-limited exception for a restricted-country
  user/action pair and confirm the action succeeds while the exception is
  active, and is blocked again once it expires or is revoked.

## 8. Monitor denial/error rates after activation

1. Watch `/admin/compliance` metrics daily for the first activation window.
2. Alert on a sudden spike in `actualRestrictedCount` relative to recent
   `hypotheticalRestrictedCount` history from monitor mode — a mismatch
   between the two suggests a policy or country-mapping error, not a real
   change in user population.
3. Watch application error logs for `[compliance]`-prefixed entries — the
   authorization service logs but never throws on its own DB failures other
   than returning safe defaults (never fails open into a block).

## 9. Disable or roll back

- **Disable enforcement** (keeps all policy/audit history): use "Disable
  active policy" in `/admin/compliance` (requires a reason), then set
  `COUNTRY_RISK_MODE=disabled` (or `monitor`) and redeploy. Disabling does
  not delete any policy, rule, exception, or audit row.
- **Roll back to an earlier version**: select a `rolled_back` policy version
  in the list and use "Roll back to this version" (requires a reason). This
  re-activates that version through the same single-active-policy path used
  by normal activation.

## 10. Resolving users with pending funds or escrows

This system **never** auto-seizes, redirects, freezes, or strands funds —
that is an explicit non-goal of issue #1009 and nothing in this codebase
implements it. If a restricted or manual-review user has pending
donations/escrow actions:

1. Do not attempt an automated resolution — none exists, and none should be
   built as a side effect of a compliance decision.
2. Use a time-limited exception (with justification, and with an approver
   different from the requester) to unblock the specific action needed to
   reach a safe state, or escalate to manual review and handle the
   fund-resolution step through existing escrow/support tooling outside
   this system.
3. Revoke the exception once resolved.

## Known gaps (see also the PR description)

- Didit verified-country sync is a stub, not wired to the live webhook.
- Only `donate` has a real enforcement call site; the other seven protected
  actions are defined but not wired.
- The onboarding country-of-residence step lives on the profile settings
  page, not true onboarding, until issue #1006 merges.
- `compliance_admin` is a new profile column; existing generated Supabase
  types need `task supabase:gen` against a live database to pick it up.
