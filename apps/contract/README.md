# KINDFI CONTRACTS

## 1. Auth Contracts

This repository contains Rust-based smart contracts for a decentralized authentication system. The contracts facilitate account creation, authentication, and account management using smart contract-based logic.

### Overview

The system consists of three main contracts:

#### 1. **Account Factory**

- Responsible for deploying new account contracts in a deterministic manner.
- Uses a provided WebAssembly (WASM) hash to deploy contract instances.
- Ensures only authorized entities can initiate deployments.
- Emits events upon successful contract deployments.

#### 2. **Auth Controller**

- Handles multi-signature authentication and permission management.
- Manages a dynamic set of signers, enforcing authentication thresholds.
- Supports account and factory management through stored contexts.
- Implements flexible authorization rules for external contract calls.
- Allows addition and removal of signers, accounts, and factories.
- Ensures authentication by verifying **Ed25519** cryptographic signatures.
- Emits events for key contract updates such as signer additions and removals.

#### 3. **Account Contract**

- Represents an individual user account.
- Ensures authentication by verifying **Secp256r1** cryptographic signatures, in line with WebAuthn specifications..
- Provides methods for account recovery, device management, and security updates.
- Uses a multi-device authentication model with public keys tied to registered devices.
- Supports recovery mechanisms through a designated recovery address.
- Implements a custom authentication interface to validate digital signatures and verify ownership.
- Emits events for device additions, removals, and security updates.

### How It Works

1. The **Account Factory** deploys a new **Account Contract** when a user registers.
2. The **Auth Controller** manages authentication flows, including key validation and session authorization.
3. The **Account Contract** holds user credentials, allowing secure and decentralized identity management.

### Dependencies

- Rust toolchain
- Cargo package manager
- Blockchain runtime (depends on deployment environment)

## 2. KindFi NFT Contract

## Prerequisites

1. Install Stellar CLI:

```bash
cargo install stellar-cli
```

2. Setup your Stellar account:

```bash
stellar account create --network testnet
```

3. Fund your testnet account:

- Visit: <https://laboratory.stellar.org/>
- Use the friendbot to fund your testnet account

## Deployment Instructions

To deploy the KindFi NFT contract, simply run:

```bash
# For testnet (default)
./deploy.sh

# For mainnet
./deploy.sh public your_account_name
```

Make sure you have:

1. Stellar CLI installed
2. A funded account on the target network
3. The necessary permissions set up

The script will handle the build and deployment process automatically and save the deployment information to `deployment-info.txt`.

## Verification

1. Check contract status:

```bash
stellar contract inspect \
  --network testnet \
  --id <contract_id>
```

2. View contract storage:

```bash
stellar contract storage \
  --network testnet \
  --id <contract_id>
```

## Networks

- Testnet: Use `--network testnet`
- Mainnet: Use `--network public`

## Environment Setup

Create a `.env` file:

```env
cp .env.sample .env
```

## Common Issues

1. "Invalid account": Make sure your account is funded
2. "Invalid sequence number": Wait a moment and retry
3. "Contract already exists": Use a new WASM hash

## Development Workflow

1. Make changes to contract
2. Build contract (`cargo build`)
3. Install new WASM
4. Deploy new instance
5. Initialize new instance
6. Test new deployment

## Security Notes

- Always test on testnet first
- Keep secret keys secure
- Verify contract ID after deployment
- Check all transactions before signing
