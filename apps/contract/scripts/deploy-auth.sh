#!/bin/bash
# deploy-auth.sh

echo "🚀 Starting Auth Contracts Deployment..."

# Check if network parameter is provided
NETWORK=${1:-testnet}
SOURCE=${2:-bob}

echo "📝 Configuration:"
echo "Network: $NETWORK"
echo "Source: $SOURCE"

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

# Generate sample device_id and public_key for Account Contract
echo "📦 Deploying Account Contract..."
ACCOUNT_WASM_HASH=$(stellar contract upload \
    --network "$NETWORK" \
    --source "$SOURCE" \
    --wasm target/wasm32-unknown-unknown/release/account_contract.wasm)

# Convert credential ID to 32-byte hex hash (SHA-256 of the credential ID)
# TODO: Set a testnet credential_id (supabase db superuser)
CREDENTIAL_ID="S_Kj5QeUSkyguckpT-2kXA"
DEVICE_ID_HASH=$(echo -n "$CREDENTIAL_ID" | shasum -a 256 | cut -d' ' -f1)

# Convert base64 public key to hex format
# Your WebAuthn public key in base64
# TODO: Set a testnet public_key_base64 (supabase db superuser)
PUBLIC_KEY_BASE64="pQECAyYgASFYINYWHQkaQvnILp78oIB5xmAkx9sy20FMy0r4fOyJe2ogIlgga6SFzW37nuqRRVxFR7c8+5JfQhWrQwjcs8N3huPrIg4="

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

# Save deployment info
echo "💾 Saving deployment information..."
cat > auth-deployment-info.txt << EOF
Network: $NETWORK
Source Account: $SOURCE ($(stellar keys address $SOURCE))

Auth Controller Contract:
  WASM Hash: $AUTH_CONTROLLER_WASM_HASH  
  Contract ID: $AUTH_CONTROLLER_CONTRACT_ID

Account Contract:
  WASM Hash: $ACCOUNT_WASM_HASH
  Contract ID: $ACCOUNT_CONTRACT_ID

Account Factory Contract:
  WASM Hash: $ACCOUNT_FACTORY_WASM_HASH
  Contract ID: $ACCOUNT_FACTORY_CONTRACT_ID

Deployment Date: $(date)
EOF

echo "🎉 All auth contracts deployed successfully!"
echo "📄 Deployment info saved to auth-deployment-info.txt"