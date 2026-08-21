# Classic payment spike (Pollar)

Use this checklist on **testnet** before enabling Pollar sends in production policy.

## Prerequisites

- Pollar onboarding enabled (`NEXT_PUBLIC_ENABLE_POLLAR_ONBOARDING=true`)
- Custodial G-address funded with testnet XLM + USDC trustline
- Second funded G-address for destination tests
- `NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK=development`

## Test matrix

1. Send **0.1 XLM** to destination G-address (no memo)
2. Send **0.1 XLM** to muxed M-address (no memo)
3. Send **1 USDC** to destination G-address with authorized trustline
4. Send with **text memo** (<= 28 bytes)
5. Send with **memo ID**
6. Attempt send to **C-address** — UI must reject before signing
7. Attempt USDC send when destination lacks trustline — preflight must reject

## Auth Policy notes

- Classic payments use locally built unsigned XDR → `client.signAndSubmitTx(unsignedXdr)`
- If Pollar returns policy/auth rejection, update Treasury Auth Policy to allow classic `payment` destinations
- UI exposes `pollar_policy` errors with actionable copy linking to `apps/web/lib/pollar/README.md`

## Record results

| Flow | Result | Notes |
|------|--------|-------|
| XLM → G | | |
| XLM → M | | |
| USDC → G | | |
| Text memo | | |
| Memo ID | | |
| Policy block | | |
