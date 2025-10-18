#!/bin/bash
# deploy-auth.sh

echo "🚀 Starting Auth Contracts Deployment..."

# Parse command line arguments
NETWORK="futurenet"
SOURCE="bob-f"

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
        *)
            # Backward compatibility: first positional arg is network, second is source
            if [[ -z "$NETWORK_SET" ]]; then
                NETWORK="$1"
                NETWORK_SET=true
            elif [[ -z "$SOURCE_SET" ]]; then
                SOURCE="$1"
                SOURCE_SET=true
            fi
            shift
            ;;
    esac
done

echo "📝 Configuration:"
echo "Network: $NETWORK"
echo "Source: $SOURCE"

# Validate network
case $NETWORK in
    testnet|futurenet|mainnet)
        echo "✅ Valid network selected: $NETWORK"
        ;;
    *)
        echo "🔴 Invalid network: $NETWORK"
        echo "Valid options: testnet, futurenet, mainnet"
        echo "Usage: $0 [--testnet|--futurenet|--mainnet] [--source SOURCE_ACCOUNT]"
        echo "   or: $0 [NETWORK] [SOURCE_ACCOUNT] (legacy format)"
        exit 1
        ;;
esac

echo "🛠️  Building auth contracts with Stellar CLI..."

# Build each contract individually using stellar contract build
echo "Building Account Contract..."
cargo build --target wasm32-unknown-unknown --release --manifest-path ./contracts/auth-contracts/account/Cargo.toml || { echo "🔴 Failed to build Account Contract"; exit 1; }

echo "Building Auth Controller Contract..."
cargo build --target wasm32-unknown-unknown --release --manifest-path ./contracts/auth-contracts/auth-controller/Cargo.toml || { echo "🔴 Failed to build Auth Controller Contract"; exit 1; }

echo "Building Account Factory Contract..."
cargo build --target wasm32-unknown-unknown --release --manifest-path ./contracts/auth-contracts/account-factory/Cargo.toml || { echo "🔴 Failed to build Account Factory Contract"; exit 1; }

echo "✅ All contracts built successfully!"

# Deploy Auth Controller Contract first (since Account needs it)
echo "📦 Deploying Auth Controller Contract..."
AUTH_CONTROLLER_WASM_HASH=$(stellar contract upload \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --wasm target/wasm32-unknown-unknown/release/auth_controller.wasm)

AUTH_CONTROLLER_CONTRACT_ID=$(stellar contract deploy \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --wasm-hash "$AUTH_CONTROLLER_WASM_HASH")

echo "✅ Auth Controller Contract deployed: $AUTH_CONTROLLER_CONTRACT_ID"

# Get the funding account's public key in the required format
FUNDING_PUBLIC_KEY=$(stellar keys address "$SOURCE")
echo "📝 Funding account public key: $FUNDING_PUBLIC_KEY"

# Generate sample device_id and public_key for Account Contract
echo "📦 Deploying Account Contract..."
ACCOUNT_WASM_HASH=$(stellar contract upload \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --wasm target/wasm32-unknown-unknown/release/account_contract.wasm)

# Convert credential ID to 32-byte hex hash (SHA-256 of the credential ID)
CREDENTIAL_ID="8b5k8pR3N5o7JEvD4Aw70_738E8wBEQp6DT_vLf4Tp1mLnKkVonWTpKcmRTS1f_ndhKYLooSz2XFMXXaauZCqQ"
DEVICE_ID_HASH=$(echo -n "$CREDENTIAL_ID" | shasum -a 256 | cut -d' ' -f1)

# Convert base64 public key to hex format
# Your WebAuthn public key in base64
PUBLIC_KEY_BASE64="pQECAyYgASFYIIpRuCBPaYjG1Mf1RskFAkxONKCEzWRuWvjxsdvS4CoWIlggQdx5K9DQTVyp+rk2BZf8FVhifph0TltmV0sHmT9ugBs="

# Decode base64 to hex
PUBLIC_KEY_HEX=$(echo -n "$PUBLIC_KEY_BASE64" | base64 -d | xxd -p | tr -d '\n')

# Ensure it's exactly 65 bytes (130 hex characters) for uncompressed secp256r1
# If it's shorter, pad with zeros; if longer, truncate or handle appropriately
if [ ${#PUBLIC_KEY_HEX} -lt 130 ]; then
    # Pad with leading zeros to make it 130 characters (65 bytes)
    PUBLIC_KEY_HEX=$(printf "%0130s" "$PUBLIC_KEY_HEX" | tr ' ' '0')
elif [ ${#PUBLIC_KEY_HEX} -gt 130 ]; then
    # If it's a CBOR/COSE key, extract the actual public key coordinates
    # For now, let's use a properly formatted 65-byte key starting with 04
    PUBLIC_KEY_HEX="04$(echo "$PUBLIC_KEY_HEX" | tail -c 128)"
fi

# Ensure it starts with 04 for uncompressed format
if [[ ! "$PUBLIC_KEY_HEX" =~ ^04 ]]; then
    PUBLIC_KEY_HEX="04$PUBLIC_KEY_HEX"
    # Trim to exactly 130 characters if needed
    PUBLIC_KEY_HEX="${PUBLIC_KEY_HEX:0:130}"
fi

echo "Using device_id hash: $DEVICE_ID_HASH"
echo "Using public_key (hex): $PUBLIC_KEY_HEX"
echo "Public key length: ${#PUBLIC_KEY_HEX} characters (should be 130)"

# Deploy Account Contract with constructor arguments
# ? credential_id (device_id) from devices off-chain table: must be the admin who can update the contract config
# ? public_key from devices off-chain table: must be the admin who can update the contract config
ACCOUNT_CONTRACT_ID=$(stellar contract deploy \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --wasm-hash "$ACCOUNT_WASM_HASH" \
    -- \
    --device_id "$DEVICE_ID_HASH" \
    --public_key "$PUBLIC_KEY_HEX" \
    --auth_contract "$AUTH_CONTROLLER_CONTRACT_ID")

echo "✅ Account Contract deployed: $ACCOUNT_CONTRACT_ID"

# Deploy Account Factory Contract  
echo "📦 Deploying Account Factory Contract..."
ACCOUNT_FACTORY_WASM_HASH=$(stellar contract upload \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --wasm target/wasm32-unknown-unknown/release/account_factory.wasm)

ACCOUNT_FACTORY_CONTRACT_ID=$(stellar contract deploy \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --wasm-hash "$ACCOUNT_FACTORY_WASM_HASH" \
    -- \
    --auth_contract "$AUTH_CONTROLLER_CONTRACT_ID" \
    --wasm_hash "$ACCOUNT_WASM_HASH")

echo "✅ Account Factory Contract deployed: $ACCOUNT_FACTORY_CONTRACT_ID"

# Initialize Auth Controller with WebAuthn public keys ONLY
echo "🔧 Initializing Auth Controller with authorized signers..."

##! IMPORTANT: The auth-controller expects 65-byte uncompressed secp256r1 public keys (WebAuthn format)
##! The funding account ($SOURCE) uses Ed25519 keys and is NOT registered as a signer.
## 
##? Why? After removing require_auth() from the factory contract:
##? - Funding account ONLY pays transaction fees and signs with Ed25519.
##? - Auth-controller signers are ONLY for WebAuthn-based account operations.
##? - The factory contract is now open for any funded deployment.
##? - Individual account security is enforced at the account contract level.

echo "Initializing with WebAuthn public key as the admin signer..."

stellar contract invoke \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --id "$AUTH_CONTROLLER_CONTRACT_ID" \
    -- \
    init \
    --signers "[\"$PUBLIC_KEY_HEX\"]" \
    --default_threshold 1

echo "✅ Auth Controller initialized with admin WebAuthn public key"

# Register the factory contract with the auth controller
echo "📝 Registering factory contract with auth controller..."
stellar contract invoke \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --id "$AUTH_CONTROLLER_CONTRACT_ID" \
    -- \
    add_factory \
    --factory "$ACCOUNT_FACTORY_CONTRACT_ID" \
    --context "[$ACCOUNT_FACTORY_CONTRACT_ID]"

echo "✅ Factory contract registered with auth controller"

# Save deployment info
echo "💾 Saving deployment information..."
cat > auth-deployment-info-${NETWORK}.txt << EOF
Network: $NETWORK
Source Account: $SOURCE ($(stellar keys address $SOURCE))

Auth Controller Contract:
  WASM Hash: $AUTH_CONTROLLER_WASM_HASH  
  Contract ID: $AUTH_CONTROLLER_CONTRACT_ID
  Status: Initialized with admin signer
  Default Threshold: 1

Account Contract:
  WASM Hash: $ACCOUNT_WASM_HASH
  Contract ID: $ACCOUNT_CONTRACT_ID

Account Factory Contract:
  WASM Hash: $ACCOUNT_FACTORY_WASM_HASH
  Contract ID: $ACCOUNT_FACTORY_CONTRACT_ID
  Status: Registered with auth-controller

Configuration:
  Admin Public Key (hex): $PUBLIC_KEY_HEX
  Admin Credential ID: $CREDENTIAL_ID

Deployment Date: $(date)
EOF

echo "🎉 All auth contracts deployed successfully to $NETWORK!"
echo "📄 Deployment info saved to auth-deployment-info-${NETWORK}.txt"

# Display usage examples
echo ""
echo "📚 Usage examples:"
echo "  Deploy to Futurenet:  $0 --futurenet --source alice"
echo "  Deploy to Testnet:    $0 --testnet --source bob" 
echo "  Deploy to Mainnet:    $0 --mainnet --source production"
echo "  Legacy format:        $0 futurenet alice"
