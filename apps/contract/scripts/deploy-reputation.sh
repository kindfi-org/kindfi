#!/bin/bash
# deploy-reputation.sh
# Deployment script for KindFi Reputation Contract

set -e

echo "========================================"
echo "  KindFi Reputation Contract Deployment"
echo "========================================"

# Parse command line arguments
NETWORK="testnet"
SOURCE=""
ADMIN_ADDRESS=""
NFT_CONTRACT_ID=""

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
        --nft-contract)
            NFT_CONTRACT_ID="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --testnet              Deploy to testnet (default)"
            echo "  --futurenet            Deploy to futurenet"
            echo "  --mainnet              Deploy to mainnet"
            echo "  --source NAME          Stellar account identity to use"
            echo "  --admin ADDRESS        Admin address for the contract"
            echo "  --nft-contract ID      NFT contract ID for integration (optional)"
            echo "  --help                 Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --testnet --source alice"
            echo "  $0 --testnet --source alice --nft-contract CXXX..."
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

echo ""
echo "=== Configuration ==="
echo "Network:      $NETWORK"
echo "Source:       $SOURCE"
echo "Admin:        $ADMIN_ADDRESS"
if [[ -n "$NFT_CONTRACT_ID" ]]; then
    echo "NFT Contract: $NFT_CONTRACT_ID"
else
    echo "NFT Contract: Not configured (can be set later)"
fi
echo ""

# Validate network
case $NETWORK in
    testnet|futurenet|mainnet)
        echo "Valid network selected: $NETWORK"
        ;;
    *)
        echo "Invalid network: $NETWORK"
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

# Step 1: Build Reputation contract
echo ""
echo "=== Step 1: Building Reputation Contract ==="
cargo build --target wasm32-unknown-unknown --release --manifest-path ./contracts/reputation/Cargo.toml || {
    echo "Failed to build Reputation Contract"
    exit 1
}
echo "Reputation Contract built successfully!"

# Step 2: Upload WASM
echo ""
echo "=== Step 2: Uploading WASM ==="
REPUTATION_WASM_HASH=$(stellar contract upload \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --wasm target/wasm32-unknown-unknown/release/reputation.wasm)

echo "WASM Hash: $REPUTATION_WASM_HASH"

# Step 3: Deploy contract instance
echo ""
echo "=== Step 3: Deploying Contract Instance ==="

# Build constructor arguments
if [[ -n "$NFT_CONTRACT_ID" ]]; then
    REPUTATION_CONTRACT_ID=$(stellar contract deploy \
        --network "$NETWORK" \
        --source "$SOURCE" \
        --wasm-hash "$REPUTATION_WASM_HASH" \
        -- \
        --admin "$ADMIN_ADDRESS" \
        --nft_contract "$NFT_CONTRACT_ID")
else
    REPUTATION_CONTRACT_ID=$(stellar contract deploy \
        --network "$NETWORK" \
        --source "$SOURCE" \
        --wasm-hash "$REPUTATION_WASM_HASH" \
        -- \
        --admin "$ADMIN_ADDRESS")
fi

echo "Contract ID: $REPUTATION_CONTRACT_ID"

# Step 4: Verify deployment
echo ""
echo "=== Step 4: Verifying Deployment ==="
echo "Checking contract admin..."
VERIFIED_ADMIN=$(stellar contract invoke \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --id "$REPUTATION_CONTRACT_ID" \
    -- \
    get_admin 2>/dev/null || echo "VERIFICATION_FAILED")

if [[ "$VERIFIED_ADMIN" == *"$ADMIN_ADDRESS"* ]] || [[ "$VERIFIED_ADMIN" != "VERIFICATION_FAILED" ]]; then
    echo "Contract admin verified!"
else
    echo "Warning: Could not verify admin. Contract may still be deployed correctly."
fi

# Step 5: Display default configuration
echo ""
echo "=== Step 5: Default Configuration ==="
echo ""
echo "Default Level Thresholds:"
echo "  Rookie:  0 points"
echo "  Bronze:  200 points"
echo "  Silver:  500 points"
echo "  Gold:    1,000 points"
echo "  Diamond: 5,000 points"
echo ""
echo "Default Event Points:"
echo "  Donation:            10 points"
echo "  StreakDonation:      25 points"
echo "  SuccessfulReferral:  50 points"
echo "  NewCategoryDonation: 15 points"
echo "  NewCampaignDonation: 5 points"
echo "  QuestCompletion:     30 points"
echo "  BoostedProject:      20 points"
echo "  OutstandingBooster:  100 points"
echo ""
echo "Default Permission Thresholds:"
echo "  Voting:          Bronze (level 1)"
echo "  EarlyAccess:     Silver (level 2)"
echo "  ExclusiveRounds: Gold (level 3)"
echo "  SpecialRewards:  Diamond (level 4)"

# Save deployment info
echo ""
echo "=== Saving Deployment Information ==="
DEPLOYMENT_FILE="reputation-deployment-info-${NETWORK}.txt"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

cat > "$DEPLOYMENT_FILE" << EOF
=== KindFi Reputation Contract Deployment ===
Network:         $NETWORK
Deployment Time: $TIMESTAMP

=== Contract Information ===
WASM Hash:       $REPUTATION_WASM_HASH
Contract ID:     $REPUTATION_CONTRACT_ID
Admin:           $ADMIN_ADDRESS
NFT Contract:    ${NFT_CONTRACT_ID:-"Not configured"}

=== Source Account ===
Identity:        $SOURCE
Address:         $(stellar keys address "$SOURCE")

=== Default Level Thresholds ===
Rookie:   0 points
Bronze:   200 points
Silver:   500 points
Gold:     1,000 points
Diamond:  5,000 points

=== Default Event Points ===
Donation:            10 points
StreakDonation:      25 points
SuccessfulReferral:  50 points
NewCategoryDonation: 15 points
NewCampaignDonation: 5 points
QuestCompletion:     30 points
BoostedProject:      20 points
OutstandingBooster:  100 points

=== Role Assignment Commands ===
# Grant recorder role (can record reputation events):
stellar contract invoke --network $NETWORK --source $SOURCE --id $REPUTATION_CONTRACT_ID -- grant_role --account <RECORDER_ADDRESS> --role 'recorder' --caller $ADMIN_ADDRESS

# Grant config role (can update thresholds and point values):
stellar contract invoke --network $NETWORK --source $SOURCE --id $REPUTATION_CONTRACT_ID -- grant_role --account <CONFIG_ADDRESS> --role 'config' --caller $ADMIN_ADDRESS

=== NFT Integration Commands ===
# Set NFT contract (if not set during deployment):
stellar contract invoke --network $NETWORK --source $SOURCE --id $REPUTATION_CONTRACT_ID -- set_nft_contract --caller $ADMIN_ADDRESS --nft_address <NFT_CONTRACT_ID>

# Register user NFT (requires recorder role):
stellar contract invoke --network $NETWORK --source $SOURCE --id $REPUTATION_CONTRACT_ID -- register_user_nft --caller <RECORDER_ADDRESS> --user <USER_ADDRESS> --token_id <TOKEN_ID>

# IMPORTANT: Grant metadata_manager role to Reputation contract on NFT contract:
stellar contract invoke --network $NETWORK --source $SOURCE --id <NFT_CONTRACT_ID> -- grant_role --account $REPUTATION_CONTRACT_ID --role 'metadata_manager' --caller <NFT_ADMIN_ADDRESS>

=== Verification Commands ===
# Check user level:
stellar contract invoke --network $NETWORK --source $SOURCE --id $REPUTATION_CONTRACT_ID -- get_level --user <USER_ADDRESS>

# Check user points:
stellar contract invoke --network $NETWORK --source $SOURCE --id $REPUTATION_CONTRACT_ID -- get_points --user <USER_ADDRESS>

# Check if user meets threshold:
stellar contract invoke --network $NETWORK --source $SOURCE --id $REPUTATION_CONTRACT_ID -- meets_threshold --user <USER_ADDRESS> --threshold_type 0

# Record an event (requires recorder role):
stellar contract invoke --network $NETWORK --source $SOURCE --id $REPUTATION_CONTRACT_ID -- record_event --caller <RECORDER_ADDRESS> --user <USER_ADDRESS> --event_type 0
EOF

echo "Deployment info saved to: $DEPLOYMENT_FILE"

# Final summary
echo ""
echo "========================================"
echo "  Reputation Contract Deployment Complete!"
echo "========================================"
echo ""
echo "Network:     $NETWORK"
echo "WASM Hash:   $REPUTATION_WASM_HASH"
echo "Contract ID: $REPUTATION_CONTRACT_ID"
echo "Admin:       $ADMIN_ADDRESS"
if [[ -n "$NFT_CONTRACT_ID" ]]; then
    echo "NFT Contract: $NFT_CONTRACT_ID"
fi
echo ""
echo "Deployment info saved to: $DEPLOYMENT_FILE"
echo ""
echo "Next steps:"
echo "1. Grant 'recorder' role to addresses that should record reputation events"
echo "2. Grant 'config' role to addresses that should update configuration"
if [[ -z "$NFT_CONTRACT_ID" ]]; then
    echo "3. Set NFT contract address using set_nft_contract"
    echo "4. Grant 'metadata_manager' role to this contract on the NFT contract"
else
    echo "3. Grant 'metadata_manager' role to this contract ($REPUTATION_CONTRACT_ID) on the NFT contract"
fi
echo ""
echo "Role symbols:"
echo "  Recorder: 'recorder'"
echo "  Config:   'config'"
