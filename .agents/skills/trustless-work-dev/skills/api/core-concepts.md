# Core Concepts

## Overview

Trustless Work enables trust-minimized conditional payments on Stellar blockchain using Soroban smart contracts. It's ideal for freelancing, gig work, and milestone-based projects.

## Escrow Lifecycle

### Single-Release Escrow Flow

1. **Deploy**: Initialize escrow with roles, milestones, and configuration
2. **Fund**: Lock funds (escrow amount + platform fee) in escrow account
3. **Complete Milestone**: Service provider marks milestone(s) as complete
4. **Approve**: Approver verifies and approves milestone(s)
5. **Release**: Funds released to Service Provider or Receiver (single payment)
6. **Dispute** (optional): Any party can initiate dispute
7. **Resolve**: Dispute Resolver decides release or refund

### Multi-Release Escrow Flow

1. **Deploy**: Initialize escrow with roles and milestones
2. **Fund**: Lock total funds (sum of all milestone amounts + platform fee)
3. **Complete Milestone**: Service provider marks milestone as complete
4. **Approve**: Approver verifies and approves milestone
5. **Release**: Funds for that milestone released immediately
6. **Repeat**: Steps 3-5 for each milestone
7. **Withdraw Remaining**: Dispute Resolver can withdraw remaining funds after completion

## Key Roles

### Required Roles

- **Payer/Signer**: Funds the escrow, signs deployment transaction
- **Service Provider**: Delivers deliverables, marks milestones complete
- **Approver**: Verifies deliverables, approves milestones for release
- **Dispute Resolver**: Intervenes in disagreements, decides release/refund

### Optional Roles

- **Receiver**: Final recipient of funds (defaults to Service Provider if not specified)
- **Release Signer**: Executes release/refund transactions (platform role)

### Role Structure

```typescript
interface Role {
  address: string;  // Stellar account address
  type: 'payer' | 'serviceProvider' | 'approver' | 'disputeResolver' | 'receiver' | 'releaseSigner';
}
```

**Example:**
```json
{
  "roles": [
    {
      "address": "GABC123...",
      "type": "payer"
    },
    {
      "address": "GDEF456...",
      "type": "serviceProvider"
    },
    {
      "address": "GGHI789...",
      "type": "approver"
    },
    {
      "address": "GJKL012...",
      "type": "disputeResolver"
    }
  ]
}
```

## Escrow Flags

Status tracked via boolean flags:

- **approved**: Milestone(s) approved for release
- **dispute**: Escrow is in dispute
- **released**: Funds have been released
- **resolved**: Dispute has been resolved

## API Authentication

All API requests require an API key:

```
Authorization: Bearer YOUR_API_KEY
```

### Getting an API Key

1. Connect wallet to https://dapp.trustlesswork.com/dashboard
2. Click wallet address (bottom left)
3. Go to Settings
4. Complete profile (name, email, use case - **required**)
5. Generate API key

## Base URL

Production: `https://api.trustlesswork.com`

## Common Error Types

```typescript
enum ApiErrorTypes {
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  WALLET_ERROR = "WALLET_ERROR",
}
```

## HTTP Status Codes

- **200/201**: Success
- **400**: Bad request (missing/invalid parameters)
- **401**: Unauthorized (invalid/missing API key)
- **429**: Too many requests (rate limiting)
- **500**: Server error (escrow not found, unexpected errors)

## Transaction Pattern

All escrow operations follow this pattern:

1. **Call API endpoint** → Returns unsigned XDR transaction
2. **Sign transaction** → Use wallet to sign XDR
3. **Submit transaction** → POST to `/helper/send-transaction` with signed XDR
4. **Verify on-chain** → Query escrow with `validateOnChain=true`

### Example Transaction Flow

```typescript
// 1. Get unsigned transaction
const response = await fetch('/deployer/single-release', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(deployPayload)
});

const { xdr } = await response.json();

// 2. Sign with wallet
const signedXdr = await wallet.signTransaction(xdr);

// 3. Submit transaction
const submitResponse = await fetch('/helper/send-transaction', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ xdr: signedXdr })
});

// 4. Verify on-chain
const verifyResponse = await fetch(
  `/helper/get-escrow-by-contract-ids?contractIds=${contractId}&validateOnChain=true`,
  {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  }
);
```

## Best Practices

### Security

1. **Never expose API keys** in client-side code or public repos
2. **Use environment variables** for all sensitive configuration
3. **Validate on-chain** when displaying escrow data (`validateOnChain=true`)
4. **Verify transaction signatures** before submitting
5. **Handle errors gracefully** with user-friendly messages

### Error Handling

```typescript
async function callTrustlessWorkAPI(endpoint: string, options: RequestInit) {
  try {
    const response = await fetch(`https://api.trustlesswork.com${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${process.env.TRUSTLESS_WORK_API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      
      switch (response.status) {
        case 401:
          throw new Error('Invalid API key. Check your API key in settings.');
        case 404:
          throw new Error('Escrow not found');
        case 429:
          throw new Error('Rate limit exceeded. Please try again later.');
        default:
          throw new Error(error.message || `API error: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Trustless Work API Error:', error);
    throw error;
  }
}
```

### State Management

- Track escrow status locally but always verify with API
- Use `validateOnChain=true` for critical operations
- Poll for status updates during active workflows
- Cache escrow data but refresh before important actions
