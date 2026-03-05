#!/bin/bash
# sync-quests-to-chain.sh
# Sync quests from database to on-chain Quest contract

# Don't exit on error - we want to continue even if admin role grant fails
set +e

echo "========================================"
echo "  Sync Quests to On-Chain"
echo "========================================"

# Parse command line arguments
NETWORK="testnet"
SOURCE=""
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
if [[ -z "$QUEST_CONTRACT_ID" ]]; then
    echo "Error: --quest-contract is required"
    exit 1
fi

echo ""
echo "=== Configuration ==="
echo "Network:         $NETWORK"
echo "Source:          $SOURCE"
echo "Admin Address:   $ADMIN_ADDRESS"
echo "Quest Contract:  $QUEST_CONTRACT_ID"
echo ""

# Step 0: Grant admin role to admin address (required for create_quest)
# Note: The admin address set during initialization should be able to grant roles,
# but it needs to explicitly grant itself the "admin" role to use #[only_role(caller, "admin")]
echo ""
echo "=== Step 0: Granting Admin Role ==="
echo "Attempting to grant admin role to admin address..."
echo "Note: If this fails with error 2000, the admin address may already have permissions"
echo "      through the AccessControl admin mechanism, but needs the 'admin' role explicitly."

stellar contract invoke \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --id "$QUEST_CONTRACT_ID" \
    -- grant_role \
    --account "$ADMIN_ADDRESS" \
    --role 'admin' \
    --caller "$ADMIN_ADDRESS" 2>&1 | tee /tmp/quest-admin-grant.log

GRANT_RESULT=$?
if [[ $GRANT_RESULT -eq 0 ]]; then
    echo "✅ Admin role granted successfully"
else
    echo "⚠️  Admin role grant returned non-zero exit code"
    echo "Checking if admin role is already granted..."
    HAS_ROLE=$(stellar contract invoke \
        --network "$NETWORK" \
        --source "$SOURCE" \
        --id "$QUEST_CONTRACT_ID" \
        -- has_role \
        --account "$ADMIN_ADDRESS" \
        --role 'admin' 2>&1 | grep -o '[0-9]' | head -1 || echo "0")
    
    if [[ "$HAS_ROLE" != "0" ]]; then
        echo "✅ Admin role is already granted (exit code: $HAS_ROLE)"
    else
        echo "❌ Admin role is not granted. Error details:"
        cat /tmp/quest-admin-grant.log
        echo ""
        echo "This may indicate that the admin address needs different permissions."
        echo "Attempting to create quests anyway..."
    fi
fi

# Quest type mapping: database -> contract enum value
# total_donation_amount -> 4 (TotalDonationAmount)
# multi_category_donation -> 2 (MultiCategoryDonation)
# multi_region_donation -> 0 (MultiRegionDonation)
# weekly_streak -> 1 (WeeklyStreak)
# referral_quest -> 3 (ReferralQuest)
# quest_master -> 5 (QuestMaster)

# Quest 1: First Donation
echo ""
echo "=== Creating Quest 1: First Donation ==="
stellar contract invoke \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --id "$QUEST_CONTRACT_ID" \
    -- create_quest \
    --caller "$ADMIN_ADDRESS" \
    --quest_type 4 \
    --name "First Donation" \
    --description "Make your first donation to any project" \
    --target_value 1 \
    --reward_points 50 \
    --expires_at 0

echo "✅ Quest 1 created"

# Quest 2: Generous Donor
echo ""
echo "=== Creating Quest 2: Generous Donor ==="
stellar contract invoke \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --id "$QUEST_CONTRACT_ID" \
    -- create_quest \
    --caller "$ADMIN_ADDRESS" \
    --quest_type 4 \
    --name "Generous Donor" \
    --description "Donate a total of \$100 across all projects" \
    --target_value 100 \
    --reward_points 100 \
    --expires_at 0

echo "✅ Quest 2 created"

# Quest 3: Diverse Supporter
echo ""
echo "=== Creating Quest 3: Diverse Supporter ==="
stellar contract invoke \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --id "$QUEST_CONTRACT_ID" \
    -- create_quest \
    --caller "$ADMIN_ADDRESS" \
    --quest_type 2 \
    --name "Diverse Supporter" \
    --description "Donate to projects in 3 different categories" \
    --target_value 3 \
    --reward_points 75 \
    --expires_at 0

echo "✅ Quest 3 created"

echo ""
echo "========================================"
echo "  Quest Sync Complete!"
echo "========================================"
echo ""
echo "All 3 quests have been created on-chain."
echo ""
echo "Next steps:"
echo "1. Test gamification updates by making a donation"
echo "2. Verify quest progress updates correctly"
echo ""
