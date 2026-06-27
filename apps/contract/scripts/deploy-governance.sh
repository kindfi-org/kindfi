#!/bin/bash
# deploy-governance.sh
# Deployment script for KindFi Governance Contract

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export CARGO_TARGET_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/target"

echo "========================================"
echo "  KindFi Governance Contract Deployment"
echo "========================================"

NETWORK="testnet"
SOURCE=""
ADMIN_ADDRESS=""
REPUTATION_CONTRACT_ID=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --futurenet)
            NETWORK="futurenet"
            shift
            ;;
        --testnet)
            NETWORK="testnet"
            shift
            ;;
        --mainnet)
            NETWORK="mainnet"
            shift
            ;;
        --source)
            SOURCE="$2"
            shift 2
            ;;
        --admin)
            ADMIN_ADDRESS="$2"
            shift 2
            ;;
        --reputation-contract)
            REPUTATION_CONTRACT_ID="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --testnet                  Deploy to testnet (default)"
            echo "  --futurenet                Deploy to futurenet"
            echo "  --mainnet                  Deploy to mainnet"
            echo "  --source NAME              Stellar account identity to use"
            echo "  --admin ADDRESS            Admin address for the contract"
            echo "  --reputation-contract ID   Reputation contract ID (required)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

if [[ -z "$SOURCE" ]]; then
    case $NETWORK in
        testnet)
            if stellar keys address bran &>/dev/null 2>&1; then
                SOURCE="bran"
            else
                SOURCE="bob-f"
            fi
            ;;
        futurenet)
            SOURCE="bob-f"
            ;;
        mainnet)
            SOURCE="production"
            ;;
    esac
fi

if [[ -z "$ADMIN_ADDRESS" ]]; then
    ADMIN_ADDRESS=$(stellar keys address "$SOURCE")
fi

if [[ -z "$REPUTATION_CONTRACT_ID" ]]; then
    echo "Error: --reputation-contract is required"
    exit 1
fi

case $NETWORK in
    testnet|futurenet|mainnet) ;;
    *)
        echo "Invalid network: $NETWORK"
        exit 1
        ;;
esac

if [[ "$NETWORK" == "mainnet" ]]; then
    echo ""
    echo "=============================================="
    echo "  WARNING: DEPLOYING TO MAINNET!"
    echo "  This action will use real XLM."
    echo "=============================================="
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " confirm
    if [[ "$confirm" != "yes" ]]; then
        echo "Deployment cancelled."
        exit 0
    fi
fi

echo ""
echo "=== Configuration ==="
echo "Network:             $NETWORK"
echo "Source:              $SOURCE"
echo "Admin:               $ADMIN_ADDRESS"
echo "Reputation Contract: $REPUTATION_CONTRACT_ID"
echo ""

echo "=== Step 1: Building Governance Contract ==="
cd contracts/governance
stellar contract build || {
    echo "Failed to build Governance Contract"
    exit 1
}
cd ../..
echo "Governance Contract built successfully!"

echo ""
echo "=== Step 2: Uploading WASM ==="
GOVERNANCE_WASM_HASH=$(stellar contract upload \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --wasm target/wasm32v1-none/release/governance.wasm)

echo "WASM Hash: $GOVERNANCE_WASM_HASH"

echo ""
echo "=== Step 3: Deploying Contract Instance ==="
GOVERNANCE_CONTRACT_ID=$(stellar contract deploy \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --wasm-hash "$GOVERNANCE_WASM_HASH" \
    -- \
    --admin "$ADMIN_ADDRESS" \
    --reputation_contract "$REPUTATION_CONTRACT_ID")

echo "Contract ID: $GOVERNANCE_CONTRACT_ID"

DEPLOYMENT_FILE="governance-deployment-info-${NETWORK}.txt"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

cat > "$DEPLOYMENT_FILE" << EOF
=== KindFi Governance Contract Deployment ===
Network:         $NETWORK
Deployment Time: $TIMESTAMP

=== Contract Information ===
WASM Hash:       $GOVERNANCE_WASM_HASH
Contract ID:     $GOVERNANCE_CONTRACT_ID
Admin:           $ADMIN_ADDRESS
Reputation Contract: $REPUTATION_CONTRACT_ID

=== Source Account ===
Identity:        $SOURCE
Address:         $(stellar keys address "$SOURCE")

=== Role Assignment Commands ===
# Grant recorder role (service account records votes on behalf of users):
stellar contract invoke --network $NETWORK --source $SOURCE --id $GOVERNANCE_CONTRACT_ID -- grant_role --account <RECORDER_ADDRESS> --role 'recorder' --caller $ADMIN_ADDRESS
EOF

echo ""
echo "========================================"
echo "  Governance Contract Deployment Complete!"
echo "========================================"
echo ""
echo "Contract ID: $GOVERNANCE_CONTRACT_ID"
echo "Deployment info saved to: $DEPLOYMENT_FILE"
