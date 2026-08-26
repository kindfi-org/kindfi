# Pollar Mainnet Rollout Checklist

Gradual rollout guide for KindFi Pollar onboarding (Phase 3).

## Pre-mainnet

- [ ] Complete testnet spike per `apps/web/lib/pollar/spike/trustless-work-fund-escrow-spike.md`
- [ ] Create separate Pollar mainnet app with production keys
- [ ] Configure mainnet USDC trustline and sponsorship limits
- [ ] Auth Policy allowlist for mainnet TW escrow contracts
- [ ] Legal review of custodial wallet disclosure (`auth.pollarCustodyNotice` i18n)
- [ ] Separate funding/gas wallets at scale (Pollar [mainnet checklist](https://docs.pollar.xyz/docs/guides/mainnet-checklist))

## Environment

```bash
NEXT_PUBLIC_ENABLE_POLLAR_ONBOARDING=false   # start disabled
NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY=pub_mainnet_...
POLLAR_SECRET_KEY=sec_mainnet_...            # server-only, Vercel production
```

Apply migration `20260722150000_add_profiles_pollar_fields.sql` to production Supabase.

## Rollout stages

| Stage | Flag | Audience |
|-------|------|----------|
| 1 | `false` | Internal QA only (manual env override) |
| 2 | `true` + 10% | New signups via feature flag / A/B (track `onboarding_path` in GA) |
| 3 | `true` + 50% | Wider beta |
| 4 | `true` default | Pollar primary; passkey via `?flow=passkey` |

## Metrics

Track via `trackOnboardingPath()`:

- `signup_started` / `signup_completed` by path
- `donation_completed` by path

Targets (from integration plan):

- +30% signup completion (start → role selected)
- +20% donation conversion
- &lt;2 min time to first donation
- 50% reduction in wallet-related support tickets (Pollar cohort)

## Ramps evaluation

Compare Pollar ramps (includes Etherfuse) vs existing `fiat-ramps-section.tsx` integration before switching production on-ramps.

## Rollback

Set `NEXT_PUBLIC_ENABLE_POLLAR_ONBOARDING=false`. Legacy passkey + Wallet Kit path remains unchanged. Existing Pollar users retain profiles; escrow signing falls back to Wallet Kit if Pollar session expires.
