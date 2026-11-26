# KindFi NFT Contract

A non-fungible token (NFT) contract for the KindFi platform's reputation and incentivization system. Built on OpenZeppelin Stellar Contracts **v0.8.0**, using the workspace's **soroban-sdk 28.0.0** dependency.

## Key Features

- **Sequential IDs**: Minting with sequential token IDs starting from 0
- **On-chain metadata**: Custom metadata stored directly on the blockchain
- **Role-based access control**: Separate roles for minting, burning, and metadata management
- **OpenZeppelin NFT functionality**: Transfers, approvals, balance queries
- **Automatic TTL extension**: Persistent storage with automatic TTL management (30 days)

## Architecture

```
src/
├── lib.rs       # Main contract and implemented traits
├── mint.rs      # Minting logic with sequential IDs
├── burn.rs      # Burning logic with metadata cleanup
├── metadata.rs  # Metadata storage and retrieval
├── events.rs    # Contract event definitions
├── types.rs     # Data types (NFTMetadata, StorageKey)
└── errors.rs    # Custom error codes
```

## Access Control Roles

| Role | Identifier | Permissions |
|------|------------|-------------|
| **Admin** | (set on init) | Manage roles, transfer admin |
| **Minter** | `minter` | Create new NFTs |
| **Burner** | `burner` | Burn existing NFTs |
| **Metadata Manager** | `metadata_manager` | Update NFT metadata |

## Contract Functions

### Initialization

```rust
fn __constructor(e: &Env, admin: Address, name: String, symbol: String, base_uri: String)
```

Initializes the contract with admin, collection name, symbol, and base URI.

**Parameters:**
- `admin`: Address that will have administrator privileges
- `name`: Collection name (e.g., "KindFi NFT")
- `symbol`: Collection symbol (e.g., "KFNFT")
- `base_uri`: Base URI for token metadata (e.g., "https://api.kindfi.org/nft/")

**Errors:**
- `AlreadyInitialized` (300): If the contract has already been initialized

### Minting

```rust
fn mint_with_metadata(e: &Env, caller: Address, to: Address, nft_metadata: NFTMetadata) -> u32
```

Creates a new NFT with custom metadata.

**Requires:** `minter` role

**Parameters:**
- `caller`: Address initiating the mint (must have minter role)
- `to`: Address that will receive the NFT
- `nft_metadata`: Custom metadata for the NFT

**Returns:** Token ID of the minted NFT (sequential, starting from 0)

**Emits:** `MintedEventData`

### Metadata Update

```rust
fn update_metadata(e: &Env, caller: Address, token_id: u32, nft_metadata: NFTMetadata)
```

Updates the metadata of an existing NFT.

**Requires:** `metadata_manager` role

**Parameters:**
- `caller`: Address initiating the update
- `token_id`: ID of the token to update
- `nft_metadata`: New metadata for the NFT

**Emits:** `MetadataUpdatedEventData`

### Queries

```rust
fn get_metadata(e: &Env, token_id: u32) -> Option<NFTMetadata>
```

Retrieves the metadata for a specific token.

```rust
fn total_supply(e: &Env) -> u32
```

Returns the total number of NFTs minted (includes burned tokens).

```rust
fn metadata_manager_role(e: &Env) -> Symbol
```

Returns the metadata_manager role symbol (helper for long role names).

### OpenZeppelin interface and SEP-0050

Checked on **2026-11-25**: [SEP-0050](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0050.md)
is **Draft, version 0.1.0**. KindFi follows the pinned OpenZeppelin interface;
it does not claim compliance with the draft SEP. The comparison uses the
[v0.8.0 trait](https://github.com/OpenZeppelin/stellar-contracts/blob/v0.8.0/packages/tokens/src/non_fungible/mod.rs)
and [NFT access-control example](https://github.com/OpenZeppelin/stellar-contracts/blob/v0.8.0/examples/nft-access-control/src/contract.rs).
Raven was unavailable (HTTP 401), so the SEP was checked directly in Stellar's official source.

| Function | Provided by OZ v0.8.0? | Required by SEP-0050 draft? | SEP status on 2026-11-25 |
|----------|-----------------------|---------------------------|--------------------------|
| `balance` | Yes, `NonFungibleToken` / `Base` | Yes | Draft |
| `owner_of` | Yes, `NonFungibleToken` / `Base` | Yes | Draft |
| `transfer` | Yes; KindFi also extends instance TTL | Yes | Draft |
| `transfer_from` | Yes; KindFi also extends instance TTL | Yes | Draft |
| `approve` | Yes; KindFi also extends instance TTL | Yes | Draft |
| `approve_for_all` | Yes; KindFi also extends instance TTL | Yes | Draft |
| `get_approved` | Yes, `NonFungibleToken` / `Base` | Yes | Draft |
| `is_approved_for_all` | Yes, `NonFungibleToken` / `Base` | Yes | Draft |
| `name` | Yes, `NonFungibleToken` / `Base` | Yes | Draft |
| `symbol` | Yes, `NonFungibleToken` / `Base` | Yes | Draft |
| `token_uri` | Yes, `NonFungibleToken` / `Base` | Yes | Draft |
| `burn`, `burn_from` | Yes, optional `NonFungibleBurnable`; KindFi adds role checks and metadata cleanup | No | Draft |
| `mint_with_metadata` | KindFi entry point using `Base::mint_with_id` | No prescribed mint entry point | Draft |
| `get_metadata`, `update_metadata` | KindFi custom on-chain metadata | No | Draft |
| `total_supply`, `metadata_manager_role`, access-control functions | KindFi helpers / OZ access control | No | Draft |

The eleven core function signatures match the draft with `u32` token IDs and
balances. All existing explicit trait methods compile on v0.8.0; no additional
required methods or stubs were needed. The OZ example uses
`Compose<(Base,)>` with generated trait methods; KindFi retains the supported
`Base` type and explicit forwarding methods to preserve its TTL extensions.
This is not a claim of full event or metadata compliance: the draft's
inline `approve` event description differs from its dedicated Events section,
and OZ uses typed event payloads. Consumers should follow the pinned OZ source.
KindFi's `NFTMetadata` is an on-chain struct, not the JSON returned by `token_uri`:
it uses `image_uri` instead of `image`, and stores attribute `value` and optional
`max_value` as strings. A metadata server must map those fields and numeric values
to the draft JSON schema. `token_uri` uses the collection base URI and token ID;
updating custom on-chain metadata does not change that URI.

### NFT Functions (NonFungibleToken)

| Function | Description |
|----------|-------------|
| `balance(account)` | Number of NFTs owned by an address |
| `owner_of(token_id)` | Owner of a token |
| `transfer(from, to, token_id)` | Transfer token |
| `transfer_from(spender, from, to, token_id)` | Transfer with approval |
| `approve(approver, approved, token_id, live_until_ledger)` | Approve operator for token |
| `approve_for_all(owner, operator, live_until_ledger)` | Approve operator for all tokens |
| `get_approved(token_id)` | Get approved address for a token |
| `is_approved_for_all(owner, operator)` | Check global approval |
| `name()` | Collection name |
| `symbol()` | Collection symbol |
| `token_uri(token_id)` | Token URI |

### Burning Functions (NonFungibleBurnable)

```rust
fn burn(e: &Env, from: Address, token_id: u32)
```

Burns an NFT owned by the caller.

**Requires:** `burner` role on the `from` address

```rust
fn burn_from(e: &Env, spender: Address, from: Address, token_id: u32)
```

Burns an NFT from another address (requires approval).

**Requires:** `burner` role on `spender` + approval from owner

**Emits:** `BurnedEventData`

### Access Control Functions (AccessControl)

| Function | Description |
|----------|-------------|
| `has_role(account, role)` | Check if account has role |
| `grant_role(account, role, caller)` | Grant role (admin only) |
| `revoke_role(account, role, caller)` | Revoke role (admin only) |
| `renounce_role(role, caller)` | Renounce a role |
| `get_role_member_count(role)` | Number of members with a role |
| `get_role_member(role, index)` | Get member by index |
| `get_admin()` | Get admin address |
| `get_role_admin(role)` | Get role admin |
| `transfer_admin_role(new_admin, live_until_ledger)` | Initiate admin transfer |
| `accept_admin_transfer()` | Accept admin transfer |
| `set_role_admin(role, admin_role)` | Set role admin |
| `renounce_admin()` | Renounce admin role |

## Data Types

### NFTMetadata

```rust
#[contracttype]
pub struct NFTMetadata {
    /// Display name for the NFT
    pub name: String,
    /// Description of the NFT
    pub description: String,
    /// URI pointing to the NFT image
    pub image_uri: String,
    /// External URL for more information
    pub external_url: String,
    /// Structured on-chain attributes (see src/types.rs)
    pub attributes: Vec<NFTAttribute>,
}
```

### StorageKey

```rust
#[contracttype]
pub enum StorageKey {
    /// Counter for sequential token IDs
    TokenCounter,
    /// Metadata storage per token ID
    TokenMetadata(u32),
}
```

## Events

This re-validation preserves the custom event definitions and topic ordering.
`update_metadata` emits `MetadataSetEventData` followed by
`MetadataUpdatedEventData`. Each has its generated snake-case name as the first
topic (`metadata_set_event_data` / `metadata_updated_event_data`), followed by
`token_id`; the data map contains `metadata`. Indexers should consume these
existing shapes. No topic rename or event migration is introduced here.

### MintedEventData

Emitted when a new NFT is created.

| Field | Type | Description |
|-------|------|-------------|
| `token_id` | `u32` (topic) | ID of the created token |
| `to` | `Address` | Recipient address |
| `metadata` | `NFTMetadata` | NFT metadata |

### BurnedEventData

Emitted when an NFT is burned.

| Field | Type | Description |
|-------|------|-------------|
| `token_id` | `u32` (topic) | ID of the burned token |
| `from` | `Address` | Owner address |

### MetadataUpdatedEventData

Emitted when NFT metadata is updated.

| Field | Type | Description |
|-------|------|-------------|
| `token_id` | `u32` (topic) | ID of the updated token |
| `metadata` | `NFTMetadata` | New metadata |

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 300 | `AlreadyInitialized` | Contract has already been initialized |
| 301 | `TokenIdOverflow` | Token counter overflow |
| 302 | `MetadataNotFound` | Metadata not found for the token |
| 303 | `TokenNotFound` | Token does not exist |
| 304 | `Unauthorized` | Caller does not have required permissions |
| 305 | `InvalidMetadata` | Provided metadata is invalid |

> **Note:** Error codes start at 300 to avoid conflicts with OpenZeppelin NFT errors (200-214).

## Constants

### Instance TTL

| Constant | Value | Description |
|----------|-------|-------------|
| `DAY_IN_LEDGERS` | 17,280 | Ledgers per day (~5 sec/block) |
| `INSTANCE_TTL_AMOUNT` | 518,400 | Instance TTL (30 days) |
| `INSTANCE_TTL_THRESHOLD` | 501,120 | Extension threshold (29 days) |

### Metadata TTL

| Constant | Value | Description |
|----------|-------|-------------|
| `METADATA_TTL_AMOUNT` | 518,400 | Metadata TTL (30 days) |
| `METADATA_TTL_THRESHOLD` | 501,120 | Extension threshold (29 days) |

## Dependencies

```toml
[dependencies]
soroban-sdk = { workspace = true }
stellar-access = { workspace = true }    # OpenZeppelin access control
stellar-macros = { workspace = true }    # Macros #[only_role], #[has_role]
stellar-tokens = { workspace = true }    # OpenZeppelin NFT base implementation
```

## Usage Example

```rust
use soroban_sdk::{symbol_short, vec, Address, Env, String};
// In the contract crate; external consumers should use a generated client.
use crate::{KindfiNFT, types::{NFTAttribute, NFTMetadata}};
use stellar_access::access_control::AccessControl;
use stellar_tokens::non_fungible::{NonFungibleToken, burnable::NonFungibleBurnable};

// 1. Initialize contract
KindfiNFT::__constructor(
    &env,
    admin,
    String::from_str(&env, "KindFi NFT"),
    String::from_str(&env, "KFNFT"),
    String::from_str(&env, "https://api.kindfi.org/nft/")
);

// 2. Grant minter role
KindfiNFT::grant_role(&env, minter_address, symbol_short!("minter"), admin);

// 3. Grant metadata_manager role
let metadata_role = KindfiNFT::metadata_manager_role(&env);
KindfiNFT::grant_role(&env, manager_address, metadata_role, admin);

// 4. Mint NFT with metadata
let metadata = NFTMetadata {
    name: String::from_str(&env, "Early Supporter Badge"),
    description: String::from_str(&env, "Badge awarded to early KindFi supporters"),
    image_uri: String::from_str(&env, "https://api.kindfi.org/images/badge.png"),
    external_url: String::from_str(&env, "https://kindfi.org/badges/early"),
    attributes: vec![
        &env,
        NFTAttribute {
            trait_type: String::from_str(&env, "tier"),
            value: String::from_str(&env, "gold"),
            display_type: None,
            max_value: None,
        }
    ],
};

let token_id = KindfiNFT::mint_with_metadata(&env, minter, recipient, metadata);
// token_id = 0 (first token)

// 5. Query metadata
let stored_metadata = KindfiNFT::get_metadata(&env, token_id);

// 6. Query owner
let owner = KindfiNFT::owner_of(&env, token_id);

// 7. Transfer NFT
KindfiNFT::transfer(&env, owner, new_owner, token_id);

// 8. Update metadata (requires metadata_manager role)
let new_metadata = NFTMetadata {
    name: String::from_str(&env, "Early Supporter Badge - Upgraded"),
    description: String::from_str(&env, "Upgraded badge"),
    image_uri: String::from_str(&env, "https://api.kindfi.org/images/badge-v2.png"),
    external_url: String::from_str(&env, "https://kindfi.org/badges/early-v2"),
    attributes: vec![
        &env,
        NFTAttribute {
            trait_type: String::from_str(&env, "tier"),
            value: String::from_str(&env, "platinum"),
            display_type: None,
            max_value: None,
        }
    ],
};

KindfiNFT::update_metadata(&env, manager, token_id, new_metadata);

// 9. Burn NFT (requires burner role)
KindfiNFT::grant_role(&env, new_owner.clone(), symbol_short!("burner"), admin);
KindfiNFT::burn(&env, new_owner, token_id);
```

## Building

```bash
cd apps/contract
stellar contract build --package nft-kindfi
```

Use Stellar CLI v25.2.0 or later and the `wasm32v1-none` target. SDK 28 requires
the CLI's Wasm post-processing; native tests still use Cargo.

## Testing

```bash
cd apps/contract
cargo test -p nft-kindfi
```

## License

MIT License - Kindfi Org
