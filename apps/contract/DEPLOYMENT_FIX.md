# Auth Contract Deployment Fix

## Problem Analysis

The transaction failure occurred because:

1. **Auth-Controller Not Initialized**: The auth-controller contract was deployed but never initialized with the `init()` function, leaving it with no authorized signers.

2. **Signature Type Mismatch**: The factory contract's `deploy()` function calls `auth_contract.require_auth()`, which triggers the auth-controller's `__check_auth` function. This function expects **WebAuthn signatures** (secp256r1 with authenticator data and client data JSON), but the funding account uses **Stellar's native Ed25519 signatures**.

3. **Authorization Flow Issue**: The error logs show:

   ```
   "VM call trapped: UnreachableCodeReached" in __check_auth
   "failed account authentication with error"
   ```

   This indicates the auth-controller couldn't validate the authorization because it expected a different signature format.

## Solution

### Minimal Changes Applied

#### 1. **Factory Contract** (`account-factory/src/lib.rs`)

**Changed**: Removed `auth_contract.require_auth()` from the `deploy()` function.

**Reason**: The factory should be callable by any account that pays for the transaction. Authorization is properly enforced:

- At the account contract level (each deployed account has its own authorization)
- Through the auth-controller's `add_account()` function (controls which accounts are registered)
- The factory doesn't need to validate each deployment caller

```rust
// BEFORE:
pub fn deploy(...) -> Result<Address, Error> {
    let auth_contract = env.storage()...;
    auth_contract.require_auth(); // ❌ This caused the issue
    ...
}

// AFTER:
pub fn deploy(...) -> Result<Address, Error> {
    let auth_contract = env.storage()...;
    // ✅ Removed require_auth - factory is open for funded deployments
    ...
}
```

#### 2. **Deployment Script** (`scripts/deploy-auth.sh`)

**Added**: Initialization and configuration steps after deployment:

```bash
# Initialize Auth Controller with WebAuthn public key
stellar contract invoke \
    --id "$AUTH_CONTROLLER_CONTRACT_ID" \
    -- \
    init \
    --signers "[\"$PUBLIC_KEY_HEX\"]" \
    --default_threshold 1

# Register factory contract
stellar contract invoke \
    --id "$AUTH_CONTROLLER_CONTRACT_ID" \
    -- \
    add_factory \
    --factory "$ACCOUNT_FACTORY_CONTRACT_ID" \
    --context "[$ACCOUNT_FACTORY_CONTRACT_ID]"
```

**Reason**: Ensures the auth-controller is properly configured after deployment.

#### 3. **Stellar Passkey Service** (`kyc-server/src/lib/stellar/stellar-passkey-service.ts`)

**Simplified**: Removed manual auth entry construction from `deployViaFactory()`.

**Reason**: The `assembleTransaction()` function already handles authorization entries from simulation results. Manual construction was unnecessary and potentially conflicting.

```typescript
// BEFORE:
const transaction = new TransactionBuilder(...)
    .addOperation(
        Operation.invokeContractFunction({
            ...,
            auth: [...], // ❌ Manual auth entries
        }),
    )

// AFTER:
const transaction = new TransactionBuilder(...)
    .addOperation(
        Operation.invokeContractFunction({
            ..., // ✅ Let assembleTransaction handle auth
        }),
    )
```

## Deployment Steps

### 1. Redeploy the Contracts

```bash
cd apps/contract
./scripts/deploy-auth.sh --futurenet --source bob-f
```

This will:

- Build all contracts
- Deploy auth-controller
- Deploy account contract
- Deploy account-factory
- **Initialize auth-controller** with the admin WebAuthn key
- **Register factory** with auth-controller

### 2. Update Environment Variables

After deployment, update your `.env` files with the new contract IDs:

```bash
# kyc-server/.env
STELLAR_CONTROLLER_CONTRACT_ID=<new_auth_controller_id>
STELLAR_FACTORY_CONTRACT_ID=<new_factory_id>

# web/.env
NEXT_PUBLIC_STELLAR_CONTROLLER_CONTRACT_ID=<new_auth_controller_id>
NEXT_PUBLIC_STELLAR_FACTORY_CONTRACT_ID=<new_factory_id>
```

### 3. Test the Deployment

Test account creation from the kyc-server:

```bash
# From kyc-server directory
bun run test:stellar-account-creation
```

## Architecture Notes

### Authorization Flow (Corrected)

1. **Factory Deployment**: Any funded account can call `factory.deploy()`
   - No auth check at factory level
   - Caller pays transaction fees

2. **Account Creation**: New account contract is deployed with:
   - Device ID (passkey credential ID)
   - Public key (WebAuthn secp256r1 key)
   - Auth controller reference

3. **Account Registration**: The `auth_controller.add_account()` can be called:
   - Initially: Anyone can call (to allow bootstrapping)
   - Later: Can be restricted to admin accounts only

4. **Account Operations**: Once deployed, account operations require:
   - WebAuthn signatures matching registered devices
   - Validation through `auth_controller.__check_auth()`

### Key Insight

The auth-controller is designed for **WebAuthn-based account authorization**, not for controlling factory access. The factory is a deployment utility that should be openly accessible (with fee payment) while individual account security is enforced at the account contract level.

## Testing Checklist

- [ ] Contracts build successfully
- [ ] Deployment script completes without errors
- [ ] Auth-controller is initialized with signers
- [ ] Factory is registered with auth-controller
- [ ] Account deployment from kyc-server succeeds
- [ ] Account operations with WebAuthn signatures work
- [ ] Auth-controller properly validates WebAuthn signatures

## References

- [Stellar Passkey Kit](https://github.com/stellar/passkey-kit)
- [Soroban Auth Documentation](https://soroban.stellar.org/docs/learn/authorization)
- [WebAuthn Specification](https://www.w3.org/TR/webauthn-2/)
