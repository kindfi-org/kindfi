#!/bin/bash
# deploy-all-mainnet.sh
# Orchestrates full KindFi contract deployment to Stellar mainnet.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTRACT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
export CARGO_TARGET_DIR="$CONTRACT_ROOT/target"

SOURCE="${SOURCE:-production}"
SKIP_AUTH="${SKIP_AUTH:-false}"
SKIP_CONFIRM="${SKIP_CONFIRM:-false}"

usage() {
    cat <<'EOF'
Usage: deploy-all-mainnet.sh [OPTIONS]

Deploy all KindFi Soroban contracts to mainnet in dependency order.

Options:
  --source NAME           Stellar CLI identity (default: production)
  --skip-auth             Skip legacy auth contract deployment
  --yes                   Skip final confirmation prompt
  -h, --help              Show this help

Required environment (for auth contracts):
  ADMIN_CREDENTIAL_ID       Production admin WebAuthn credential ID
  ADMIN_PUBLIC_KEY_HEX      65-byte uncompressed secp256r1 public key (130 hex chars)
    OR ADMIN_PUBLIC_KEY_BASE64

Required before post-deploy setup (apps/web):
  SOROBAN_PRIVATE_KEY       Recorder/service account secret key

Prerequisites:
  1. stellar CLI installed and authenticated
  2. Mainnet identity funded with XLM (recommend 50+ XLM)
  3. cargo build / stellar contract build toolchain ready

Deployment order:
  1. Auth (controller, account WASM, factory) — optional with --skip-auth
  2. NFT
  3. Reputation (linked to NFT)
  4. Quest, Streak, Referral (parallel deps on Reputation)
  5. Governance (linked to Reputation)
  6. Post-deploy role grants (NFT metadata_manager, gamification recorders)

Outputs:
  *-deployment-info-mainnet.txt files in apps/contract/
  mainnet-env-template.txt with env vars for apps/web
EOF
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --source)
            SOURCE="$2"
            shift 2
            ;;
        --skip-auth)
            SKIP_AUTH=true
            shift
            ;;
        --yes)
            SKIP_CONFIRM=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

if ! command -v stellar &>/dev/null; then
    echo "Error: stellar CLI not found. Install from https://developers.stellar.org/docs/tools/stellar-cli"
    exit 1
fi

if ! stellar keys address "$SOURCE" &>/dev/null; then
    echo "Error: Stellar identity '$SOURCE' not found."
    echo "Create it with: stellar keys add $SOURCE --secret-key <SECRET>"
    exit 1
fi

ADMIN_ADDRESS=$(stellar keys address "$SOURCE")

echo "========================================"
echo "  KindFi Mainnet Full Deployment"
echo "========================================"
echo "Source identity: $SOURCE"
echo "Admin address:   $ADMIN_ADDRESS"
echo "Skip auth:       $SKIP_AUTH"
echo ""

if [[ "$SKIP_CONFIRM" != "true" ]]; then
    echo "This will deploy ALL KindFi contracts to MAINNET using real XLM."
    read -p "Type 'deploy-mainnet' to continue: " confirm
    if [[ "$confirm" != "deploy-mainnet" ]]; then
        echo "Cancelled."
        exit 0
    fi
fi

cd "$CONTRACT_ROOT"

if [[ "$SKIP_AUTH" != "true" ]]; then
    if [[ -z "${ADMIN_PUBLIC_KEY_HEX:-}" && -z "${ADMIN_PUBLIC_KEY_BASE64:-}" ]]; then
        echo "Warning: ADMIN_PUBLIC_KEY_HEX or ADMIN_PUBLIC_KEY_BASE64 not set."
        echo "Auth controller will use development passkey defaults — not recommended for production."
        read -p "Continue anyway? (yes/no): " auth_confirm
        [[ "$auth_confirm" == "yes" ]] || exit 1
    fi

    echo ""
    echo ">>> [1/6] Deploying auth contracts..."
    "$SCRIPT_DIR/deploy-auth.sh" --mainnet --source "$SOURCE" <<< "yes" || {
        echo "Auth deployment failed"
        exit 1
    }
fi

echo ""
echo ">>> [2/6] Deploying NFT contract..."
"$SCRIPT_DIR/deploy-nft.sh" --mainnet --source "$SOURCE" <<< "yes"

NFT_CONTRACT_ID=$(grep -E '^Contract ID:' nft-deployment-info-mainnet.txt | awk '{print $3}')
NFT_WASM_HASH=$(grep -E '^WASM Hash:' nft-deployment-info-mainnet.txt | awk '{print $3}')

echo ""
echo ">>> [3/6] Deploying Reputation contract..."
"$SCRIPT_DIR/deploy-reputation.sh" --mainnet --source "$SOURCE" --nft-contract "$NFT_CONTRACT_ID" <<< "yes"

REPUTATION_CONTRACT_ID=$(grep -E '^Contract ID:' reputation-deployment-info-mainnet.txt | awk '{print $3}')

echo ""
echo ">>> [4/6] Deploying gamification contracts..."
"$SCRIPT_DIR/deploy-quest.sh" --mainnet --source "$SOURCE" --reputation-contract "$REPUTATION_CONTRACT_ID" <<< "yes"
"$SCRIPT_DIR/deploy-streak.sh" --mainnet --source "$SOURCE" --reputation-contract "$REPUTATION_CONTRACT_ID" <<< "yes"
"$SCRIPT_DIR/deploy-referral.sh" --mainnet --source "$SOURCE" --reputation-contract "$REPUTATION_CONTRACT_ID" <<< "yes"

QUEST_CONTRACT_ID=$(grep -E '^Contract ID:' quest-deployment-info-mainnet.txt | awk '{print $3}')
STREAK_CONTRACT_ID=$(grep -E '^Contract ID:' streak-deployment-info-mainnet.txt | awk '{print $3}')
REFERRAL_CONTRACT_ID=$(grep -E '^Contract ID:' referral-deployment-info-mainnet.txt | awk '{print $3}')

echo ""
echo ">>> [5/6] Deploying Governance contract..."
"$SCRIPT_DIR/deploy-governance.sh" --mainnet --source "$SOURCE" --reputation-contract "$REPUTATION_CONTRACT_ID" <<< "yes"

GOVERNANCE_CONTRACT_ID=$(grep -E '^Contract ID:' governance-deployment-info-mainnet.txt | awk '{print $3}')

if [[ -f auth-deployment-info-mainnet.txt ]]; then
    CONTROLLER_CONTRACT_ID=$(awk '/Auth Controller Contract:/{getline; if ($1=="Contract") print $3}' auth-deployment-info-mainnet.txt)
    ACCOUNT_WASM_HASH=$(awk '/Account Contract:/{getline; if ($1=="WASM") print $3}' auth-deployment-info-mainnet.txt)
    FACTORY_CONTRACT_ID=$(awk '/Account Factory Contract:/{getline; if ($1=="Contract") print $3}' auth-deployment-info-mainnet.txt)
fi

echo ""
echo ">>> [6/6] Post-deploy role grants..."

if [[ -n "${REPUTATION_CONTRACT_ID:-}" && -n "${NFT_CONTRACT_ID:-}" ]]; then
    echo "Granting metadata_manager on NFT to Reputation contract..."
    stellar contract invoke \
        --network mainnet \
        --source "$SOURCE" \
        --id "$NFT_CONTRACT_ID" \
        -- grant_role \
        --account "$REPUTATION_CONTRACT_ID" \
        --role 'metadata_manager' \
        --caller "$ADMIN_ADDRESS" || echo "Warning: metadata_manager grant may already exist"
fi

if [[ -n "${SOROBAN_PRIVATE_KEY:-}" ]]; then
    RECORDER_ADDRESS=$(node -e "const {Keypair}=require('@stellar/stellar-sdk'); console.log(Keypair.fromSecret(process.env.SOROBAN_PRIVATE_KEY).publicKey())" 2>/dev/null || true)

    if [[ -z "$RECORDER_ADDRESS" ]]; then
        echo "Warning: could not derive recorder address from SOROBAN_PRIVATE_KEY"
    else
        echo "Granting recorder roles to $RECORDER_ADDRESS..."
        "$SCRIPT_DIR/setup-gamification-contracts.sh" \
            --mainnet \
            --source "$SOURCE" \
            --recorder-address "$RECORDER_ADDRESS" \
            --streak-contract "$STREAK_CONTRACT_ID" \
            --referral-contract "$REFERRAL_CONTRACT_ID" \
            --quest-contract "$QUEST_CONTRACT_ID" || echo "Warning: recorder role setup had errors"
    fi
else
    echo "SOROBAN_PRIVATE_KEY not set — skip automated recorder role grants."
    echo "Run setup-gamification-contracts.sh manually after setting recorder address."
fi

ENV_TEMPLATE="mainnet-env-template.txt"
cat > "$ENV_TEMPLATE" << EOF
# KindFi Mainnet — generated $(date -u +"%Y-%m-%dT%H:%M:%SZ")
# Copy relevant values to apps/web/.env and Vercel production env.

NETWORK_PASSPHRASE="Public Global Stellar Network ; September 2015"
RPC_URL="https://soroban.stellar.org"
HORIZON_URL="https://horizon.stellar.org"
STELLAR_NETWORK_URL="https://horizon.stellar.org"

# Native XLM SAC (mainnet)
NATIVE_TOKEN_CONTRACT="CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA"
NEXT_PUBLIC_NATIVE_TOKEN_CONTRACT="CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA"

# Auth (legacy passkey wallets)
FACTORY_CONTRACT_ID="${FACTORY_CONTRACT_ID:-}"
CONTROLLER_CONTRACT_ID="${CONTROLLER_CONTRACT_ID:-}"
ACCOUNT_SECP256R1_CONTRACT_WASM="${ACCOUNT_WASM_HASH:-}"

# Platform contracts
NFT_CONTRACT_ADDRESS="${NFT_CONTRACT_ID}"
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS="${NFT_CONTRACT_ID}"

REPUTATION_CONTRACT_ADDRESS="${REPUTATION_CONTRACT_ID}"

QUEST_CONTRACT_ADDRESS="${QUEST_CONTRACT_ID}"
NEXT_PUBLIC_QUEST_CONTRACT_ADDRESS="${QUEST_CONTRACT_ID}"

STREAK_CONTRACT_ADDRESS="${STREAK_CONTRACT_ID}"
NEXT_PUBLIC_STREAK_CONTRACT_ADDRESS="${STREAK_CONTRACT_ID}"

REFERRAL_CONTRACT_ADDRESS="${REFERRAL_CONTRACT_ID}"
NEXT_PUBLIC_REFERRAL_CONTRACT_ADDRESS="${REFERRAL_CONTRACT_ID}"

GOVERNANCE_CONTRACT_ADDRESS="${GOVERNANCE_CONTRACT_ID}"
NEXT_PUBLIC_GOVERNANCE_CONTRACT_ADDRESS="${GOVERNANCE_CONTRACT_ID}"

# Trustless Work — switch when escrows are ready on mainnet
NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK=mainnet
EOF

echo ""
echo "========================================"
echo "  Mainnet Deployment Complete"
echo "========================================"
echo ""
echo "Governance:  $GOVERNANCE_CONTRACT_ID"
echo "Reputation:  $REPUTATION_CONTRACT_ID"
echo "NFT:         $NFT_CONTRACT_ID"
echo "Quest:       $QUEST_CONTRACT_ID"
echo "Streak:      $STREAK_CONTRACT_ID"
echo "Referral:    $REFERRAL_CONTRACT_ID"
echo ""
echo "Env template written to: $ENV_TEMPLATE"
echo "Update Vercel production environment variables before switching traffic."
