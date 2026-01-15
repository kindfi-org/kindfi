# Smart Account Kit & Channels Setup Guide

## Overview

This project uses **OpenZeppelin Smart Account Kit** for passkey-secured smart wallets and **OpenZeppelin Channels** service for transaction submission.

## Prerequisites

1. **Install Smart Account Kit SDK**:

   ```bash
   bun add smart-account-kit
   ```

2. **Install Channels Client** (optional, for direct Channels usage):
   ```bash
   bun add @openzeppelin/relayer-plugin-channels
   ```

## Environment Variables

### Required for Smart Account Kit

Add these to your `.env.local` (Next.js client-side variables use `NEXT_PUBLIC_` prefix):

```env
# Smart Account WASM Hash (from OpenZeppelin stellar-contracts)
NEXT_PUBLIC_ACCOUNT_WASM_HASH=<your_account_wasm_hash>

# WebAuthn Verifier Contract Address (from OpenZeppelin stellar-contracts)
NEXT_PUBLIC_WEBAUTHN_VERIFIER_ADDRESS=<your_webauthn_verifier_address>
```

### Optional: Channels Service

Channels is OpenZeppelin's managed infrastructure for transaction submission. Get your API key:

- **Testnet**: https://channels.openzeppelin.com/testnet/gen
- **Mainnet**: https://channels.openzeppelin.com/gen

```env
# Channels API Key (server-side only, not exposed to client)
CHANNELS_API_KEY=<your_channels_api_key>
```

**Note**: Channels service is separate from Smart Account Kit's `relayerUrl`. The SDK may integrate with Channels in the future, but currently Channels is used via `ChannelsClientService` directly.

### Optional: Custom Relayer Proxy

If you have a custom relayer proxy (not Channels):

```env
# Custom relayer proxy URL (for Smart Account Kit SDK)
NEXT_PUBLIC_RELAYER_URL=<your_relayer_proxy_url>
```

### Fallback: Custom Contracts

If Smart Account Kit is not configured, the system falls back to custom contracts:

```env
# Funding account for deploying custom contracts
STELLAR_FUNDING_SECRET_KEY=<your_funding_secret_key>

# Factory contract ID for custom contracts
FACTORY_CONTRACT_ID=<your_factory_contract_id>
```

**Testnet Funding Account**: `GCNN2B23WJT5ZZ25FGK7M6N44SI3S7KUSM6J4GKEHMVN7VDYGC336XPN`

## Getting Contract Addresses

### Option 1: Use Pre-deployed Testnet Contracts (Recommended)

The OpenZeppelin stellar-contracts repository provides pre-deployed testnet contracts. Check their documentation for the latest addresses.

### Option 2: Deploy Your Own Contracts

1. Clone [OpenZeppelin stellar-contracts](https://github.com/OpenZeppelin/stellar-contracts)
2. Build and deploy the contracts:
   ```bash
   cd stellar-contracts
   # Follow their deployment guide
   ```
3. Use the resulting WASM hashes or contract IDs

## Configuration Flow

### Registration Flow

1. **First tries**: Smart Account Kit SDK (OpenZeppelin Smart Accounts)
   - Requires: `NEXT_PUBLIC_ACCOUNT_WASM_HASH` and `NEXT_PUBLIC_WEBAUTHN_VERIFIER_ADDRESS`
   - Uses: `SmartAccountKitService.createWallet()`

2. **Falls back to**: Custom contracts (StellarPasskeyService)
   - Requires: `STELLAR_FUNDING_SECRET_KEY` and `FACTORY_CONTRACT_ID`
   - Uses: `StellarPasskeyService.deployPasskeyAccount()`

### Transaction Submission

- **Channels Service**: Used via `ChannelsClientService` for fee-sponsored transactions
- **Smart Account Kit**: Can use relayer if `relayerUrl` is configured
- **Direct RPC**: Fallback if neither Channels nor relayer is configured

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Registration Flow                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Smart Account Kit SDK (OpenZeppelin)                │
│     ├─ Requires: NEXT_PUBLIC_ACCOUNT_WASM_HASH          │
│     ├─ Requires: NEXT_PUBLIC_WEBAUTHN_VERIFIER_ADDRESS  │
│     └─ Uses: SmartAccountKitService                      │
│                                                          │
│  2. Fallback: Custom Contracts                          │
│     ├─ Requires: STELLAR_FUNDING_SECRET_KEY              │
│     ├─ Requires: FACTORY_CONTRACT_ID                    │
│     └─ Uses: StellarPasskeyService                       │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              Transaction Submission Flow                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Channels Service (OpenZeppelin Managed)              │
│     ├─ Requires: CHANNELS_API_KEY                        │
│     └─ Uses: ChannelsClientService                      │
│                                                          │
│  2. Smart Account Kit Relayer (if configured)           │
│     ├─ Requires: NEXT_PUBLIC_RELAYER_URL                 │
│     └─ Uses: SmartAccountKit SDK                        │
│                                                          │
│  3. Direct RPC (fallback)                               │
│     └─ Uses: Stellar SDK directly                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Testing

### Test Registration

1. Ensure environment variables are set
2. Navigate to `/sign-up`
3. Enter email and register passkey
4. Check server logs for:
   - `✅ Smart Account Kit initialized` (if SDK is configured)
   - `✅ Smart Account created with SDK` (if using OpenZeppelin)
   - `✅ Smart Account created with custom contracts` (if using fallback)

### Test Authentication

1. Navigate to `/sign-in`
2. Enter email and authenticate with passkey
3. Should redirect to `/profile` after successful authentication

## Troubleshooting

### Smart Account Creation Fails

**Check logs for**:

- Missing `NEXT_PUBLIC_ACCOUNT_WASM_HASH` or `NEXT_PUBLIC_WEBAUTHN_VERIFIER_ADDRESS`
- SDK initialization errors
- Network/RPC connection issues

**Solutions**:

1. Verify environment variables are set correctly
2. Check that Smart Account Kit package is installed: `bun add smart-account-kit`
3. Verify contract addresses are correct for your network (testnet/mainnet)

### Channels Submission Fails

**Check logs for**:

- Missing `CHANNELS_API_KEY`
- API key invalid or expired
- Fair use limit exceeded

**Solutions**:

1. Get a new API key from https://channels.openzeppelin.com/testnet/gen
2. Verify API key is set in environment variables
3. Wait for 24-hour reset if limit exceeded

### Fallback to Custom Contracts

If Smart Account Kit is not configured, the system automatically falls back to custom contracts. This requires:

- `STELLAR_FUNDING_SECRET_KEY` (with XLM for fees)
- `FACTORY_CONTRACT_ID` (your factory contract address)

## Next Steps

1. **Get Smart Account Contract Addresses**:
   - Check OpenZeppelin stellar-contracts for testnet addresses
   - Or deploy your own contracts

2. **Get Channels API Key**:
   - Visit https://channels.openzeppelin.com/testnet/gen
   - Save the API key securely

3. **Configure Environment Variables**:
   - Add to `.env.local` (for Next.js)
   - Restart your development server

4. **Test Registration**:
   - Try registering a new passkey
   - Check server logs for success messages

## References

- [Smart Account Kit Documentation](https://github.com/kalepail/smart-account-kit)
- [OpenZeppelin Stellar Contracts](https://github.com/OpenZeppelin/stellar-contracts)
- [Channels Service Guide](https://docs.openzeppelin.com/relayer/1.3.x/guides/stellar-channels-guide)
