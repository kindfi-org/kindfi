# Didit status mapping

KindFi uses **Didit** as the sole KYC provider. This table is the single mapping
from Didit session statuses (and a few stored aliases) to KindFi's canonical
authorization states. Normalization lives in `apps/web/lib/kyc/status.ts` and
must not be reimplemented in API routes.

| Didit status | Canonical state | Stored `kyc_reviews.status` | Notes |
| ------------ | --------------- | --------------------------- | ----- |
| `Not Started` | `not_started` | `pending` | Session created; user has not begun. |
| `In Progress` | `pending` | `pending` | User is in the Didit flow. |
| `In Review` | `in_review` | `pending` | Documents submitted; awaiting Didit review. |
| `Approved` | `approved` | `approved` | Authoritative allow state. |
| `Verified` | `approved` | `approved` | Legacy alias of Approved. Both map to canonical `approved`. |
| `Declined` | `rejected` | `rejected` | Didit declined the session. |
| `Rejected` | `rejected` | `rejected` | Alias of Declined. |
| `Abandoned` | `expired` | `pending` | User left the flow. |
| `Expired` | `expired` | `pending` | Session timed out. |
| `Manual Review` | `manual_review` | `pending` | Escalated; KindFi cannot auto-approve. |
| *(Didit API unreachable)* | `provider_unavailable` | unchanged | Used when a live check fails; never overwrites an existing approved row. |
| *(no session)* | `not_started` | — | User has not started Didit. |
| Unknown Didit value | `pending` | `pending` | Counted as a status-resolution failure when ingested from a webhook. |

## approved vs verified

The historical `kyc_status_enum` includes both `approved` and `verified`. Didit
reports `Approved`. Older KindFi code sometimes stored `verified`. Both now
normalize to canonical **`approved`**, which is the only status that satisfies
enforced-mode policy.

## Where mapping happens

- `toCanonicalKycStatus` — Didit or DB string → canonical
- `toKycDbStatus` — canonical → `kyc_status_enum` for `public.kyc_reviews`
- `authorizeFinancialAction` — reads canonical status from `kyc.didit_sessions`
  (falling back to `kyc_reviews` when no session row exists)
