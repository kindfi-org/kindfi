# KindFi Reputation Contract

A reputation contract for the KindFi ecosystem that tracks user points, calculates levels, and integrates with the NFT contract for automatic metadata updates. Built on OpenZeppelin Stellar Contracts v0.6.0 for Soroban.

## Key Features

- **Points System**: Point accumulation for different types of events
- **Level System**: Five levels (Rookie, Bronze, Silver, Gold, Diamond)
- **Permission Thresholds**: Level-based access control for platform features
- **NFT Integration**: Automatic NFT metadata updates when leveling up
- **Access Control**: Separate roles for event recording and configuration
- **TTL Management**: Persistent storage with automatic TTL (30 days)

## Architecture

```
src/
├── lib.rs         # Main contract and implemented traits
├── storage.rs     # Storage helpers and TTL
├── events.rs      # Contract event definitions
├── types.rs       # Data types (EventType, Level, StorageKey)
├── errors.rs      # Custom error codes
├── nft_client.rs  # Cross-contract calls to NFT contract
└── test.rs        # Unit tests
```

## Level System

| Level | Value | Points Required |
|-------|-------|-----------------|
| **Rookie** | 0 | 0 |
| **Bronze** | 1 | 200 |
| **Silver** | 2 | 500 |
| **Gold** | 3 | 1,000 |
| **Diamond** | 4 | 5,000 |

## Event Types and Default Points

| Event | Identifier | Points |
|-------|------------|--------|
| Donation | `Donation` | 10 |
| Donation Streak | `StreakDonation` | 25 |
| Successful Referral | `SuccessfulReferral` | 50 |
| New Category | `NewCategoryDonation` | 15 |
| New Campaign | `NewCampaignDonation` | 5 |
| Quest Completed | `QuestCompletion` | 30 |
| Boosted Project | `BoostedProject` | 20 |
| Outstanding Booster | `OutstandingBooster` | 100 |

## Default Permission Thresholds

| Permission | Required Level |
|------------|----------------|
| **Voting** | Bronze |
| **EarlyAccess** | Silver |
| **ExclusiveRounds** | Gold |
| **SpecialRewards** | Diamond |

## Access Control Roles

| Role | Identifier | Permissions |
|------|------------|-------------|
| **Admin** | (set on init) | Manage roles, transfer admin, configure NFT |
| **Recorder** | `recorder` | Record reputation events |
| **Config** | `config` | Update thresholds and point values |

## Contract Functions

### Initialization

```rust
fn __constructor(e: &Env, admin: Address, nft_contract: Option<Address>)
```

Initializes the contract with admin and optionally the NFT contract for integration.

**Parameters:**
- `admin`: Address that will have admin privileges
- `nft_contract`: Optional NFT contract address for integration

**Errors:**
- `AlreadyInitialized` (400): If the contract was already initialized

### Core Functions

#### Record Event

```rust
fn record_event(e: &Env, caller: Address, user: Address, event_type: EventType) -> u32
```

Records a reputation event for a user using default points.

**Requires:** `recorder` role

**Parameters:**
- `caller`: Address initiating the record (must have recorder role)
- `user`: Address receiving the points
- `event_type`: Type of event to record

**Returns:** User's total points after the event

**Emits:** `ReputationEventData`, and optionally `LevelUpEventData` if user levels up

#### Record Event with Custom Points

```rust
fn record_event_with_points(e: &Env, caller: Address, user: Address, event_type: EventType, points: u32) -> u32
```

Records an event with a custom amount of points.

**Requires:** `recorder` role

**Errors:**
- `InvalidPoints` (404): If points is 0
- `PointsOverflow` (405): If adding points would cause overflow

### Query Functions

```rust
fn get_level(e: &Env, user: Address) -> u32
```
Gets the user's current level (0-4).

```rust
fn get_points(e: &Env, user: Address) -> u32
```
Gets the user's total points.

```rust
fn calculate_level(e: &Env, points: u32) -> u32
```
Calculates what level a given point total would achieve.

```rust
fn meets_threshold(e: &Env, user: Address, threshold_type: ThresholdType) -> bool
```
Checks if the user meets a specific permission threshold.

```rust
fn get_level_threshold(e: &Env, level: u32) -> u32
```
Gets the points required for a specific level.

```rust
fn get_event_point_value(e: &Env, event_type: EventType) -> u32
```
Gets the point value for an event type.

```rust
fn get_user_events(e: &Env, user: Address) -> Vec<ReputationEventRecord>
```
Gets the user's event history.

```rust
fn get_user_nft_token_id(e: &Env, user: Address) -> Option<u32>
```
Gets the NFT token ID registered for the user.

### Admin Functions

#### Set Level Thresholds

```rust
fn set_level_thresholds(e: &Env, caller: Address, thresholds: Map<u32, u32>)
```

Updates the point thresholds for each level.

**Requires:** `config` role

**Emits:** `ThresholdsUpdatedData`

#### Set Event Point Values

```rust
fn set_event_point_values(e: &Env, caller: Address, event_points: Map<EventType, u32>)
```

Updates the points awarded for each event type.

**Requires:** `config` role

**Emits:** `PointValuesUpdatedData`

#### Set Permission Threshold

```rust
fn set_permission_threshold(e: &Env, caller: Address, threshold_type: ThresholdType, level: u32)
```

Sets the required level for a permission type.

**Requires:** `config` role

#### Set NFT Contract

```rust
fn set_nft_contract(e: &Env, caller: Address, nft_address: Address)
```

Sets the NFT contract address for integration.

**Requires:** Admin

**Emits:** `NFTContractSetEventData`

#### Register User NFT

```rust
fn register_user_nft(e: &Env, caller: Address, user: Address, token_id: u32)
```

Registers a user's NFT token ID for automatic updates.

**Requires:** `recorder` role

**Emits:** `UserNFTRegisteredData`

### Access Control Functions (AccessControl)

| Function | Description |
|----------|-------------|
| `has_role(account, role)` | Checks if an account has a role |
| `grant_role(account, role, caller)` | Grants a role (admin only) |
| `revoke_role(account, role, caller)` | Revokes a role (admin only) |
| `renounce_role(role, caller)` | Renounces a role |
| `get_role_member_count(role)` | Number of members with a role |
| `get_role_member(role, index)` | Gets member by index |
| `get_admin()` | Gets admin address |
| `transfer_admin_role(new_admin, live_until_ledger)` | Initiates admin transfer |
| `accept_admin_transfer()` | Accepts admin transfer |
| `renounce_admin()` | Renounces admin role |

### Role Helper Functions

```rust
fn recorder_role(e: &Env) -> Symbol
```
Returns the recorder role symbol.

```rust
fn config_role(e: &Env) -> Symbol
```
Returns the config role symbol.

## Data Types

### EventType

```rust
#[contracttype]
pub enum EventType {
    Donation = 0,
    StreakDonation = 1,
    SuccessfulReferral = 2,
    NewCategoryDonation = 3,
    NewCampaignDonation = 4,
    QuestCompletion = 5,
    BoostedProject = 6,
    OutstandingBooster = 7,
}
```

### ThresholdType

```rust
#[contracttype]
pub enum ThresholdType {
    Voting = 0,
    EarlyAccess = 1,
    ExclusiveRounds = 2,
    SpecialRewards = 3,
}
```

### Level

```rust
#[contracttype]
pub enum Level {
    Rookie = 0,
    Bronze = 1,
    Silver = 2,
    Gold = 3,
    Diamond = 4,
}
```

### ReputationEventRecord

```rust
#[contracttype]
pub struct ReputationEventRecord {
    pub event_type: EventType,
    pub points: u32,
    pub timestamp: u64,
}
```

### StorageKey

```rust
#[contracttype]
pub enum StorageKey {
    Admin,
    NFTContract,
    UserPoints(Address),
    UserLevel(Address),
    UserNFTTokenId(Address),
    UserEvents(Address),
    LevelThreshold(Level),
    EventPointValue(EventType),
    PermissionThreshold(ThresholdType),
    Initialized,
}
```

## Events

### ReputationEventData

Emitted when a reputation event is recorded.

| Field | Type | Description |
|-------|------|-------------|
| `user` | `Address` (topic) | User who received the points |
| `event_type` | `EventType` | Event type |
| `points` | `u32` | Points awarded |
| `new_total_points` | `u32` | New total points |

### LevelUpEventData

Emitted when a user levels up.

| Field | Type | Description |
|-------|------|-------------|
| `user` | `Address` (topic) | User who leveled up |
| `old_level` | `Level` | Previous level |
| `new_level` | `Level` | New level |
| `total_points` | `u32` | Total points at level up |

### ThresholdsUpdatedData

Emitted when level thresholds are updated.

| Field | Type | Description |
|-------|------|-------------|
| `admin` | `Address` (topic) | Admin who made the update |
| `timestamp` | `u64` | Update timestamp |

### PointValuesUpdatedData

Emitted when event point values are updated.

| Field | Type | Description |
|-------|------|-------------|
| `admin` | `Address` (topic) | Admin who made the update |
| `timestamp` | `u64` | Update timestamp |

### NFTContractSetEventData

Emitted when the NFT contract is configured.

| Field | Type | Description |
|-------|------|-------------|
| `admin` | `Address` (topic) | Admin who made the configuration |
| `nft_contract` | `Address` | NFT contract address |

### UserNFTRegisteredData

Emitted when a user's NFT is registered.

| Field | Type | Description |
|-------|------|-------------|
| `user` | `Address` (topic) | User whose NFT was registered |
| `token_id` | `u32` | Registered token ID |

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 400 | `AlreadyInitialized` | Contract was already initialized |
| 401 | `Unauthorized` | Caller doesn't have required permissions |
| 402 | `UserNotFound` | User not found in the system |
| 403 | `InvalidEventType` | Invalid event type |
| 404 | `InvalidPoints` | Invalid points value (must be positive) |
| 405 | `PointsOverflow` | Points calculation would cause overflow |
| 406 | `InvalidLevelThreshold` | Invalid level threshold configuration |
| 407 | `NFTContractNotSet` | NFT contract address not configured |
| 408 | `NFTUpgradeFailed` | NFT update failed |
| 409 | `UserHasNoNFT` | User doesn't have a registered NFT |

> **Note:** Error codes start at 400 to avoid conflicts with other contracts.

## Constants

### Instance TTL

| Constant | Value | Description |
|----------|-------|-------------|
| `DAY_IN_LEDGERS` | 17,280 | Ledgers per day (~5 sec/block) |
| `INSTANCE_TTL_AMOUNT` | 518,400 | Instance TTL (30 days) |
| `INSTANCE_TTL_THRESHOLD` | 501,120 | Extension threshold (29 days) |

### Default Point Values

| Constant | Value |
|----------|-------|
| `DEFAULT_DONATION_POINTS` | 10 |
| `DEFAULT_STREAK_DONATION_POINTS` | 25 |
| `DEFAULT_REFERRAL_POINTS` | 50 |
| `DEFAULT_NEW_CATEGORY_POINTS` | 15 |
| `DEFAULT_NEW_CAMPAIGN_POINTS` | 5 |
| `DEFAULT_QUEST_COMPLETION_POINTS` | 30 |
| `DEFAULT_BOOSTED_PROJECT_POINTS` | 20 |
| `DEFAULT_OUTSTANDING_BOOSTER_POINTS` | 100 |

### Default Level Thresholds

| Constant | Value |
|----------|-------|
| `ROOKIE_THRESHOLD` | 0 |
| `BRONZE_THRESHOLD` | 200 |
| `SILVER_THRESHOLD` | 500 |
| `GOLD_THRESHOLD` | 1,000 |
| `DIAMOND_THRESHOLD` | 5,000 |

## Dependencies

```toml
[dependencies]
soroban-sdk = { workspace = true }
stellar-access = { workspace = true }    # OpenZeppelin access control
stellar-macros = { workspace = true }    # Macros #[only_role]
```

## NFT Integration

The Reputation contract can integrate with the KindFi NFT contract to automatically update NFT metadata when a user levels up.

### Setup

1. The Reputation contract needs the `metadata_manager` role on the NFT contract
2. Register each user's NFT token ID using `register_user_nft`
3. Configure the NFT contract address using `set_nft_contract`

### Update Flow

```
User earns points → Levels up → NFT metadata is automatically updated
```

### Cross-Contract Calls

The `nft_client.rs` module implements cross-contract calls to the NFT contract using `try_invoke_contract`:

```rust
// In nft_client.rs:
fn try_get_nft_metadata(e: &Env, nft_contract: &Address, token_id: u32) -> Option<NFTMetadata> {
    let result = e.try_invoke_contract(
        nft_contract,
        &Symbol::new(e, "get_metadata"),
        (token_id,).into_val(e),
    );
    // Handle result...
}
```

The `try_upgrade_nft` function will automatically update the `level:X` attribute in the NFT metadata when a user levels up.

## Usage Example

```rust
use soroban_sdk::{symbol_short, Address, Env, Map};
use reputation::{Reputation, EventType, ThresholdType};

// 1. Initialize contract
Reputation::__constructor(&env, admin, None);

// 2. Grant recorder role
Reputation::grant_role(&env, recorder_address, symbol_short!("recorder"), admin);

// 3. Grant config role
Reputation::grant_role(&env, config_address, symbol_short!("config"), admin);

// 4. Record reputation events
let new_points = Reputation::record_event(&env, recorder, user, EventType::Donation);
// new_points = 10

// 5. Record multiple events
Reputation::record_event(&env, recorder, user, EventType::StreakDonation);
Reputation::record_event(&env, recorder, user, EventType::SuccessfulReferral);
// Total: 10 + 25 + 50 = 85 points

// 6. Record event with custom points
Reputation::record_event_with_points(&env, recorder, user, EventType::Donation, 200);
// Total: 85 + 200 = 285 points (now Bronze)

// 7. Query level
let level = Reputation::get_level(&env, user);
// level = 1 (Bronze)

// 8. Check permission threshold
let can_vote = Reputation::meets_threshold(&env, user, ThresholdType::Voting);
// can_vote = true (Bronze meets Voting requirement)

// 9. Query event history
let events = Reputation::get_user_events(&env, user);

// 10. Configure custom values (requires config role)
let mut event_points: Map<EventType, u32> = Map::new(&env);
event_points.set(EventType::Donation, 20); // Double donation points

Reputation::set_event_point_values(&env, config, event_points);

// 11. NFT integration
Reputation::set_nft_contract(&env, admin, nft_contract_address);
Reputation::register_user_nft(&env, recorder, user, token_id);
// Now when the user levels up, their NFT will be automatically updated
```

## Building

```bash
cd apps/contract
cargo build --target wasm32-unknown-unknown --release -p reputation
```

## Testing

```bash
cd apps/contract
cargo test -p reputation
```

## License

MIT License - Kindfi Org
