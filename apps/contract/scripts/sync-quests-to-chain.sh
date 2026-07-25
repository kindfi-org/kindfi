#!/bin/bash
# sync-quests-to-chain.sh
# Sync quest_definitions from Supabase to the on-chain Quest contract.
#
# Default: runs apps/web/scripts/sync-quests-to-chain.ts (reads DB, skips existing quests).
# Legacy:  --seed-defaults creates the 3 hardcoded starter quests (fresh deploys only).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

NETWORK="testnet"
SOURCE=""
QUEST_CONTRACT_ID=""
MODE="from-db"

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --testnet                  Use testnet (default)"
    echo "  --futurenet                Use futurenet"
    echo "  --mainnet                  Use mainnet"
    echo "  --source NAME              Stellar CLI identity (default: bran / production)"
    echo "  --quest-contract ID        Quest contract ID (required for --seed-defaults)"
    echo "  --from-db                  Sync all quest_definitions from Supabase (default)"
    echo "  --seed-defaults            Legacy: create 3 hardcoded starter quests via CLI"
    echo "  --help                     Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 --mainnet --quest-contract CDKFK..."
    echo "  $0 --testnet --seed-defaults --quest-contract CAAW..."
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --futurenet) NETWORK="futurenet"; shift ;;
        --testnet)   NETWORK="testnet"; shift ;;
        --mainnet)   NETWORK="mainnet"; shift ;;
        --source)    SOURCE="$2"; shift 2 ;;
        --quest-contract) QUEST_CONTRACT_ID="$2"; shift 2 ;;
        --from-db)   MODE="from-db"; shift ;;
        --seed-defaults) MODE="seed-defaults"; shift ;;
        --help)      usage; exit 0 ;;
        *)
            echo "Unknown option: $1"
            usage
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
        futurenet) SOURCE="bob-f" ;;
        mainnet)   SOURCE="production" ;;
    esac
fi

echo "========================================"
echo "  Sync Quests to On-Chain"
echo "========================================"
echo ""
echo "Network:  $NETWORK"
echo "Source:   $SOURCE"
echo "Mode:     $MODE"
echo ""

# ---------------------------------------------------------------------------
# Default: TypeScript sync from Supabase (skips existing, fills ID gaps)
# ---------------------------------------------------------------------------
if [[ "$MODE" == "from-db" ]]; then
    if [[ -n "$QUEST_CONTRACT_ID" ]]; then
        export QUEST_CONTRACT_ADDRESS="$QUEST_CONTRACT_ID"
        export NEXT_PUBLIC_QUEST_CONTRACT_ADDRESS="$QUEST_CONTRACT_ID"
    fi

    case $NETWORK in
        mainnet)
            export NETWORK_PASSPHRASE="${NETWORK_PASSPHRASE:-Public Global Stellar Network ; September 2015}"
            export RPC_URL="${RPC_URL:-https://mainnet.sorobanrpc.com}"
            echo "Mainnet sync uses ADMIN_PRIVATE_KEY (production account), not testnet STELLAR_FUNDING_SECRET_KEY."
            echo "Ensure apps/web/.env has ADMIN_PRIVATE_KEY set to your \`production\` Stellar CLI secret."
            echo ""
            ;;
        testnet)
            export NETWORK_PASSPHRASE="${NETWORK_PASSPHRASE:-Test SDF Network ; September 2015}"
            export RPC_URL="${RPC_URL:-https://soroban-testnet.stellar.org}"
            ;;
    esac

    echo "Running Supabase → on-chain sync via apps/web/scripts/sync-quests-to-chain.ts"
    echo ""

    cd "$REPO_ROOT/apps/web"
    bun run scripts/sync-quests-to-chain.ts
    exit $?
fi

# ---------------------------------------------------------------------------
# Legacy: seed 3 default quests via Stellar CLI (fresh deploys only)
# ---------------------------------------------------------------------------
if [[ -z "$QUEST_CONTRACT_ID" ]]; then
    echo "Error: --quest-contract is required for --seed-defaults"
    exit 1
fi

ADMIN_ADDRESS="$(stellar keys address "$SOURCE")"

echo "Quest Contract:  $QUEST_CONTRACT_ID"
echo "Admin Address:   $ADMIN_ADDRESS"
echo ""

invoke_read() {
    stellar contract invoke \
        --network "$NETWORK" \
        --source "$SOURCE" \
        --id "$QUEST_CONTRACT_ID" \
        -- "$@"
}

invoke_write() {
    local label="$1"
    shift
    echo ""
    echo "=== $label ==="
    if invoke_read "$@"; then
        echo "✅ $label succeeded"
        return 0
    fi
    echo "❌ $label failed"
    return 1
}

quest_exists() {
    local quest_id="$1"
    local output
    if output="$(invoke_read get_quest --quest_id "$quest_id" 2>&1)"; then
        if echo "$output" | grep -qiE 'not found|Error|HostError|None|null'; then
            return 1
        fi
        return 0
    fi
    return 1
}

has_admin_role() {
    local output
    output="$(invoke_read has_role --account "$ADMIN_ADDRESS" --role admin 2>&1 || true)"
    if echo "$output" | grep -qE '^[1-9][0-9]*$'; then
        return 0
    fi
    if echo "$output" | grep -qE 'Some\(|u32'; then
        return 0
    fi
    # Some CLI versions print the role index on its own line
    if echo "$output" | grep -qE '[1-9]'; then
        if ! echo "$output" | grep -qiE 'Error|HostError|None|null|0'; then
            return 0
        fi
    fi
    return 1
}

ensure_admin_role() {
    echo "=== Step 0: Verify admin role ==="

    if has_admin_role; then
        echo "✅ Admin role already granted for $ADMIN_ADDRESS"
        return 0
    fi

    echo "Admin role missing — granting via grant_role..."
    if ! invoke_write "Grant admin role" \
        grant_role \
        --account "$ADMIN_ADDRESS" \
        --role admin \
        --caller "$ADMIN_ADDRESS"; then
        echo ""
        echo "❌ Could not grant admin role. create_quest requires Error #2000 authorization."
        echo "   Ensure $SOURCE is the contract admin from get_admin."
        exit 1
    fi

    if ! has_admin_role; then
        echo "❌ grant_role succeeded but has_role(admin) is still false"
        exit 1
    fi

    echo "✅ Admin role verified"
}

create_quest_if_missing() {
    local quest_id="$1"
    local label="$2"
    local quest_type="$3"
    local name="$4"
    local description="$5"
    local target_value="$6"
    local reward_points="$7"

    if quest_exists "$quest_id"; then
        echo "⏭️  Quest $quest_id ($name) already on-chain — skipping"
        return 0
    fi

    invoke_write "$label" \
        create_quest \
        --caller "$ADMIN_ADDRESS" \
        --quest_type "$quest_type" \
        --name "$name" \
        --description "$description" \
        --target_value "$target_value" \
        --reward_points "$reward_points" \
        --expires_at 0
}

ensure_admin_role

# Only seed when those IDs are missing — never duplicate existing quests
create_quest_if_missing 1 "Create Quest 1: First Donation" 4 \
    "First Donation" "Make your first donation to any project" 1 50

create_quest_if_missing 2 "Create Quest 2: Generous Donor" 4 \
    "Generous Donor" "Donate a total of \$100 across all projects" 100 100

create_quest_if_missing 3 "Create Quest 3: Diverse Supporter" 2 \
    "Diverse Supporter" "Donate to projects in 3 different categories" 3 75

echo ""
echo "========================================"
echo "  Quest Seed Complete!"
echo "========================================"
echo ""
echo "Verify with:"
echo "  stellar contract invoke --network $NETWORK --source $SOURCE \\"
echo "    --id $QUEST_CONTRACT_ID -- get_quest --quest_id 1"
echo ""
