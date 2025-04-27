
# Academy Graduation NFT Contract

## 📌 Overview
The **Academy Graduation NFT Contract** is a Soroban smart contract built on the Stellar blockchain for Kindfi Academy, designed to issue soulbound Non-Fungible Tokens (NFTs) to users who complete the academy’s educational modules. These NFTs serve as verifiable proof of completion, embedding metadata such as issuance timestamps, version details, and earned badges. The contract ensures secure, transparent, and non-transferable ownership, leveraging Stellar’s robust infrastructure for decentralized applications (DApps).

The contract integrates with two external contracts:
- **ProgressTracker**: Verifies module completion.
- **BadgeTracker**: Manages user badges earned during the academy program.

This project emphasizes **security**, **modularity**, and **testability**, with a focus on soulbound NFTs that cannot be transferred, ensuring the integrity of the graduation credential.

## 🚀 Features
- **Soulbound NFT Minting** 🖼️: Issues non-transferable NFTs to users who complete all required modules, tied to their Stellar account.
- **Cross-Contract Integration** 🔗: Interacts with `ProgressTracker` to verify completion and `BadgeTracker` to fetch earned badges.
- **On-Chain Metadata Storage** 📄: Stores NFT metadata (timestamp, version, badges) persistently on the blockchain.
- **Secure Authentication** 🔒: Enforces user authentication via `require_auth` for minting and badge/progress queries.
- **Comprehensive Error Handling** ⚠️: Includes errors for uninitialized states, already minted NFTs, incomplete modules, and soulbound restrictions.
- **Interoperability with Stellar Accounts** 🚀: Seamlessly integrates with Stellar accounts for user identification and authentication.

## 🎯 Design Considerations
The contract was designed with the following principles in mind:
- **Soulbound NFTs**: NFTs are non-transferable to ensure they remain tied to the graduate’s Stellar account, preserving the integrity of the credential.
- **Modular Architecture**: Separates concerns by integrating with `ProgressTracker` and `BadgeTracker` contracts, allowing independent updates to progress tracking and badge management logic.
- **Security First**:
  - Uses `require_auth` to prevent unauthorized minting or data access.
  - Validates contract initialization to prevent re-initialization errors.
  - Employs persistent storage for NFTs and temporary storage for mock contract states to minimize ledger footprint.
- **Testability**: Designed with comprehensive unit tests covering success cases (minting with full/empty badges), failure cases (unauthenticated minting, incomplete modules), and edge cases (non-existent NFTs, multiple users).
- **Extensibility**: Metadata includes a version field (`v1.0`) to support future upgrades, and badge lists are flexible to accommodate varying badge sets.
- **Mock Contracts for Development**:
  - `ProgressTracker` and `BadgeTracker` are mock implementations to simulate real-world academy systems, enabling rapid development and testing without external dependencies.
  - Both mocks use temporary storage for flexibility and to avoid persistent data in tests.

## 🧐 Assumptions
The following assumptions were made during development:
- **Soulbound Nature**: Graduates cannot transfer their NFTs, as they represent personal achievements. The `attempt_transfer` function always returns `NFTError::Soulbound`.
- **Single NFT per User**: Each user can mint only one NFT, enforced by checking for existing NFTs before minting.
- **External Contracts**:
  - `ProgressTracker` provides a reliable `is_completed` function to verify module completion.
  - `BadgeTracker` provides `get_full_badges` and `get_empty_badges`, with `get_full_badges` defaulting to an empty list until badges are set.
- **Stellar Environment**: The contract operates on the Stellar blockchain using Soroban, with users having valid Stellar accounts for authentication.
- **Testing Environment**: Tests assume a controlled environment with `mock_all_auths` for most cases, except `test_mint_unauthenticated`, which verifies real authentication requirements.
- **Badge Flexibility**: Badges are stored as a `Vec<String>`, allowing any number of badges (including none) to be included in the NFT metadata.

## 🛠 Prerequisites
Before using the contract, ensure you have:
- [Rust](https://www.rust-lang.org/) (stable, for Soroban development)
- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup) (for building and deploying contracts)
- [Stellar SDK](https://developers.stellar.org/) (for interacting with the Stellar network)
- [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli) (optional, for network interactions)
- A Stellar account with sufficient XLM for contract deployment and transaction fees

## 🔧 Setup & Deployment

### Build Contract
Build the main contract and mock contracts:
```sh
cd academy-graduation-nft
stellar contract build
cd ../progress-tracker
stellar contract build
cd ../badge-tracker
stellar contract build
```

This generates WASM files in `target/wasm32-unknown-unknown/release/` for:
- `academy_graduation_nft.wasm`
- `mock_progress_tracker.wasm`
- `mock_badge_tracker.wasm`

## 🧪 Testing
The contract includes a comprehensive test suite covering all core functionalities and edge cases. Tests are located in `academy-graduation-nft/src/tests.rs` and use mock contracts for `ProgressTracker` and `BadgeTracker`.

### Run Tests
```sh
cargo test
```

## 📖 References
- [Stellar Soroban Guide](https://soroban.stellar.org/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Soroban CLI Documentation](https://soroban.stellar.org/docs/reference/cli)
- [Stellar Developers](https://developers.stellar.org/)
- [Soroban Cross-Contract Calls](https://soroban.stellar.org/docs/advanced-tutorials/cross-contract-calls)

## 📜 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
