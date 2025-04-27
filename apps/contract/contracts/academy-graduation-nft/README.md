Academy Graduation NFT Contract
📌 Overview
The Academy Graduation NFT Contract is a Soroban smart contract built on the Stellar blockchain, designed to issue soulbound Non-Fungible Tokens (NFTs) to users who complete an academy’s educational modules. These NFTs serve as verifiable proof of completion, embedding metadata such as issuance timestamps, version details, and earned badges. The contract ensures secure, transparent, and non-transferable ownership, leveraging Stellar’s robust infrastructure for decentralized applications (DApps).
The contract integrates with two external contracts:

ProgressTracker: Verifies module completion.
BadgeTracker: Manages user badges earned during the academy program.

This project emphasizes security, modularity, and testability, with a focus on soulbound NFTs that cannot be transferred, ensuring the integrity of the graduation credential.
🚀 Features

Soulbound NFT Minting 🖼️: Issues non-transferable NFTs to users who complete all required modules, tied to their Stellar account.
Cross-Contract Integration 🔗: Interacts with ProgressTracker to verify completion and BadgeTracker to fetch earned badges.
On-Chain Metadata Storage 📄: Stores NFT metadata (timestamp, version, badges) persistently on the blockchain.
Secure Authentication 🔒: Enforces user authentication via require_auth for minting and badge/progress queries.
Comprehensive Error Handling ⚠️: Includes errors for uninitialized states, already minted NFTs, incomplete modules, and soulbound restrictions.
Interoperability with Stellar Accounts 🚀: Seamlessly integrates with Stellar accounts for user identification and authentication.

🎯 Design Considerations
The contract was designed with the following principles in mind:

Soulbound NFTs: NFTs are non-transferable to ensure they remain tied to the graduate’s Stellar account, preserving the integrity of the credential.
Modular Architecture: Separates concerns by integrating with ProgressTracker and BadgeTracker contracts, allowing independent updates to progress tracking and badge management logic.
Security First:
Uses require_auth to prevent unauthorized minting or data access.
Validates contract initialization to prevent re-initialization errors.
Employs persistent storage for NFTs and temporary storage for mock contract states to minimize ledger footprint.


Testability: Designed with comprehensive unit tests covering success cases (minting with full/empty badges), failure cases (unauthenticated minting, incomplete modules), and edge cases (non-existent NFTs, multiple users).
Extensibility: Metadata includes a version field (v1.0) to support future upgrades, and badge lists are flexible to accommodate varying badge sets.
Mock Contracts for Development:
ProgressTracker and BadgeTracker are mock implementations to simulate real-world academy systems, enabling rapid development and testing without external dependencies.
Both mocks use temporary storage for flexibility and to avoid persistent data in tests.



🧐 Assumptions
The following assumptions were made during development:

Soulbound Nature: Graduates cannot transfer their NFTs, as they represent personal achievements. The attempt_transfer function always returns NFTError::Soulbound.
Single NFT per User: Each user can mint only one NFT, enforced by checking for existing NFTs before minting.
External Contracts:
ProgressTracker provides a reliable is_completed function to verify module completion.
BadgeTracker provides get_full_badges and get_empty_badges, with get_full_badges defaulting to an empty list until badges are set.


Stellar Environment: The contract operates on the Stellar blockchain using Soroban, with users having valid Stellar accounts for authentication.
Testing Environment: Tests assume a controlled environment with mock_all_auths for most cases, except test_mint_unauthenticated, which verifies real authentication requirements.
Badge Flexibility: Badges are stored as a Vec<String>, allowing any number of badges (including none) to be included in the NFT metadata.

🛠 Prerequisites
Before using the contract, ensure you have:

Rust (stable, for Soroban development)
Soroban CLI (for building and deploying contracts)
Stellar SDK (for interacting with the Stellar network)
Stellar CLI (optional, for network interactions)
A Stellar account with sufficient XLM for contract deployment and transaction fees

🔧 Setup & Deployment
Clone Repository
git clone https://github.com/your-repo/academy-graduation-nft.git
cd academy-graduation-nft

Note: Replace https://github.com/your-repo/academy-graduation-nft.git with your actual repository URL.
Install Dependencies
Ensure Rust and Soroban CLI are installed:
rustup update stable
cargo install --locked soroban-cli

Build Contract
Build the main contract and mock contracts:
cd academy-graduation-nft
stellar contract build
cd ../progress-tracker
stellar contract build
cd ../badge-tracker
stellar contract build

This generates WASM files in target/wasm32-unknown-unknown/release/ for:

academy_graduation_nft.wasm
mock_progress_tracker.wasm
mock_badge_tracker.wasm

Deploy Contracts
Deploy the mock contracts first, then the main contract:
# Deploy ProgressTracker
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/mock_progress_tracker.wasm \
  --source <YOUR_SECRET_KEY> --network testnet

Save the returned contract ID as <PROGRESS_CONTRACT_ID>.
# Deploy BadgeTracker
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/mock_badge_tracker.wasm \
  --source <YOUR_SECRET_KEY> --network testnet

Save the returned contract ID as <BADGE_CONTRACT_ID>.
# Deploy AcademyGraduationNFT
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/academy_graduation_nft.wasm \
  --source <YOUR_SECRET_KEY> --network testnet

Save the returned contract ID as <CONTRACT_ID>.
Initialize Contract
Initialize the contract with the addresses of ProgressTracker and BadgeTracker:
soroban contract invoke --id <CONTRACT_ID> --source <YOUR_SECRET_KEY> --network testnet \
  --fn initialize \
  --arg <PROGRESS_CONTRACT_ID> --arg <BADGE_CONTRACT_ID>

🔄 Usage
Mint an NFT
Mint a graduation NFT for a user who has completed all modules:
soroban contract invoke --id <CONTRACT_ID> --source <USER_SECRET_KEY> --network testnet \
  --fn mint_graduation_nft \
  --arg <USER_ADDRESS>


The contract checks ProgressTracker’s is_completed to verify completion.
Fetches badges from BadgeTracker’s get_full_badges.
Stores the NFT with metadata (timestamp, version v1.0, badges).

Check NFT Existence
Verify if a user has an NFT:
soroban contract invoke --id <CONTRACT_ID> --source <YOUR_SECRET_KEY> --network testnet \
  --fn has_graduation_nft \
  --arg <USER_ADDRESS>

Returns true if the user has an NFT, false otherwise.
Retrieve NFT Details
Get the NFT’s details (owner, metadata):
soroban contract invoke --id <CONTRACT_ID> --source <YOUR_SECRET_KEY> --network testnet \
  --fn get_graduation_nft \
  --arg <USER_ADDRESS>

Returns the NFT’s owner, metadata.issued_at, metadata.version, and metadata.badges if it exists, or None if it doesn’t.
Set Badges (Testing/Setup)
Set badges for a user in BadgeTracker (e.g., for testing):
soroban contract invoke --id <BADGE_CONTRACT_ID> --source <USER_SECRET_KEY> --network testnet \
  --fn set_badges \
  --arg <USER_ADDRESS> \
  --arg '["MathMaster","ScienceStar","HistoryBuff"]'

Set Completion (Testing/Setup)
Set completion status in ProgressTracker (e.g., for testing):
soroban contract invoke --id <PROGRESS_CONTRACT_ID> --source <USER_SECRET_KEY> --network testnet \
  --fn set_completion \
  --arg <USER_ADDRESS> --arg true

🧪 Testing
The contract includes a comprehensive test suite covering all core functionalities and edge cases. Tests are located in academy-graduation-nft/src/tests.rs and use mock contracts for ProgressTracker and BadgeTracker.
Run Tests
cargo test --release

Test Cases

Initialization:
test_initialize_success: Verifies correct storage of ProgressTracker and BadgeTracker addresses.
test_initialize_already_initialized: Ensures re-initialization fails with NFTError::AlreadyInitialized.


Minting:
test_mint_success_full_badges: Mints an NFT with a full badge list (["MathMaster", "ScienceStar", "HistoryBuff"]).
test_mint_empty_badges: Mints an NFT with an empty badge list (default BadgeTracker behavior).
test_mint_already_minted: Ensures re-minting for the same user fails with NFTError::AlreadyMinted.
test_mint_not_initialized: Verifies minting fails if the contract is uninitialized.
test_mint_unauthenticated: Ensures minting fails without user authentication.
test_mint_not_completed: Verifies minting fails if ProgressTracker reports incomplete modules.
test_mint_multiple_users: Mints NFTs for multiple users with distinct metadata.


NFT Retrieval:
test_get_graduation_nft: Retrieves an existing NFT and verifies its details.
test_get_graduation_nft_none: Ensures None is returned for non-existent NFTs.
test_has_graduation_nft: Verifies NFT existence checks.


Soulbound Property:
test_attempt_transfer_fails: Ensures transfer attempts fail with NFTError::Soulbound.



Mock Contracts in Tests

ProgressTracker:
WASM: mock_progress_tracker.wasm
Functions:
is_completed: Returns completion status (defaults to true, configurable via set_completion).
set_completion: Sets completion status for testing (e.g., false for test_mint_not_completed).


Purpose: Simulates an academy’s progress tracking system, allowing tests to control completion states.


BadgeTracker:
WASM: mock_badge_tracker.wasm
Functions:
get_empty_badges: Returns an empty Vec<String>.
get_full_badges: Returns user badges (defaults to empty, configurable via set_badges).
set_badges: Sets badges for testing (e.g., ["MathMaster", "ScienceStar", "HistoryBuff"]).


Purpose: Simulates badge management, enabling tests to verify NFT metadata with varying badge lists.



Tests use mock_all_auths for authentication (except test_mint_unauthenticated) and leverage Soroban’s Env for ledger and storage manipulation.
📖 References

Stellar Soroban Guide
Rust Book
Soroban CLI Documentation
Stellar Developers
Soroban Cross-Contract Calls

🤝 Contributing
Contributions are welcome! Please:

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit changes (git commit -m 'Add your feature').
Push to the branch (git push origin feature/your-feature).
Open a pull request.

Ensure tests pass and follow the project’s coding standards.
📜 License
This project is licensed under the MIT License. See the LICENSE file for details.
📬 Contact
For questions or support, reach out via:

GitHub Issues: your-repo/academy-graduation-nft/issues
Stellar Developers Community: community.stellar.org

Note: Update the repository URL and contact details as needed.
