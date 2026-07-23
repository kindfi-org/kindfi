# Phase 0: Trustless Work × Pollar Signing Spike

Manual testnet validation checklist before enabling Pollar in production.

## Prerequisites

1. Pollar app on [dashboard.pollar.xyz](https://dashboard.pollar.xyz) (testnet)
2. KindFi env:
   ```bash
   NEXT_PUBLIC_ENABLE_POLLAR_ONBOARDING=true
   NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY=pub_testnet_...
   POLLAR_SECRET_KEY=sec_testnet_...
   ```
3. Pollar Dashboard:
   - **Treasury → Tokens & Trustlines**: USDC configured
   - **Treasury → Funding Mode**: Immediate (spike) or Deferred (NGO path)
   - **Treasury → Sponsorship**: Soroban/contract ops enabled
   - **Treasury → Auth Policy**: Trustless Work escrow contract IDs + function names allowlisted

## Spike steps

1. Sign up via Pollar on `/sign-up` (Google/GitHub/Email)
2. Confirm `profiles.onboarding_provider = 'pollar'` and G-address in profile wallet card
3. Open a test project with deployed TW escrow
4. Donate minimum amount — confirm no wallet extension prompt
5. Verify on-chain: `fundEscrow` tx signed by Pollar G-address
6. Confirm contribution row in `contributions` table

## Auth Policy matrix (test all TW ops used by KindFi)

| Operation | TW method | Pollar `signAndSubmitTx` | Notes |
|-----------|-----------|--------------------------|-------|
| Donate | `fundEscrow` | Required | Primary spike |
| Deploy escrow | `deployEscrow` | Required | Creator flow |
| Release milestone | `releaseFunds` | Required | NGO/admin |
| Update milestone | `updateMilestone` | Required | Creator |
| Dispute | dispute flows | Required | If enabled |

## Failure modes

| Symptom | Likely cause |
|---------|--------------|
| `Auth policy rejected` | Add escrow contract + callee to Pollar Auth Policy |
| `Insufficient balance` | Fund sponsorship wallet or user USDC trustline |
| `Trustline missing` | Pollar Dashboard token config |
| Bridge 401 | `POLLAR_SECRET_KEY` mismatch or expired token |

## Code reference

- Client adapter: `apps/web/lib/pollar/integrations/trustless-work.signer.ts`
- Unified signer: `apps/web/hooks/escrow/use-trustless-signer.ts`
