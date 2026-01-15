# KindFi Smart Contracts

A collection of Rust-based Soroban smart contracts deployed on the Stellar blockchain, powering the KindFi platform's authentication, NFT issuance, academy system, and reputation management.

## 📋 Table of Contents

- [Overview](#overview)
- [Contracts](#contracts)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Deployment](#deployment)
- [Testing](#testing)
- [Development](#development)

## 🎯 Overview

This repository contains multiple smart contract systems:

1. **Auth Contracts** - WebAuthn-based authentication and smart account management
2. **NFT Contracts** - Token issuance for KindFi platform and academy graduation certificates
3. **Academy Contracts** - Educational module tracking, badge management, and verification
4. **Reputation Contract** - User reputation and tier management system

All contracts are built using:

- **Rust** with Soroban SDK
- **OpenZeppelin Stellar Contracts** for access control and standards
- **Stellar/Soroban** blockchain

## 📦 Contracts

### 1. Authentication System

#### Account Factory (`auth-contracts/account-factory`)

- Deploys new account contracts deterministically
- Uses WASM hash for contract instance deployment
- Ensures only authorized entities can initiate deployments
- Emits events upon successful contract deployments

#### Auth Controller (`auth-contracts/auth-controller`)

- Handles multi-signature authentication and permission management
- Manages dynamic set of signers with authentication thresholds
- Supports account and factory management through stored contexts
- Implements flexible authorization rules for external contract calls
- Verifies **Ed25519** cryptographic signatures
- Emits events for signer additions and removals

#### Account Contract (`auth-contracts/account`)

- Represents individual user accounts
- Verifies **Secp256r1** cryptographic signatures (WebAuthn compatible)
- Provides account recovery, device management, and security updates
- Multi-device authentication model with public keys tied to devices
- Supports recovery mechanisms through designated recovery address
- Emits events for device additions, removals, and security updates

**How It Works:**

1. Account Factory deploys a new Account Contract when a user registers
2. Auth Controller manages authentication flows, including key validation and session authorization
3. Account Contract holds user credentials for secure, decentralized identity management

### 2. NFT Contracts

#### KindFi NFT (`nft-kindfi`)

- Standard NFT contract for KindFi platform tokens
- Minting with custom metadata
- Role-based access control (minter, burner, metadata_manager)
- Metadata management and updates
- Burn functionality
- Implements OpenZeppelin NonFungibleToken standard

#### Academy Graduation NFT (`academy-graduation-nft`)

- **Soulbound NFTs** - Non-transferable graduation certificates
- Issues NFTs to users who complete all required academy modules
- Cross-contract integration with ProgressTracker and BadgeTracker
- On-chain metadata storage (timestamp, version, badges)
- Secure authentication via `require_auth`
- Single NFT per user enforcement

**Features:**

- Verifies module completion via ProgressTracker
- Fetches earned badges from BadgeTracker
- Stores graduation metadata persistently on-chain
- Prevents transfer to maintain credential integrity

### 3. Academy System

#### Academy Badge Tracker (`academy-badge-tracker`)

- Manages user badges earned during academy program
- Tracks badge assignments and completions
- Provides badge retrieval functions for other contracts

#### Academy Progress Tracker (`academy-progress-tracker`)

- Tracks user progress through educational modules
- Verifies module completion status
- Provides completion verification for graduation NFT minting

#### Academy Verifier (`academy-verifier`)

- Verifies user certification status
- Validates completion of academy requirements
- Provides certification verification services

### 4. Reputation System

#### Reputation Contract (`reputation`)

- Manages user reputation scores and tiers
- Calculates reputation based on user activity
- Tracks streaks and achievements
- Admin-controlled tier thresholds
- NFT contract integration for reputation-based rewards

**Features:**

- Score updates with admin authorization
- Tier calculation from reputation scores
- Streak tracking
- Admin role management

### 5. Mock Contracts (Testing)

#### Mock Badge Tracker (`mock_badge_tracker`)

- Mock implementation for testing Academy Graduation NFT
- Simulates badge tracking without external dependencies
- Uses temporary storage for flexibility

#### Mock Progress Tracker (`mock_progress_tracker`)

- Mock implementation for testing Academy Graduation NFT
- Simulates progress tracking without external dependencies
- Uses temporary storage for flexibility

## 🛠️ Prerequisites

1. **Install Rust** (stable toolchain):

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Install Stellar CLI**:

   ```bash
   cargo install stellar-cli
   ```

3. **Setup Stellar Account**:

   ```bash
   # Create account identity
   stellar keys generate <account_name> --network testnet

   # Or use existing
   stellar keys add <account_name> --secret-key <secret_key>
   ```

4. **Fund Your Account**:
   - **Testnet**: Visit [Stellar Laboratory](https://laboratory.stellar.org/) and use Friendbot
   - **Futurenet**: Use the faucet at [Friendbot Futurenet](https://friendbot-futurenet.stellar.org/)
   - **Mainnet**: Fund via exchange or Stellar account

## 🚀 Setup

1. **Clone and navigate to contracts directory**:

   ```bash
   cd apps/contract
   ```

2. **Build all contracts**:

   ```bash
   cargo build --target wasm32-unknown-unknown --release
   ```

3. **Run tests**:
   ```bash
   cargo test
   ```

## 📤 Deployment

### Auth Contracts Deployment

Deploy all auth contracts (Factory, Controller, Account) using the deployment script:

```bash
# Testnet (default)
./scripts/deploy-auth.sh --testnet

# Futurenet
./scripts/deploy-auth.sh --futurenet

# Mainnet
./scripts/deploy-auth.sh --mainnet

# Specify source account
./scripts/deploy-auth.sh --testnet --source <account_name>
```

The script will:

1. Build all auth contracts
2. Deploy Account Contract WASM
3. Deploy Auth Controller and initialize with admin key
4. Deploy Account Factory and register with controller
5. Save deployment info to `auth-deployment-info-<network>.txt`

**Deployment Output:**

- Contract addresses (Factory, Controller, Account)
- WASM hashes
- Transaction hashes
- Network configuration

### NFT Contract Deployment

Deploy the KindFi NFT contract:

```bash
# Testnet (default)
./scripts/deploy.sh testnet

# Mainnet
./scripts/deploy.sh public <account_name>
```

The script saves deployment information to `deployment-info.txt`.

### Individual Contract Deployment

For deploying individual contracts:

```bash
# Build specific contract
cd contracts/<contract-name>
stellar contract build

# Upload WASM
stellar contract upload \
  --network testnet \
  --source <account_name> \
  --wasm target/wasm32-unknown-unknown/release/<contract>.wasm

# Deploy contract
stellar contract deploy \
  --network testnet \
  --source <account_name> \
  --wasm-hash <wasm_hash>
```

## 🧪 Testing

### Run All Tests

```bash
cargo test
```

### Run Tests for Specific Contract

```bash
cd contracts/<contract-name>
cargo test
```

### Test with Verbose Output

```bash
cargo test -- --nocapture
```

### Test Coverage

Most contracts include comprehensive test suites covering:

- Success cases
- Failure cases
- Edge cases
- Authentication requirements
- Cross-contract interactions

## 🔍 Verification

### Check Contract Status

```bash
stellar contract inspect \
  --network testnet \
  --id <contract_id>
```

### View Contract Storage

```bash
stellar contract storage \
  --network testnet \
  --id <contract_id>
```

### Invoke Contract Functions

```bash
stellar contract invoke \
  --network testnet \
  --id <contract_id> \
  --source <account_name> \
  -- <function_name> <args>
```

## 🌐 Networks

- **Testnet**: `--network testnet` - Stellar testnet for development
- **Futurenet**: `--network futurenet` - Stellar futurenet for testing new features
- **Mainnet**: `--network public` - Stellar mainnet for production

## 📝 Environment Variables

Create a `.env` file (see `.env.sample`):

```env
# Network Configuration
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"  # testnet
RPC_URL="https://soroban-testnet.stellar.org"
HORIZON_URL="https://horizon-testnet.stellar.org"

# Contract Addresses (from deployment)
FACTORY_CONTRACT_ID="<factory_contract_id>"
CONTROLLER_CONTRACT_ID="<controller_contract_id>"
ACCOUNT_CONTRACT_ID="<account_contract_id>"

# Funding Account
STELLAR_FUNDING_SECRET_KEY="<your_secret_key>"
```

## 🔧 Development Workflow

1. **Make changes** to contract source code
2. **Build contract**:
   ```bash
   cargo build --target wasm32-unknown-unknown --release
   ```
3. **Run tests**:
   ```bash
   cargo test
   ```
4. **Upload new WASM** to network
5. **Deploy new instance** or upgrade existing
6. **Initialize** contract if needed
7. **Test deployment** with contract invocations

## 📚 Contract Dependencies

All contracts use OpenZeppelin Stellar Contracts:

- `stellar-access-control` - Role-based access control
- `stellar-non-fungible` - NFT standard implementation
- `stellar-ownable` - Ownership management
- `stellar-pausable` - Pause functionality
- `stellar-upgradeable` - Upgrade patterns

## 🔒 Security Notes

- ⚠️ **Always test on testnet first** before mainnet deployment
- 🔐 **Keep secret keys secure** - never commit to version control
- ✅ **Verify contract ID** after deployment
- 👀 **Check all transactions** before signing
- 🧪 **Run comprehensive tests** before deployment
- 📋 **Review contract code** for security best practices

## 📖 References

- [Stellar Soroban Documentation](https://soroban.stellar.org/)
- [Stellar Developers](https://developers.stellar.org/)
- [OpenZeppelin Stellar Contracts](https://github.com/OpenZeppelin/stellar-contracts)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Soroban CLI Reference](https://soroban.stellar.org/docs/reference/cli)

## 🐛 Common Issues

1. **"Invalid account"**: Ensure your account is funded with XLM
2. **"Invalid sequence number"**: Wait a moment and retry the transaction
3. **"Contract already exists"**: Use a new WASM hash or deploy to a different network
4. **Build errors**: Ensure Rust toolchain is up to date: `rustup update`
5. **WASM upload fails**: Check network connectivity and account balance

## 📄 License

See the main repository LICENSE file.
