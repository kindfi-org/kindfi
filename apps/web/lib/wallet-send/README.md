# Wallet send (classic G-address transfers)

Profile **Send assets** uses classic Stellar `Operation.payment` for **XLM** and network-configured **USDC** (issuer trustline). This module is intentionally separate from Trustless Work escrow flows.

## Scope

- G-address and muxed M-address destinations
- Optional text (28-byte) or ID memos
- Pollar custodial signing via `signAndSubmitTx` on verified unsigned XDR
- Stellar Wallets Kit signing + Horizon submission
- Horizon preflight for reserves, trustlines, and destination existence (USDC)

## Out of scope

- Smart-account C-address sends
- Soroban SAC transfers
- Escrow fund/release or TW proxy routes
- Automatic trustline creation / claimable balances

## Network configuration

Use `getWalletTransferConfig()` from `~/lib/config/wallet-transfer.config`. It aligns with `getClientStellarNetworkId()` and fails closed when passphrase, Horizon URL, or USDC issuer are inconsistent.

## Manual QA checklist

- Pollar user: send XLM + USDC to G and M destinations with/without memo
- Wallet Kit user: same flows on matching network
- Reject C-address destination
- Reject USDC send when destination lacks authorized trustline / limit
- Reject spending below XLM reserve
- Stale sequence retry path (refresh balances and retry)
- Explorer link uses configured network
- Confirm no escrow contract interaction in browser network tab

## Key paths

| Area | Path |
|------|------|
| Validation | `validation/` |
| Preflight | `horizon/preflight.ts` |
| Build / verify | `transaction/` |
| Submit | `submit/horizon-submit.ts` |
| UI | `components/sections/profile/cards/send-assets/` |
