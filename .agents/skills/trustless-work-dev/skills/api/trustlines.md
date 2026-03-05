# Trustlines

Trustlines are required for accounts to hold and transact with non-native assets (anything other than XLM) on the Stellar network.

## What is a Trustline?

A trustline is an explicit opt-in configuration that authorizes a Stellar account to:
- Hold a specific asset
- Receive that asset
- Transact with that asset

**Without a trustline, an account cannot receive or hold tokens like USDC, EURC, or any other asset.**

## Trustline Requirements

- **0.5 XLM reserve**: Each trustline requires 0.5 XLM in base reserve
- **Increases minimum balance**: Adds to the account's minimum balance requirement
- **Prevents abuse**: Limits spam and unauthorized asset creation
- **Trust limit**: Maximum amount the account is willing to hold
- **Current balance**: Tracks current holdings
- **Liabilities**: Records open offers and other obligations

## Trustline Structure

```typescript
interface Trustline {
  assetCode: string;  // Asset code (e.g., "USDC", "EURC")
  issuer: string;     // Asset issuer's Stellar address
  limit?: string;     // Optional: Maximum amount (defaults to max if not specified)
}
```

## Common Assets

### USDC (Circle)

```typescript
{
  assetCode: "USDC",
  issuer: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  decimals: 10000000  // 7 decimals (divide by 10^7 for human-readable)
}
```

### EURC (Circle)

```typescript
{
  assetCode: "EURC",
  issuer: "GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO",
  decimals: 10000000  // 7 decimals
}
```

## Trustline Configuration in Escrows

When deploying an escrow, you must specify the trustline(s) that will be used for the escrow funds.

### Single-Release Example

```json
{
  "trustline": [
    {
      "assetCode": "USDC",
      "issuer": "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA"
    }
  ]
}
```

### Multi-Release Example

```json
{
  "trustline": [
    {
      "assetCode": "USDC",
      "issuer": "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA"
    }
  ]
}
```

## Setting Up Trustlines

### Before Deploying Escrow

All parties involved in the escrow must have trustlines established:

1. **Payer**: Must have trustline to fund escrow
2. **Service Provider**: Must have trustline to receive payments
3. **Receiver** (if different): Must have trustline to receive funds
4. **Escrow Contract**: Trustline is configured during deployment

### Using Stellar SDK

```typescript
import { Server, Asset, Keypair, Operation } from 'stellar-sdk';

async function establishTrustline(accountKeypair: Keypair, assetCode: string, issuer: string) {
  const server = new Server('https://horizon.stellar.org');
  const account = await server.loadAccount(accountKeypair.publicKey());

  const asset = new Asset(assetCode, issuer);
  
  const transaction = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: Network.PUBLIC
  })
    .addOperation(
      Operation.changeTrust({
        asset: asset,
        limit: '922337203685.4775807' // Max int64
      })
    )
    .setTimeout(30)
    .build();

  transaction.sign(accountKeypair);
  await server.submitTransaction(transaction);
}
```

### Using Wallet Kit

If using Stellar Wallet Kit in React/Next.js:

```typescript
import { useWallet } from '@stellar/wallet-kit';

function TrustlineSetup() {
  const { signTransaction } = useWallet();

  async function establishTrustline(assetCode: string, issuer: string) {
    // Build changeTrust operation
    const operation = {
      type: 'changeTrust',
      asset: {
        code: assetCode,
        issuer: issuer
      },
      limit: '922337203685.4775807'
    };

    // Sign and submit via wallet
    const signedTx = await signTransaction(operation);
    // Submit to network...
  }
}
```

## Trustline Configuration in Code

### TypeScript Constants

```typescript
export const TRUSTLINES = [
  {
    name: "USDC",
    address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
    decimals: 10000000,
    assetCode: "USDC"
  },
  {
    name: "EURC",
    address: "GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO",
    decimals: 10000000,
    assetCode: "EURC"
  }
];

// Helper function to get trustline config
export function getTrustlineConfig(assetCode: string) {
  const trustline = TRUSTLINES.find(t => t.assetCode === assetCode);
  if (!trustline) {
    throw new Error(`Trustline not found for ${assetCode}`);
  }
  return {
    assetCode: trustline.assetCode,
    issuer: trustline.address
  };
}
```

### Usage in Escrow Deployment

```typescript
import { getTrustlineConfig } from './trustlines';

async function deployEscrow() {
  const trustlineConfig = getTrustlineConfig('USDC');

  const deployPayload = {
    // ... other escrow fields
    trustline: [
      {
        assetCode: trustlineConfig.assetCode,
        issuer: trustlineConfig.issuer
      }
    ]
  };

  // Deploy escrow...
}
```

## Amount Handling

### Decimals

Stellar assets typically use 7 decimals. When working with amounts:

```typescript
// Convert human-readable to Stellar amount
function toStellarAmount(amount: number, decimals: number = 7): string {
  return (amount * Math.pow(10, decimals)).toString();
}

// Convert Stellar amount to human-readable
function fromStellarAmount(amount: string, decimals: number = 7): number {
  return parseInt(amount) / Math.pow(10, decimals);
}

// Example
const humanAmount = 100.50; // USDC
const stellarAmount = toStellarAmount(humanAmount); // "1005000000"
const backToHuman = fromStellarAmount(stellarAmount); // 100.50
```

### In Escrow Amounts

When specifying amounts in escrow deployment:

```typescript
// For USDC with 7 decimals
const amount = 5000; // $5000 USD
const stellarAmount = 5000; // API handles conversion, or use raw: 50000000000

const escrowPayload = {
  amount: stellarAmount, // or amount if API handles conversion
  // ...
};
```

## Checking Trustline Status

### Query Account Trustlines

```typescript
import { Server } from 'stellar-sdk';

async function checkTrustline(accountAddress: string, assetCode: string, issuer: string) {
  const server = new Server('https://horizon.stellar.org');
  const account = await server.loadAccount(accountAddress);
  
  const trustline = account.balances.find(
    balance => balance.asset_code === assetCode && balance.asset_issuer === issuer
  );

  return {
    exists: !!trustline,
    balance: trustline?.balance || '0',
    limit: trustline?.limit || '0'
  };
}
```

## Common Issues

### "Asset Not Found" Error

- **Cause**: Account doesn't have trustline for the asset
- **Solution**: Establish trustline before attempting to receive/hold asset

### "Insufficient Balance" Error

- **Cause**: Account doesn't have enough XLM for trustline reserve (0.5 XLM)
- **Solution**: Fund account with at least 0.5 XLM + transaction fees

### "Invalid Asset" Error

- **Cause**: Wrong asset code or issuer address
- **Solution**: Verify asset code and issuer match exactly

## Best Practices

1. **Establish trustlines early**: Set up trustlines before escrow deployment
2. **Verify trustlines**: Check that all parties have required trustlines
3. **Use constants**: Store trustline configs in constants file
4. **Handle decimals**: Always account for asset decimals when calculating amounts
5. **Test on testnet**: Verify trustline setup on Stellar testnet first
6. **Document assets**: Keep a list of supported assets and their configurations

## Example: Complete Trustline Setup

```typescript
// trustlines.ts
export const SUPPORTED_ASSETS = {
  USDC: {
    assetCode: 'USDC',
    issuer: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA',
    decimals: 7,
    name: 'USD Coin'
  },
  EURC: {
    assetCode: 'EURC',
    issuer: 'GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO',
    decimals: 7,
    name: 'Euro Coin'
  }
};

export function getTrustlineForEscrow(assetCode: keyof typeof SUPPORTED_ASSETS) {
  const asset = SUPPORTED_ASSETS[assetCode];
  return {
    assetCode: asset.assetCode,
    issuer: asset.issuer
  };
}

// Usage
const trustline = getTrustlineForEscrow('USDC');
// { assetCode: 'USDC', issuer: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA' }
```
