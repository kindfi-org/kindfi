# KindFi Mainnet Contract Deployment

Guide for deploying all KindFi Soroban contracts to Stellar **mainnet**.

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| **Stellar CLI** ≥ 25.x | `stellar --version` |
| **Funded mainnet identity** | Recommend **50+ XLM** for full deployment |
| **Rust toolchain** | `rustup target add wasm32-unknown-unknown` |
| **Production admin passkey** | WebAuthn credential for auth-controller admin (if deploying auth) |
| **Service account** | `SOROBAN_PRIVATE_KEY` for recorder role grants |

### 1. Configure mainnet identity

```bash
stellar keys add production --secret-key "S..."
stellar keys address production
```

Verify balance on [Stellar Expert](https://stellar.expert/explorer/public).

### 2. Set production passkey (auth contracts only)

The auth controller is initialized with a **WebAuthn secp256r1 public key** (not the Ed25519 funding key).

```bash
export ADMIN_CREDENTIAL_ID="your-production-credential-id"
export ADMIN_PUBLIC_KEY_HEX="04..."   # 130 hex chars, uncompressed secp256r1
# OR
export ADMIN_PUBLIC_KEY_BASE64="pQECAyYg..."
```

### 3. Build and test on testnet first

```bash
cd apps/contract
cargo test
./scripts/deploy-all-mainnet.sh --help   # review options
```

Always validate the full flow on testnet before mainnet.

## Deployment options

### Option A — Full orchestrated deploy (recommended)

```bash
cd apps/contract

export ADMIN_CREDENTIAL_ID="..."
export ADMIN_PUBLIC_KEY_HEX="..."
export SOROBAN_PRIVATE_KEY="S..."   # recorder/service account

chmod +x scripts/*.sh
./scripts/deploy-all-mainnet.sh --source production
```

This runs all contracts in order and writes `mainnet-env-template.txt`.

Use `--skip-auth` if you only need platform contracts (NFT, reputation, gamification, governance) and already use **smart-account-kit** for wallets.

### Option B — Step-by-step

```bash
cd apps/contract

# 1. Auth (controller, account WASM, factory)
./scripts/deploy-auth.sh --mainnet --source production

# 2. NFT
./scripts/deploy-nft.sh --mainnet --source production

# 3. Reputation (pass NFT contract ID from step 2)
./scripts/deploy-reputation.sh --mainnet --source production --nft-contract <NFT_ID>

# 4. Gamification (requires reputation ID)
./scripts/deploy-quest.sh --mainnet --source production --reputation-contract <REP_ID>
./scripts/deploy-streak.sh --mainnet --source production --reputation-contract <REP_ID>
./scripts/deploy-referral.sh --mainnet --source production --reputation-contract <REP_ID>

# 5. Governance
./scripts/deploy-governance.sh --mainnet --source production --reputation-contract <REP_ID>
```

### Post-deployment setup

```bash
# Grant metadata_manager on NFT → Reputation
stellar contract invoke --network mainnet --source production --id <NFT_ID> \
  -- grant_role --account <REPUTATION_ID> --role 'metadata_manager' --caller <ADMIN_G_ADDRESS>

# Grant recorder roles on gamification contracts
./scripts/setup-gamification-contracts.sh \
  --mainnet \
  --source production \
  --recorder-address <RECORDER_G_ADDRESS> \
  --streak-contract <STREAK_ID> \
  --referral-contract <REFERRAL_ID> \
  --quest-contract <QUEST_ID>

# Or from apps/web (uses .env):
cd apps/web
npx tsx scripts/grant-recorder-role.ts
```

## Network configuration

After deployment, update **production** environment variables:

```env
NETWORK_PASSPHRASE="Public Global Stellar Network ; September 2015"
RPC_URL="https://soroban.stellar.org"
HORIZON_URL="https://horizon.stellar.org"
STELLAR_NETWORK_URL="https://horizon.stellar.org"

NATIVE_TOKEN_CONTRACT="CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA"
NEXT_PUBLIC_NATIVE_TOKEN_CONTRACT="CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA"

FACTORY_CONTRACT_ID="<from auth-deployment-info-mainnet.txt>"
CONTROLLER_CONTRACT_ID="<from auth-deployment-info-mainnet.txt>"
ACCOUNT_SECP256R1_CONTRACT_WASM="<account wasm hash>"

NFT_CONTRACT_ADDRESS="<C...>"
REPUTATION_CONTRACT_ADDRESS="<C...>"
QUEST_CONTRACT_ADDRESS="<C...>"
STREAK_CONTRACT_ADDRESS="<C...>"
REFERRAL_CONTRACT_ADDRESS="<C...>"
GOVERNANCE_CONTRACT_ADDRESS="<C...>"

# Also set NEXT_PUBLIC_* variants for client-side reads

NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK=mainnet
```

Deploy to Vercel (or your host) only after env vars are set.

## Contract dependency graph

```
Auth Controller ──┬── Account WASM ── Account Factory
                  │
NFT ──────────────┼── Reputation ──┬── Quest
                  │                ├── Streak
                  │                ├── Referral
                  │                └── Governance
                  │
                  └── (metadata_manager role to Reputation)
```

## Important notes

- **Native XLM SAC** is set at account contract construction time. Mainnet uses `CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA`; testnet uses `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`.
- **smart-account-kit** is the canonical wallet SDK for new users. Legacy auth contracts are still used for `FACTORY_CONTRACT_ID` / passkey registration flows.
- Deployment info files (`*-deployment-info-mainnet.txt`) contain contract addresses only — safe to keep locally, do not commit secrets.
- Each script prompts for `yes` on mainnet unless piped (orchestrator handles this).

## Verification

```bash
stellar contract invoke --network mainnet --id <CONTRACT_ID> -- get_admin
stellar contract inspect --network mainnet --id <CONTRACT_ID>
```

Check transactions on [Stellar Expert (mainnet)](https://stellar.expert/explorer/public).

## Estimated cost

| Contracts | Approx. XLM |
|-----------|-------------|
| Auth (3 WASM + 3 instances + init) | 15–25 |
| NFT + Reputation + Gamification (4) + Governance | 20–35 |
| Role grants + TTL extensions | 5–10 |
| **Total** | **~40–70 XLM** |

Actual cost varies with network fees and contract size.
