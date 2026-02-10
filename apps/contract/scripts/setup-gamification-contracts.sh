#!/bin/bash
# setup-gamification-contracts.sh
# Grant recorder roles and sync quests from database to on-chain

set -e

echo "========================================"
echo "  KindFi Gamification Contracts Setup"
echo "========================================"

# Parse command line arguments
NETWORK="testnet"
SOURCE=""
RECORDER_ADDRESS=""
STREAK_CONTRACT_ID=""
REFERRAL_CONTRACT_ID=""
QUEST_CONTRACT_ID=""

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
        --recorder-address)
            RECORDER_ADDRESS="$2"
            shift 2
            ;;
        --streak-contract)
            STREAK_CONTRACT_ID="$2"
            shift 2
            ;;
        --referral-contract)
            REFERRAL_CONTRACT_ID="$2"
            shift 2
            ;;
        --quest-contract)
            QUEST_CONTRACT_ID="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --testnet                  Use testnet (default)"
            echo "  --futurenet                Use futurenet"
            echo "  --mainnet                  Use mainnet"
            echo "  --source NAME              Stellar account identity to use (default: bran)"
            echo "  --recorder-address ADDR    Recorder address to grant roles to (required)"
            echo "  --streak-contract ID       Streak contract ID (required)"
            echo "  --referral-contract ID     Referral contract ID (required)"
            echo "  --quest-contract ID        Quest contract ID (required)"
            echo ""
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Set default source
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

# Get admin address from source
ADMIN_ADDRESS=$(stellar keys address "$SOURCE")

# Validate required parameters
if [[ -z "$RECORDER_ADDRESS" ]]; then
    echo "Error: --recorder-address is required"
    echo "This should be the address derived from SOROBAN_PRIVATE_KEY"
    exit 1
fi

if [[ -z "$STREAK_CONTRACT_ID" ]]; then
    echo "Error: --streak-contract is required"
    exit 1
fi

if [[ -z "$REFERRAL_CONTRACT_ID" ]]; then
    echo "Error: --referral-contract is required"
    exit 1
fi

if [[ -z "$QUEST_CONTRACT_ID" ]]; then
    echo "Error: --quest-contract is required"
    exit 1
fi

echo ""
echo "=== Configuration ==="
echo "Network:            $NETWORK"
echo "Source:             $SOURCE"
echo "Admin Address:      $ADMIN_ADDRESS"
echo "Recorder Address:   $RECORDER_ADDRESS"
echo "Streak Contract:   $STREAK_CONTRACT_ID"
echo "Referral Contract: $REFERRAL_CONTRACT_ID"
echo "Quest Contract:    $QUEST_CONTRACT_ID"
echo ""

# Step 1: Grant recorder role to Streak contract
echo ""
echo "=== Step 1: Granting Recorder Role on Streak Contract ==="
if stellar contract invoke \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --id "$STREAK_CONTRACT_ID" \
    -- grant_role \
    --account "$RECORDER_ADDRESS" \
    --role 'recorder' \
    --caller "$ADMIN_ADDRESS" 2>&1 | tee /tmp/streak-grant.log; then
    echo "✅ Recorder role granted on Streak contract"
else
    echo "⚠️  Streak role grant may have failed (check if already granted)"
    grep -i "already\|exists\|granted" /tmp/streak-grant.log || true
fi

# Step 2: Grant recorder role to Referral contract
echo ""
echo "=== Step 2: Granting Recorder Role on Referral Contract ==="
if stellar contract invoke \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --id "$REFERRAL_CONTRACT_ID" \
    -- grant_role \
    --account "$RECORDER_ADDRESS" \
    --role 'recorder' \
    --caller "$ADMIN_ADDRESS" 2>&1 | tee /tmp/referral-grant.log; then
    echo "✅ Recorder role granted on Referral contract"
else
    echo "⚠️  Referral role grant may have failed (check if already granted)"
    grep -i "already\|exists\|granted" /tmp/referral-grant.log || true
fi

# Step 3: Grant recorder role to Quest contract
echo ""
echo "=== Step 3: Granting Recorder Role on Quest Contract ==="
if stellar contract invoke \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --id "$QUEST_CONTRACT_ID" \
    -- grant_role \
    --account "$RECORDER_ADDRESS" \
    --role 'recorder' \
    --caller "$ADMIN_ADDRESS" 2>&1 | tee /tmp/quest-grant.log; then
    echo "✅ Recorder role granted on Quest contract"
else
    echo "⚠️  Quest role grant may have failed (check if already granted)"
    grep -i "already\|exists\|granted" /tmp/quest-grant.log || true
fi

echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "Recorder roles have been granted to: $RECORDER_ADDRESS"
echo ""
echo "Next steps:"
echo "1. Create quests on-chain using create_quest function"
echo "2. Test gamification updates by making a donation"
echo ""
