# KindFi NFT Contract Deployment Guide

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
