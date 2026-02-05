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
   rustup target add wasm32-unknown-unknown
   ```

2. **Install Stellar CLI**:

   ```bash
   cargo install stellar-cli
   ```

   **Note**: The Stellar CLI installation will ensure you have a compatible Rust version.
   The SDK version (22.0.6) will determine the minimum Rust version required.

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

Deploy the KindFi NFT contract using the deployment script:

```bash
# Testnet (default)
./scripts/deploy-nft.sh --testnet

# Futurenet
./scripts/deploy-nft.sh --futurenet

# Mainnet (with confirmation prompt)
./scripts/deploy-nft.sh --mainnet

# With custom options
./scripts/deploy-nft.sh --testnet --source alice --name "My NFT" --symbol "MNFT"
```

**Options:**
- `--testnet|--futurenet|--mainnet`: Target network
- `--source NAME`: Stellar account identity to use
- `--admin ADDRESS`: Admin address for the contract
- `--name NAME`: NFT collection name (default: "KindFi Kinder NFT")
- `--symbol SYMBOL`: NFT collection symbol (default: "KINDER")
- `--base-uri URI`: Base URI for token metadata

The script will:
1. Build the NFT contract
2. Upload WASM to network
3. Deploy contract instance with initialization
4. Save deployment info to `nft-deployment-info-<network>.txt`

**Post-Deployment Setup:**
```bash
# Grant minter role
stellar contract invoke --network testnet --source alice --id <NFT_CONTRACT_ID> \
  -- grant_role --account <MINTER_ADDRESS> --role 'minter' --caller <ADMIN_ADDRESS>

# Grant metadata_manager role to Reputation contract
stellar contract invoke --network testnet --source alice --id <NFT_CONTRACT_ID> \
  -- grant_role --account <REPUTATION_CONTRACT_ID> --role 'metadata_manager' --caller <ADMIN_ADDRESS>
```

### Reputation Contract Deployment

Deploy the KindFi Reputation contract:

```bash
# Testnet (default)
./scripts/deploy-reputation.sh --testnet

# With NFT contract integration
./scripts/deploy-reputation.sh --testnet --nft-contract <NFT_CONTRACT_ID>

# Futurenet
./scripts/deploy-reputation.sh --futurenet

# Mainnet (with confirmation prompt)
./scripts/deploy-reputation.sh --mainnet
```

**Options:**
- `--testnet|--futurenet|--mainnet`: Target network
- `--source NAME`: Stellar account identity to use
- `--admin ADDRESS`: Admin address for the contract
- `--nft-contract ID`: NFT contract ID for integration (optional)

The script will:
1. Build the Reputation contract
2. Upload WASM to network
3. Deploy contract instance with initialization
4. Save deployment info to `reputation-deployment-info-<network>.txt`

**Post-Deployment Setup:**
```bash
# Grant recorder role (can record reputation events)
stellar contract invoke --network testnet --source alice --id <REPUTATION_CONTRACT_ID> \
  -- grant_role --account <RECORDER_ADDRESS> --role 'recorder' --caller <ADMIN_ADDRESS>

# Grant config role (can update thresholds)
stellar contract invoke --network testnet --source alice --id <REPUTATION_CONTRACT_ID> \
  -- grant_role --account <CONFIG_ADDRESS> --role 'config' --caller <ADMIN_ADDRESS>

# Set NFT contract (if not set during deployment)
stellar contract invoke --network testnet --source alice --id <REPUTATION_CONTRACT_ID> \
  -- set_nft_contract --caller <ADMIN_ADDRESS> --nft_address <NFT_CONTRACT_ID>
```

### Full Deployment Flow (NFT + Reputation)

For a complete deployment with NFT integration:

```bash
# 1. Deploy NFT contract
./scripts/deploy-nft.sh --testnet --source alice
# Note the NFT_CONTRACT_ID from output

# 2. Deploy Reputation contract with NFT integration
./scripts/deploy-reputation.sh --testnet --source alice --nft-contract <NFT_CONTRACT_ID>
# Note the REPUTATION_CONTRACT_ID from output

# 3. Grant metadata_manager role to Reputation contract on NFT contract
stellar contract invoke --network testnet --source alice --id <NFT_CONTRACT_ID> \
  -- grant_role --account <REPUTATION_CONTRACT_ID> --role 'metadata_manager' --caller <ADMIN_ADDRESS>

# 4. Grant recorder role on Reputation contract
stellar contract invoke --network testnet --source alice --id <REPUTATION_CONTRACT_ID> \
  -- grant_role --account <RECORDER_ADDRESS> --role 'recorder' --caller <ADMIN_ADDRESS>
```

Now when users level up, their NFT metadata will automatically update with the new level attribute.

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

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Key variables:

```env
# Network Configuration
NETWORK="testnet"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
RPC_URL="https://soroban-testnet.stellar.org"
HORIZON_URL="https://horizon-testnet.stellar.org"

# Auth Contracts (from auth deployment)
AUTH_CONTROLLER_CONTRACT_ID=""
ACCOUNT_FACTORY_CONTRACT_ID=""
ACCOUNT_CONTRACT_ID=""

# NFT Contract (from NFT deployment)
NFT_CONTRACT_ID=""
NFT_WASM_HASH=""
NFT_ADMIN_ADDRESS=""

# Reputation Contract (from reputation deployment)
REPUTATION_CONTRACT_ID=""
REPUTATION_WASM_HASH=""
REPUTATION_ADMIN_ADDRESS=""

# Account identity
SOURCE_ACCOUNT="bran"
```

See `.env.example` for all available configuration options.

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

## 🐛 Common Issues & Troubleshooting

### General Issues

1. **"Invalid account"**: Ensure your account is funded with XLM
2. **"Invalid sequence number"**: Wait a moment and retry the transaction
3. **"Contract already exists"**: Use a new WASM hash or deploy to a different network
4. **Build errors**: Ensure Rust toolchain is up to date: `rustup update`
5. **WASM upload fails**: Check network connectivity and account balance

### NFT Contract Issues

1. **"Unauthorized" when minting**: Ensure the caller has the `minter` role
   ```bash
   stellar contract invoke --network testnet --id <NFT_CONTRACT_ID> \
     -- has_role --account <CALLER_ADDRESS> --role 'minter'
   ```

2. **"Unauthorized" when updating metadata**: Ensure the caller has `metadata_manager` role
   ```bash
   stellar contract invoke --network testnet --id <NFT_CONTRACT_ID> \
     -- has_role --account <CALLER_ADDRESS> --role 'metadata_manager'
   ```

3. **Token not found**: Verify token exists using `total_supply` and check token ID is valid

### Reputation Contract Issues

1. **"Unauthorized" when recording events**: Ensure the caller has the `recorder` role
   ```bash
   stellar contract invoke --network testnet --id <REPUTATION_CONTRACT_ID> \
     -- has_role --account <CALLER_ADDRESS> --role 'recorder'
   ```

2. **NFT not updating on level up**:
   - Verify NFT contract is set: `stellar contract invoke ... -- get_admin`
   - Verify Reputation contract has `metadata_manager` role on NFT contract
   - Verify user's NFT token ID is registered with `register_user_nft`

3. **"PointsOverflow" error**: User points would exceed u32 max. This is rare but check current points first.

### Cross-Contract Integration Issues

1. **NFT metadata not updating automatically**:
   - Step 1: Verify NFT contract address is set in Reputation contract
   - Step 2: Verify Reputation contract has `metadata_manager` role on NFT contract
   - Step 3: Verify user has an NFT token ID registered via `register_user_nft`
   - Step 4: Verify the NFT token actually exists

2. **Role grants failing**: Ensure you're using the correct admin address and it has proper authorization

### Network-Specific Considerations

- **Testnet**: Use for development. Free XLM from Friendbot.
- **Futurenet**: Use for testing new Stellar features. May have instability.
- **Mainnet**: Production only. Real XLM required. Always test on testnet first.

### Debugging Commands

```bash
# Check contract admin
stellar contract invoke --network testnet --id <CONTRACT_ID> -- get_admin

# Check if address has a specific role
stellar contract invoke --network testnet --id <CONTRACT_ID> \
  -- has_role --account <ADDRESS> --role '<ROLE_NAME>'

# Get role member count
stellar contract invoke --network testnet --id <CONTRACT_ID> \
  -- get_role_member_count --role '<ROLE_NAME>'

# Inspect contract
stellar contract inspect --network testnet --id <CONTRACT_ID>
```

## 📄 License

See the main repository LICENSE file.
