# Quest Creation Guide

This guide explains how to create and manage quests in the KindFi platform, including both database and on-chain synchronization.

## Overview

Quests are goal-based challenges that users can complete to earn rewards. When a quest is created through the admin interface, it is automatically:
1. **Saved to the database** - For fast UI queries and user progress tracking
2. **Synced to the on-chain Quest contract** - For immutable, decentralized quest logic and reputation point distribution

## Prerequisites

Before creating quests, ensure:

1. **Admin Access**: You must have `admin` role in your user profile
2. **Quest Contract Deployed**: The Quest contract must be deployed and configured
3. **Environment Variables**: Required environment variables are set:
   - `QUEST_CONTRACT_ADDRESS` - The deployed Quest contract address
   - `ADMIN_PRIVATE_KEY` or `SOROBAN_PRIVATE_KEY` - Admin account secret key (must have admin role on contract)
   - `RPC_URL` or `STELLAR_RPC_URL` - Stellar RPC endpoint
   - `NETWORK_PASSPHRASE` or `STELLAR_NETWORK_PASSPHRASE` - Network passphrase

4. **Admin Role Granted**: The admin account must have the "admin" role granted on the Quest contract (see [Setup](#setup) below)

## Setup

### 1. Grant Admin Role on Quest Contract

Before creating quests, ensure the admin account has the "admin" role on the Quest contract:

```bash
cd apps/contract
./scripts/setup-gamification-contracts.sh \
  --testnet \
  --recorder-address <RECORDER_ADDRESS> \
  --streak-contract <STREAK_CONTRACT_ID> \
  --referral-contract <REFERRAL_CONTRACT_ID> \
  --quest-contract <QUEST_CONTRACT_ID>
```

Or manually grant the admin role:

```bash
stellar contract invoke \
  --network testnet \
  --source bran \
  --id <QUEST_CONTRACT_ID> \
  -- grant_role \
  --account <ADMIN_ADDRESS> \
  --role 'admin' \
  --caller <ADMIN_ADDRESS>
```

### 2. Verify Configuration

Check that your `.env` file contains:

```env
QUEST_CONTRACT_ADDRESS=CAAWF56GKMGXWSGY7MPK6AQ3U2SF5CJLKC3P7UFZCGD2GDJQZ6INEWQK
ADMIN_PRIVATE_KEY=SCXXX... # Optional, falls back to SOROBAN_PRIVATE_KEY
SOROBAN_PRIVATE_KEY=SCBAR46TW6FF4MPIIPPHE5GBKQDFPRIPZNR4KPGW6JRPJMVWCYIYDESF
RPC_URL=https://soroban-testnet.stellar.org
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
```

## Creating Quests via Admin UI

### Step-by-Step Process

1. **Navigate to Admin Gamification Page**
   - Go to `/admin/gamification`
   - Click on the "Quests" tab

2. **Click "Create Quest" Button**
   - Opens a dialog form for quest creation

3. **Fill in Quest Details**
   - **Quest Type**: Select from available types (see [Quest Types](#quest-types) below)
   - **Quest Name**: A short, descriptive name (e.g., "First Donation")
   - **Description**: Detailed description of what users need to do
   - **Target Value**: The numeric target (e.g., 1 for first donation, 100 for $100 total)
   - **Reward Points**: Points awarded upon completion (optional, defaults to 0)
   - **Expiration Date**: Optional expiration date/time

4. **Submit Quest**
   - Click "Create Quest"
   - The system will:
     - Save the quest to the database
     - Automatically sync it to the on-chain Quest contract
     - Return both database and on-chain results

### Quest Types

| Database Value | Contract Enum | Description |
|---------------|---------------|-------------|
| `multi_region_donation` | 0 | Donate to campaigns in N different regions |
| `weekly_streak` | 1 | Donate N weeks in a row |
| `multi_category_donation` | 2 | Donate to N different categories |
| `referral_quest` | 3 | Refer N users who complete onboarding |
| `total_donation_amount` | 4 | Donate a total amount across all campaigns |
| `quest_master` | 5 | Complete N quests |

### Example Quests

#### Example 1: First Donation Quest
```json
{
  "quest_type": "total_donation_amount",
  "name": "First Donation",
  "description": "Make your first donation to any project",
  "target_value": 1,
  "reward_points": 50,
  "expires_at": null
}
```

#### Example 2: Generous Donor Quest
```json
{
  "quest_type": "total_donation_amount",
  "name": "Generous Donor",
  "description": "Donate a total of $100 across all projects",
  "target_value": 100,
  "reward_points": 100,
  "expires_at": null
}
```

#### Example 3: Diverse Supporter Quest
```json
{
  "quest_type": "multi_category_donation",
  "name": "Diverse Supporter",
  "description": "Donate to projects in 3 different categories",
  "target_value": 3,
  "reward_points": 75,
  "expires_at": null
}
```

## API Endpoint

### POST `/api/quests`

Creates a new quest (admin only).

**Request Body:**
```json
{
  "quest_type": "total_donation_amount",
  "name": "Quest Name",
  "description": "Quest description",
  "target_value": 1,
  "reward_points": 50,
  "expires_at": "2026-12-31T23:59:59Z", // Optional, ISO 8601 format
  "contract_address": "CAAWF56GKMGXWSGY7MPK6AQ3U2SF5CJLKC3P7UFZCGD2GDJQZ6INEWQK" // Optional, uses env var if not provided
}
```

**Response:**
```json
{
  "quest": {
    "id": "uuid",
    "quest_id": 1,
    "quest_type": "total_donation_amount",
    "name": "Quest Name",
    "description": "Quest description",
    "target_value": 1,
    "reward_points": 50,
    "expires_at": null,
    "is_active": true,
    "created_at": "2026-02-07T...",
    "updated_at": "2026-02-07T..."
  },
  "onChain": {
    "synced": true,
    "questId": 1,
    "error": null
  }
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## On-Chain Synchronization

### How It Works

When a quest is created:

1. **Database Creation**: Quest is saved to `quest_definitions` table
2. **Type Mapping**: Database quest type is mapped to contract enum value
3. **Timestamp Conversion**: Expiration date is converted to Unix timestamp (0 = no expiration)
4. **Contract Invocation**: `create_quest` function is called on the Quest contract
5. **Transaction Submission**: Transaction is signed and submitted to the Stellar network
6. **Result Tracking**: Both database and on-chain results are returned

### Contract Function Signature

```rust
pub fn create_quest(
    e: &Env,
    caller: Address,           // Admin address (must have admin role)
    quest_type: QuestType,     // Enum: 0-5
    name: String,
    description: String,
    target_value: u32,
    reward_points: u32,
    expires_at: u64,          // Unix timestamp, 0 = no expiration
) -> u32                       // Returns quest_id
```

### Error Handling

The system handles errors gracefully:

- **Database Success, On-Chain Failure**: Quest is still created in database, but `onChain.synced` will be `false`
- **Missing Configuration**: Warning logged, quest created in database only
- **Permission Errors**: Transaction fails, quest not created on-chain (check admin role)

## Manual On-Chain Sync

If automatic sync fails, you can manually sync quests using the sync script:

```bash
cd apps/contract
./scripts/sync-quests-to-chain.sh \
  --testnet \
  --quest-contract CAAWF56GKMGXWSGY7MPK6AQ3U2SF5CJLKC3P7UFZCGD2GDJQZ6INEWQK
```

This script will:
1. Grant admin role if needed
2. Create all quests from the database on-chain

## Troubleshooting

### Quest Created in Database but Not On-Chain

**Symptoms**: Quest appears in admin UI but contract calls fail with `QuestNotFound`

**Solutions**:
1. Check `QUEST_CONTRACT_ADDRESS` is set correctly
2. Verify admin account has admin role: `has_role(admin_address, "admin")`
3. Check transaction logs for errors
4. Manually sync using the sync script

### Permission Denied Errors

**Error**: `Error(Contract, #2000)` or `Unauthorized`

**Solutions**:
1. Grant admin role to the admin account:
   ```bash
   stellar contract invoke \
     --network testnet \
     --source bran \
     --id <QUEST_CONTRACT_ID> \
     -- grant_role \
     --account <ADMIN_ADDRESS> \
     --role 'admin' \
     --caller <ADMIN_ADDRESS>
   ```

### Recorder Role Not Granted (Gamification Updates Fail)

**Symptoms**: 
- `UnreachableCodeReached` errors when updating streaks, referrals, or quest progress
- `has_role` check returns `0` (false)

**Solutions**:
1. Verify recorder role is granted:
   ```bash
   stellar contract invoke \
     --network testnet \
     --source bran \
     --id <CONTRACT_ID> \
     -- has_role \
     --account <RECORDER_ADDRESS> \
     --role 'recorder'
   ```
   Should return `1` if granted, `0` if not.

2. Grant recorder role if missing:
   ```bash
   # For Streak contract
   stellar contract invoke \
     --network testnet \
     --source bran \
     --id <STREAK_CONTRACT_ID> \
     -- grant_role \
     --account <RECORDER_ADDRESS> \
     --role 'recorder' \
     --caller <ADMIN_ADDRESS> \
     --send=yes
   
   # For Referral contract
   stellar contract invoke \
     --network testnet \
     --source bran \
     --id <REFERRAL_CONTRACT_ID> \
     -- grant_role \
     --account <RECORDER_ADDRESS> \
     --role 'recorder' \
     --caller <ADMIN_ADDRESS> \
     --send=yes
   
   # For Quest contract
   stellar contract invoke \
     --network testnet \
     --source bran \
     --id <QUEST_CONTRACT_ID> \
     -- grant_role \
     --account <RECORDER_ADDRESS> \
     --role 'recorder' \
     --caller <ADMIN_ADDRESS> \
     --send=yes
   ```

3. Use the setup script to grant all roles at once:
   ```bash
   cd apps/contract
   ./scripts/setup-gamification-contracts.sh \
     --testnet \
     --recorder-address <RECORDER_ADDRESS> \
     --streak-contract <STREAK_CONTRACT_ID> \
     --referral-contract <REFERRAL_CONTRACT_ID> \
     --quest-contract <QUEST_CONTRACT_ID>
   ```

### Quest Type Mismatch

**Error**: Quest type doesn't match expected values

**Solutions**:
1. Verify quest type is one of the valid enum values
2. Check the mapping in the API endpoint matches contract enum

### Transaction Simulation Fails

**Error**: Simulation errors when creating quest

**Solutions**:
1. Verify admin account has sufficient XLM for fees
2. Check contract address is correct
3. Verify network passphrase matches
4. Check contract is deployed and initialized

### `assembleTransaction is not a function` Error

**Error**: `TypeError: assembleTransaction is not a function`

**Solutions**:
1. Ensure `assembleTransaction` is imported from `@stellar/stellar-sdk/rpc`, not `@stellar/stellar-sdk`
2. Use correct signature: `assembleTransaction(transaction, simulation).build()` (2 params, not 3)

## Best Practices

1. **Quest IDs**: Quest IDs are auto-incremented. Don't manually set them
2. **Target Values**: Always use positive integers (> 0)
3. **Reward Points**: Set meaningful reward points to incentivize completion
4. **Expiration Dates**: Use expiration dates for time-limited campaigns
5. **Descriptions**: Write clear, actionable descriptions
6. **Testing**: Test quest creation on testnet before mainnet
7. **Monitoring**: Monitor on-chain sync status in logs

## Related Documentation

- [Gamification Contracts Service](../../lib/stellar/gamification-contracts.ts)
- [Quest Contract Source](../../../contract/contracts/quest/src/lib.rs)
- [Admin Gamification Manager](../../components/sections/admin/admin-gamification-manager.tsx)
- [Quest API Route](../../app/api/quests/route.ts)

## Support

For issues or questions:
1. Check transaction logs in the terminal
2. Verify environment variables are set correctly
3. Ensure admin role is granted on the contract
4. Review contract deployment documentation
