# Pollar Integration (KindFi)

Isolated module for [Pollar](https://docs.pollar.xyz) social/email wallet onboarding bridged into KindFi's NextAuth session.

## Feature flag

```bash
NEXT_PUBLIC_ENABLE_POLLAR_ONBOARDING=true
NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY=pub_testnet_...
POLLAR_SECRET_KEY=sec_testnet_...   # server-only
```

## Architecture

```
Pollar login (Google/GitHub/Email)
  → Pollar SDK session (custodial G-address)
  → POST /api/auth/pollar/callback (prefer POST /v1/tokens/verify; fallback SDK JWT claims when API 404)
  → profiles upsert (onboarding_provider=pollar)
  → signIn('pollar') → NextAuth JWT
  → Donations/escrow via signAndSubmitTx(unsignedXdr)
```

## Dashboard setup (required)

1. **Treasury → Tokens & Trustlines**: USDC for your network
2. **Treasury → Funding Mode**: Immediate (dev) or Deferred + KYC activation (prod NGOs)
3. **Treasury → Sponsorship**: Enable Soroban/contract ops for Trustless Work escrow
4. **Treasury → Auth Policy**: Allowlist TW escrow contract IDs + function names in call tree
5. **Application → Allowed redirect URIs**: Add your dev origin (e.g. `http://localhost:3000`) and production URL — required for Google/GitHub OAuth **and** for server-side session verification (`ORIGIN_NOT_ALLOWED` if missing)

## Client wiring checklist

- `KindfiPollarProvider` wraps the app with `@pollar/react/styles.css` imported
- Client SDK uses `https://sdk.api.pollar.xyz` (not `api.pollar.xyz` — that's server-only)
- CSP `connect-src` must include `https://sdk.api.pollar.xyz`
- Use `login({ provider: 'google' })` from `usePollar()`, not a raw fetch

## Trustless Work signing spike

Validate on testnet before mainnet:

1. Create Pollar test user with USDC balance
2. Deploy a TW escrow with Pollar G-address as signer
3. Call `fundEscrow` → pass unsigned XDR to `signAndSubmitTx`
4. Confirm Auth Policy allows the escrow invocation

See `spike/trustless-work-fund-escrow-spike.md` for the testnet validation checklist.

## Dual onboarding paths

- **Pollar** (default when flag on): `/sign-up`, `/sign-in` — no passkey, no wallet extension
- **Legacy passkey**: `/sign-up?flow=passkey`, `/sign-in?flow=passkey`

## Deferred funding + KYC

When using Pollar Deferred mode, `POST /api/pollar/wallets/activate` is called automatically from the Didit KYC webhook on approval.

## Troubleshooting

### `401` on `POST /v2/auth/refresh`

Usually a **stale or reused refresh token** in browser storage — common in dev when React remounts multiple SDK clients.

1. **One-time fix:** DevTools → Application → clear site data for `localhost:3000` (or run `clearStalePollarStorage()` from the browser console after importing the helper).
2. **Code fix (already applied):** `KindfiPollarProvider` passes a **singleton** `PollarClient` instance (not a config object) so remounts do not create competing refresh loops.
3. Sign in again with Pollar after clearing storage.


The SDK calls this once on load to verify a persisted session. Common causes:

1. **Pollar provider remounting** — keep `KindfiPollarProvider` outside `SessionProvider` so NextAuth key changes do not recreate the SDK client.
2. **Aggressive logout loops** — do not call `client.logout()` while `verified` is still `false`; wait for the SDK to finish resume.
3. **Testnet daily cap** — testnet keys are limited to ~1,000 requests/day; wait for UTC reset or contact Pollar for a bump.
4. **Dashboard domains** — add every origin you use (`http://localhost:3000`, preview URLs, production) under **Build → Domains**. Missing origins cause failed resumes and retries.

### User completes Pollar login but KindFi session is missing

The bridge runs only after Pollar sets `verified: true` (server confirmed session). Ensure:

- `loginWithPollar()` (not raw `openLoginModal()`) was used so auto-bridge is armed.
- `POLLAR_SECRET_KEY` matches the same Pollar app and network as `NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY` (used for `POST /v1/tokens/verify`, not local JWT decode).
- Pollar account includes an email (required for KindFi profile linking).


- Pollar smart-wallet (C-address) for escrow — Trustless Work requires G-address signing
- `NEXT_PUBLIC_ENABLE_SMART_ACCOUNT_CREATION` remains separate and off in production
