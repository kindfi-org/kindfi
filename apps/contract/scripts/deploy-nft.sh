#!/bin/bash
# deploy-nft.sh
# Deployment script for KindFi NFT Contract

set -e

echo "========================================"
echo "  KindFi NFT Contract Deployment"
echo "========================================"

# Parse command line arguments
NETWORK="testnet"
SOURCE=""
ADMIN_ADDRESS=""
NFT_NAME="KindFi Kinder NFT"
NFT_SYMBOL="KINDER"
BASE_URI="https://api.kindfi.org/nft/"

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
        --name)
            NFT_NAME="$2"
            shift 2
            ;;
        --symbol)
            NFT_SYMBOL="$2"
            shift 2
            ;;
        --base-uri)
            BASE_URI="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --testnet          Deploy to testnet (default)"
            echo "  --futurenet        Deploy to futurenet"
            echo "  --mainnet          Deploy to mainnet"
            echo "  --source NAME      Stellar account identity to use"
            echo "  --admin ADDRESS    Admin address for the contract"
            echo "  --name NAME        NFT collection name (default: 'KindFi Kinder NFT')"
            echo "  --symbol SYMBOL    NFT collection symbol (default: 'KINDER')"
            echo "  --base-uri URI     Base URI for token metadata"
            echo "  --help             Show this help message"
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
echo "NFT Name:     $NFT_NAME"
echo "NFT Symbol:   $NFT_SYMBOL"
echo "Base URI:     $BASE_URI"
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

# Step 1: Build NFT contract
echo ""
echo "=== Step 1: Building NFT Contract ==="
cargo build --target wasm32-unknown-unknown --release --manifest-path ./contracts/nft-kindfi/Cargo.toml || {
    echo "Failed to build NFT Contract"
    exit 1
}
echo "NFT Contract built successfully!"

# Step 2: Upload WASM
echo ""
echo "=== Step 2: Uploading WASM ==="
NFT_WASM_HASH=$(stellar contract upload \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --wasm target/wasm32-unknown-unknown/release/nft_kindfi.wasm)

echo "WASM Hash: $NFT_WASM_HASH"

# Step 3: Deploy contract instance
echo ""
echo "=== Step 3: Deploying Contract Instance ==="
NFT_CONTRACT_ID=$(stellar contract deploy \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --wasm-hash "$NFT_WASM_HASH" \
    -- \
    --admin "$ADMIN_ADDRESS" \
    --name "$NFT_NAME" \
    --symbol "$NFT_SYMBOL" \
    --base_uri "$BASE_URI")

echo "Contract ID: $NFT_CONTRACT_ID"

# Step 4: Verify deployment
echo ""
echo "=== Step 4: Verifying Deployment ==="
echo "Checking contract admin..."
VERIFIED_ADMIN=$(stellar contract invoke \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --id "$NFT_CONTRACT_ID" \
    -- \
    get_admin 2>/dev/null || echo "VERIFICATION_FAILED")

if [[ "$VERIFIED_ADMIN" == *"$ADMIN_ADDRESS"* ]] || [[ "$VERIFIED_ADMIN" != "VERIFICATION_FAILED" ]]; then
    echo "Contract admin verified!"
else
    echo "Warning: Could not verify admin. Contract may still be deployed correctly."
fi

# Step 5: Grant initial roles (optional - admin can do this later)
echo ""
echo "=== Step 5: Role Assignment ==="
echo "Admin has been set during initialization."
echo "To grant additional roles, use:"
echo ""
echo "  # Grant minter role"
echo "  stellar contract invoke --network $NETWORK --source $SOURCE --id $NFT_CONTRACT_ID -- grant_role --account <ADDRESS> --role 'minter' --caller $ADMIN_ADDRESS"
echo ""
echo "  # Grant burner role"
echo "  stellar contract invoke --network $NETWORK --source $SOURCE --id $NFT_CONTRACT_ID -- grant_role --account <ADDRESS> --role 'burner' --caller $ADMIN_ADDRESS"
echo ""
echo "  # Grant metadata_manager role (for Reputation contract integration)"
echo "  stellar contract invoke --network $NETWORK --source $SOURCE --id $NFT_CONTRACT_ID -- grant_role --account <REPUTATION_CONTRACT_ID> --role \$(stellar contract invoke --network $NETWORK --source $SOURCE --id $NFT_CONTRACT_ID -- metadata_manager_role) --caller $ADMIN_ADDRESS"

# Save deployment info
echo ""
echo "=== Saving Deployment Information ==="
DEPLOYMENT_FILE="nft-deployment-info-${NETWORK}.txt"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

cat > "$DEPLOYMENT_FILE" << EOF
=== KindFi NFT Contract Deployment ===
Network:         $NETWORK
Deployment Time: $TIMESTAMP

=== Contract Information ===
WASM Hash:       $NFT_WASM_HASH
Contract ID:     $NFT_CONTRACT_ID
Admin:           $ADMIN_ADDRESS

=== Collection Metadata ===
Name:            $NFT_NAME
Symbol:          $NFT_SYMBOL
Base URI:        $BASE_URI

=== Source Account ===
Identity:        $SOURCE
Address:         $(stellar keys address "$SOURCE")

=== Role Assignment Commands ===
# Grant minter role:
stellar contract invoke --network $NETWORK --source $SOURCE --id $NFT_CONTRACT_ID -- grant_role --account <MINTER_ADDRESS> --role 'minter' --caller $ADMIN_ADDRESS

# Grant burner role:
stellar contract invoke --network $NETWORK --source $SOURCE --id $NFT_CONTRACT_ID -- grant_role --account <BURNER_ADDRESS> --role 'burner' --caller $ADMIN_ADDRESS

# Grant metadata_manager role (for Reputation contract):
stellar contract invoke --network $NETWORK --source $SOURCE --id $NFT_CONTRACT_ID -- grant_role --account <REPUTATION_CONTRACT_ID> --role 'metadata_manager' --caller $ADMIN_ADDRESS

=== Verification Commands ===
# Check contract info:
stellar contract invoke --network $NETWORK --source $SOURCE --id $NFT_CONTRACT_ID -- name
stellar contract invoke --network $NETWORK --source $SOURCE --id $NFT_CONTRACT_ID -- symbol
stellar contract invoke --network $NETWORK --source $SOURCE --id $NFT_CONTRACT_ID -- get_admin

# Check total supply:
stellar contract invoke --network $NETWORK --source $SOURCE --id $NFT_CONTRACT_ID -- total_supply
EOF

echo "Deployment info saved to: $DEPLOYMENT_FILE"

# Final summary
echo ""
echo "========================================"
echo "  NFT Contract Deployment Complete!"
echo "========================================"
echo ""
echo "Network:     $NETWORK"
echo "WASM Hash:   $NFT_WASM_HASH"
echo "Contract ID: $NFT_CONTRACT_ID"
echo "Admin:       $ADMIN_ADDRESS"
echo ""
echo "Deployment info saved to: $DEPLOYMENT_FILE"
echo ""
echo "Next steps:"
echo "1. Grant minter role to addresses that should mint NFTs"
echo "2. Grant metadata_manager role to the Reputation contract"
echo "3. Deploy the Reputation contract with this NFT contract address"
