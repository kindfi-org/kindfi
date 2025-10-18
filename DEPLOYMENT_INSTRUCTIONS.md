# Deployment Instructions - Auth Contract Fix

## Summary of Changes

We've identified and fixed the authorization issue preventing account deployment from the KYC server. The problem was a signature type mismatch between the factory contract's expectations and what the funding account provides.

## Changes Made

### 1. Factory Contract (`account-factory/src/lib.rs`)
- **Removed**: `auth_contract.require_auth()` call in the `deploy()` function
- **Reason**: The auth-controller expects WebAuthn signatures, but the funding account uses Ed25519 signatures. The factory should be open for any funded deployment.

### 2. Deployment Script (`scripts/deploy-auth.sh`)
- **Added**: Auth-controller initialization after deployment
- **Added**: Factory registration with auth-controller
- **Added**: Enhanced deployment info output with initialization status

### 3. Stellar Passkey Service (`kyc-server/src/lib/stellar/stellar-passkey-service.ts`)
- **Simplified**: Removed manual auth entry construction
- **Reason**: The `assembleTransaction()` function handles authorization automatically from simulation results

## Deployment Steps

### Step 1: Redeploy Contracts

```bash
cd apps/contract
./scripts/deploy-auth.sh --futurenet --source bob-f
```

**Expected Output:**
- ✅ All contracts built successfully
- ✅ Auth Controller deployed
- ✅ Account Contract deployed  
- ✅ Account Factory deployed
- ✅ Auth Controller initialized with admin signer
- ✅ Factory contract registered with auth controller

### Step 2: Update Environment Variables

After deployment, you'll need to update the contract IDs in your environment files:

#### KYC Server (`.env`)
```bash
STELLAR_CONTROLLER_CONTRACT_ID=<from_deployment_info>
STELLAR_FACTORY_CONTRACT_ID=<from_deployment_info>
STELLAR_ACCOUNT_WASM_HASH=<from_deployment_info>
```

#### Web App (`.env` or `.env.local`)
```bash
NEXT_PUBLIC_STELLAR_CONTROLLER_CONTRACT_ID=<from_deployment_info>
NEXT_PUBLIC_STELLAR_FACTORY_CONTRACT_ID=<from_deployment_info>
```

The deployment info is saved in `apps/contract/auth-deployment-info-futurenet.txt`.

### Step 3: Restart Services

```bash
# Restart KYC Server
cd apps/kyc-server
bun run dev

# Restart Web App (in another terminal)
cd apps/web  
bun run dev
```

### Step 4: Test Account Creation

Test the account creation flow:

1. **Via Web App**:
   - Navigate to KYC registration
   - Create a new passkey
   - Submit KYC application
   - Verify account is created on Stellar

2. **Via KYC Server API** (if you have test scripts):
   ```bash
   cd apps/kyc-server
   bun run test:stellar-account-creation
   ```

## Verification Checklist

After deployment, verify:

- [ ] Contracts deployed successfully
- [ ] Auth-controller initialized (check deployment info file)
- [ ] Factory registered with auth-controller
- [ ] Environment variables updated in both apps
- [ ] Services restarted
- [ ] Account creation from web app works
- [ ] Account creation from KYC server works
- [ ] No "UnreachableCodeReached" errors in logs
- [ ] Transaction completes successfully

## Troubleshooting

### Issue: Deployment fails with "already initialized"
**Solution**: The auth-controller is already initialized. This is expected if redeploying. You can skip the init step or deploy fresh contracts.

### Issue: Environment variables not updated
**Solution**: Make sure to restart the services after updating `.env` files. Run `bun run dev` in both `kyc-server` and `web` directories.

### Issue: Still getting authorization errors
**Solution**: 
1. Verify the factory contract WASM was rebuilt with the changes
2. Check that the new factory contract ID is in your `.env` files
3. Ensure the auth-controller is initialized: 
   ```bash
   stellar contract invoke --network futurenet --source bob-f \
     --id <CONTROLLER_ID> -- get_signers
   ```

### Issue: Transaction simulation works but execution fails
**Solution**: This was the original issue. After the fix:
- Simulation AND execution should both work
- No manual auth entries needed
- The factory is now callable by any funded account

## Architecture Notes

### Authorization Model (Corrected)

```
┌─────────────────┐
│  Funding Acct   │ (Ed25519 signature)
│   (bob-f)       │
└────────┬────────┘
         │ pays fees & signs
         ↓
┌─────────────────┐
│ Factory Contract│ (No auth check)
│                 │
└────────┬────────┘
         │ deploys
         ↓
┌─────────────────┐
│ Account Contract│ (WebAuthn secured)
│                 │
└────────┬────────┘
         │ validates via
         ↓
┌─────────────────┐
│ Auth Controller │ (WebAuthn signatures)
│                 │
└─────────────────┘
```

**Key Points:**
1. Factory is **open** - any funded account can deploy
2. Each deployed account is **secured** with WebAuthn
3. Auth-controller validates **WebAuthn signatures only**
4. Funding account pays fees but doesn't need WebAuthn auth

## Files Modified

1. `apps/contract/contracts/auth-contracts/account-factory/src/lib.rs`
2. `apps/contract/scripts/deploy-auth.sh`
3. `apps/kyc-server/src/lib/stellar/stellar-passkey-service.ts`

## Rollback Plan

If issues arise, you can rollback by:

1. Reverting the contract changes:
   ```bash
   git checkout HEAD~1 apps/contract/contracts/auth-contracts/account-factory/src/lib.rs
   ```

2. Using the previous deployment info:
   ```bash
   cp auth-deployment-info-futurenet.txt.backup auth-deployment-info-futurenet.txt
   ```

3. Restoring old contract IDs in `.env` files

## Support

If you encounter issues:
1. Check the transaction logs in the KYC server console
2. Verify contract IDs match between deployment info and `.env` files
3. Review the diagnostic events in failed transactions
4. Ensure the auth-controller has at least one registered signer

## References

- Transaction Meta XDR analysis → Showed "UnreachableCodeReached" in `__check_auth`
- Auth-controller source → Expects WebAuthn `SignedMessage` structures
- Factory contract → Was calling `require_auth()` on wrong auth type
- Stellar Passkey Kit → https://github.com/stellar/passkey-kit
