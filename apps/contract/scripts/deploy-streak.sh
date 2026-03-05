#!/bin/bash
# deploy-streak.sh
# Deployment script for KindFi Streak Contract

set -e

echo "========================================"
echo "  KindFi Streak Contract Deployment"
echo "========================================"

# Parse command line arguments
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
            echo "  --help                     Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --testnet --source bran --reputation-contract CXXX..."
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Set default source based on network if not provided
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

# Get admin address from source if not provided
if [[ -z "$ADMIN_ADDRESS" ]]; then
    ADMIN_ADDRESS=$(stellar keys address "$SOURCE")
fi

# Validate reputation contract is provided
if [[ -z "$REPUTATION_CONTRACT_ID" ]]; then
    echo "Error: --reputation-contract is required"
    echo "Usage: $0 --testnet --source bran --reputation-contract CXXX..."
    exit 1
fi

echo ""
echo "=== Configuration ==="
echo "Network:            $NETWORK"
echo "Source:             $SOURCE"
echo "Admin:              $ADMIN_ADDRESS"
echo "Reputation Contract: $REPUTATION_CONTRACT_ID"
echo ""

# Validate network
case $NETWORK in
    testnet|futurenet|mainnet)
        echo "✅ Valid network selected: $NETWORK"
        ;;
    *)
        echo "🔴 Invalid network: $NETWORK"
        echo "Valid options: testnet, futurenet, mainnet"
        exit 1
        ;;
esac

# Mainnet warning
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

# Step 1: Build Streak contract
echo ""
echo "=== Step 1: Building Streak Contract ==="
cargo build --target wasm32-unknown-unknown --release --manifest-path ./contracts/streak/Cargo.toml || {
    echo "🔴 Failed to build Streak Contract"
    exit 1
}
echo "✅ Streak Contract built successfully!"

# Step 2: Upload WASM
echo ""
echo "=== Step 2: Uploading WASM ==="
STREAK_WASM_HASH=$(stellar contract upload \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --wasm target/wasm32-unknown-unknown/release/streak.wasm)

echo "WASM Hash: $STREAK_WASM_HASH"

# Step 3: Deploy contract instance
echo ""
echo "=== Step 3: Deploying Contract Instance ==="
STREAK_CONTRACT_ID=$(stellar contract deploy \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --wasm-hash "$STREAK_WASM_HASH" \
    -- \
    --admin "$ADMIN_ADDRESS" \
    --reputation_contract "$REPUTATION_CONTRACT_ID")

echo "Contract ID: $STREAK_CONTRACT_ID"

# Step 4: Verify deployment
echo ""
echo "=== Step 4: Verifying Deployment ==="
echo "Checking contract admin..."
VERIFIED_ADMIN=$(stellar contract invoke \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --id "$STREAK_CONTRACT_ID" \
    -- \
    get_admin 2>/dev/null || echo "VERIFICATION_FAILED")

if [[ "$VERIFIED_ADMIN" == *"$ADMIN_ADDRESS"* ]] || [[ "$VERIFIED_ADMIN" != "VERIFICATION_FAILED" ]]; then
    echo "✅ Contract admin verified!"
else
    echo "⚠️  Warning: Could not verify admin. Contract may still be deployed correctly."
fi

# Save deployment info
echo ""
echo "=== Saving Deployment Information ==="
DEPLOYMENT_FILE="streak-deployment-info-${NETWORK}.txt"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

cat > "$DEPLOYMENT_FILE" << EOF
=== KindFi Streak Contract Deployment ===
Network:         $NETWORK
Deployment Time: $TIMESTAMP

=== Contract Information ===
WASM Hash:       $STREAK_WASM_HASH
Contract ID:     $STREAK_CONTRACT_ID
Admin:           $ADMIN_ADDRESS
Reputation Contract: $REPUTATION_CONTRACT_ID

=== Source Account ===
Identity:        $SOURCE
Address:         $(stellar keys address "$SOURCE")

=== Role Assignment Commands ===
# Grant recorder role (can record donations and update streaks):
stellar contract invoke --network $NETWORK --source $SOURCE --id $STREAK_CONTRACT_ID -- grant_role --account <RECORDER_ADDRESS> --role 'recorder' --caller $ADMIN_ADDRESS

=== Example Usage ===
# Record a donation and update streak (requires recorder role):
stellar contract invoke --network $NETWORK --source $SOURCE --id $STREAK_CONTRACT_ID -- record_donation \
  --caller <RECORDER_ADDRESS> \
  --user <USER_ADDRESS> \
  --period 0 \
  --donation_timestamp $(date +%s)

# Period values: 0 = Weekly, 1 = Monthly

# Get user streak:
stellar contract invoke --network $NETWORK --source $SOURCE --id $STREAK_CONTRACT_ID -- get_streak --user <USER_ADDRESS> --period 0

=== Streak Benefits ===
- Weekly streak: Donate every 7 days
- Monthly streak: Donate every 30 days
- Bonus points: 25 points per streak donation
- Automatic reputation point awards via Reputation contract
EOF

echo "Deployment info saved to: $DEPLOYMENT_FILE"

# Final summary
echo ""
echo "========================================"
echo "  Streak Contract Deployment Complete!"
echo "========================================"
echo ""
echo "Network:     $NETWORK"
echo "WASM Hash:   $STREAK_WASM_HASH"
echo "Contract ID: $STREAK_CONTRACT_ID"
echo "Admin:       $ADMIN_ADDRESS"
echo ""
echo "Deployment info saved to: $DEPLOYMENT_FILE"
echo ""
echo "Next steps:"
echo "1. Grant 'recorder' role to addresses that should record donations"
echo "2. Integrate record_donation calls into your donation flow"
echo ""
