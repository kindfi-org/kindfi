#!/bin/bash
# grant-recorder-role.sh
# Grant recorder role to the recorder account on all gamification contracts

# Don't exit on error - we want to continue even if one grant fails
set +e

echo "========================================"
echo "  Grant Recorder Role to All Contracts"
echo "========================================"

# Configuration
NETWORK="testnet"
SOURCE="bran"
ADMIN_ADDRESS="GAC63U4ZEGRCIDFMUJM34EVIGOW4PSMJ6B66ELCWSF6ZVYSONKL6LIEA"
RECORDER_ADDRESS="GDR4TQZWAFNQU7RF23RATACBBWRNCRY3I6UG226MBONZXAOOHENLYHJF"

STREAK_CONTRACT_ID="CAGM7PLW6HGNYDRFQ56HCAVGDKJ4M4GNDO5PON3THVPYNMHDP3U6HRCO"
REFERRAL_CONTRACT_ID="CAU2WK677MCZ4UJ74PDEJEPJCUVKYLBMUV3BS3GHBBDH5P6XZKJLAGWN"
QUEST_CONTRACT_ID="CAAWF56GKMGXWSGY7MPK6AQ3U2SF5CJLKC3P7UFZCGD2GDJQZ6INEWQK"

# Get source account address to verify it matches admin
SOURCE_ADDRESS=$(stellar keys address "$SOURCE" 2>/dev/null || echo "")

echo ""
echo "=== Configuration ==="
echo "Network:         $NETWORK"
echo "Source:          $SOURCE"
echo "Source Address:  $SOURCE_ADDRESS"
echo "Admin Address:   $ADMIN_ADDRESS"
echo "Recorder Address: $RECORDER_ADDRESS"
echo ""

# Verify source matches admin
if [[ -n "$SOURCE_ADDRESS" && "$SOURCE_ADDRESS" != "$ADMIN_ADDRESS" ]]; then
    echo "⚠️  WARNING: Source address ($SOURCE_ADDRESS) does not match admin address ($ADMIN_ADDRESS)"
    echo "   The transaction signer must match the admin address for role grants to work"
    echo ""
fi

# Function to verify admin address matches contract admin
verify_admin() {
    local contract_id=$1
    local contract_name=$2
    
    echo ""
    echo "=== Verifying admin for $contract_name ==="
    local contract_admin=$(stellar contract invoke \
        --network "$NETWORK" \
        --source "$SOURCE" \
        --id "$contract_id" \
        -- get_admin 2>&1 | grep -o 'G[A-Z0-9]\{55\}' | head -1 || echo "")
    
    if [[ -z "$contract_admin" ]]; then
        echo "⚠️  Could not retrieve contract admin"
        return 1
    fi
    
    if [[ "$contract_admin" == "$ADMIN_ADDRESS" ]]; then
        echo "✅ Admin address matches: $ADMIN_ADDRESS"
        return 0
    else
        echo "❌ Admin mismatch!"
        echo "   Expected: $ADMIN_ADDRESS"
        echo "   Contract: $contract_admin"
        return 1
    fi
}

# Function to grant role and verify
grant_and_verify() {
    local contract_id=$1
    local contract_name=$2
    
    # First verify admin
    if ! verify_admin "$contract_id" "$contract_name"; then
        echo "⚠️  Skipping role grant due to admin mismatch"
        return 1
    fi
    
    echo ""
    echo "=== Step 1: Ensuring admin has admin role ==="
    # First, check if admin has the admin role (result is usually last line: 0 or 1)
    local admin_has_role=$(stellar contract invoke \
        --network "$NETWORK" \
        --source "$SOURCE" \
        --id "$contract_id" \
        -- has_role \
        --account "$ADMIN_ADDRESS" \
        --role 'admin' 2>&1 | tail -1 | tr -d '[:space:]')
    [[ "$admin_has_role" != "1" ]] && admin_has_role="0"
    
    if [[ "$admin_has_role" != "1" ]]; then
        echo "Admin does not have 'admin' role. Granting it first..."
        echo "Note: The admin set during construction should be able to grant roles"
        STELLAR_SEND=yes stellar contract invoke \
            --network "$NETWORK" \
            --source "$SOURCE" \
            --id "$contract_id" \
            --send yes \
            -- grant_role \
            --account "$ADMIN_ADDRESS" \
            --role 'admin' \
            --caller "$ADMIN_ADDRESS" 2>&1 | tee /tmp/grant-admin-role.log
        
        if [[ $? -eq 0 ]]; then
            echo "✅ Admin role granted to admin address"
            echo "Waiting 5 seconds for admin role to be confirmed on-chain..."
            sleep 5
            # Verify admin role was actually granted (on-chain read; result on last line)
            local verify_admin_role=$(STELLAR_SEND=yes stellar contract invoke \
                --network "$NETWORK" \
                --source "$SOURCE" \
                --id "$contract_id" \
                --send yes \
                -- has_role \
                --account "$ADMIN_ADDRESS" \
                --role 'admin' 2>&1 | tail -1 | tr -d '[:space:]')
            [[ "$verify_admin_role" != "1" ]] && verify_admin_role="0"
            if [[ "$verify_admin_role" == "1" ]]; then
                echo "✅ Admin role confirmed on-chain"
            else
                echo "⚠️  Warning: Admin role verification returned $verify_admin_role (expected 1)"
            fi
        else
            echo "⚠️  Failed to grant admin role (may already be granted or have permissions via set_admin)"
            grep -i "error\|fail\|denied\|unauthorized" /tmp/grant-admin-role.log || true
        fi
    else
        echo "✅ Admin already has 'admin' role"
    fi
    
    echo ""
    echo "=== Step 2: Granting recorder role on $contract_name ==="
    
    # Grant the recorder role - explicitly send the transaction
    echo "Executing grant_role transaction..."
    echo "Note: Using STELLAR_SEND=yes and --send yes to ensure transaction is submitted"
    STELLAR_SEND=yes stellar contract invoke \
        --network "$NETWORK" \
        --source "$SOURCE" \
        --id "$contract_id" \
        --send yes \
        -- grant_role \
        --account "$RECORDER_ADDRESS" \
        --role 'recorder' \
        --caller "$ADMIN_ADDRESS" 2>&1 | tee /tmp/grant-role.log
    
    local grant_exit_code=$?
    
    # Check for success event in the log
    if grep -qi "role_granted.*recorder\|Success.*role_granted" /tmp/grant-role.log; then
        echo "✅ Recorder role grant transaction succeeded!"
        grep -i "role_granted\|Success\|transaction hash" /tmp/grant-role.log | head -3
    elif [[ $grant_exit_code -eq 0 ]]; then
        echo "⚠️  Transaction executed but no success event found"
        echo "Checking for errors..."
        if grep -qi "error\|fail\|denied\|unauthorized\|panic" /tmp/grant-role.log; then
            echo "❌ Errors found in transaction output:"
            grep -i "error\|fail\|denied\|unauthorized\|panic" /tmp/grant-role.log | head -5
        else
            echo "Full transaction output:"
            cat /tmp/grant-role.log
        fi
    else
        echo "❌ Role grant command returned non-zero exit code: $grant_exit_code"
        echo "Full output:"
        cat /tmp/grant-role.log
    fi
    
    # Wait for transaction to be included in a ledger (testnet ~5s per ledger)
    echo "Waiting 10 seconds for transaction confirmation..."
    sleep 10
    
    echo ""
    echo "=== Verifying role grant (on-chain read with --send yes) ==="
    # Use --send yes so we read actual ledger state; otherwise CLI may return simulation only
    local has_role_output=$(STELLAR_SEND=yes stellar contract invoke \
        --network "$NETWORK" \
        --source "$SOURCE" \
        --id "$contract_id" \
        --send yes \
        -- has_role \
        --account "$RECORDER_ADDRESS" \
        --role 'recorder' 2>&1)
    
    # Parse actual return value: CLI prints result on last line (0 or 1), not first digit of tx hash
    local has_role=$(echo "$has_role_output" | tail -1 | tr -d '[:space:]')
    [[ "$has_role" != "1" ]] && has_role="0"
    
    if [[ "$has_role" == "1" ]]; then
        echo "✅ Recorder role granted successfully on $contract_name"
        return 0
    else
        echo "❌ Failed to grant recorder role on $contract_name (has_role returned: $has_role)"
        echo "   Full output: $has_role_output"
        echo ""
        echo "   To debug, run this single command and check the full output:"
        echo "   STELLAR_SEND=yes stellar contract invoke --network $NETWORK --source $SOURCE --id $contract_id --send yes -- grant_role --account $RECORDER_ADDRESS --role 'recorder' --caller $ADMIN_ADDRESS"
        return 1
    fi
}

# Grant roles on all contracts
grant_and_verify "$STREAK_CONTRACT_ID" "Streak Contract"
grant_and_verify "$REFERRAL_CONTRACT_ID" "Referral Contract"
grant_and_verify "$QUEST_CONTRACT_ID" "Quest Contract"

echo ""
echo "========================================"
echo "  Role Grant Complete!"
echo "========================================"
echo ""
echo "Recorder account ($RECORDER_ADDRESS) now has 'recorder' role on:"
echo "  ✅ Streak Contract"
echo "  ✅ Referral Contract"
echo "  ✅ Quest Contract"
echo ""
