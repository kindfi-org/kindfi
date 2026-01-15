# Testnet Contract Deployment - Update Required

## ✅ Deployment Successful!

All contracts have been successfully deployed to **testnet** on **January 14, 2026**.

## 📋 New Contract Addresses

### Factory Contract

```
CDEA3HFVIMUJ3MZPUST4CRZ5SVV3FMPB6PILU6MGSDQZKDLTVTQHRM4D
```

### Controller Contract (Auth Controller)

```
CAXLM3X6QF6YUZWUVNV3CFE4SMDTEJEWH3KN7ZTGO4WMYIFOLJJV66FE
```

### Account Contract

```
CBD4PVOPBSNKQ4LLNYLVKCY3PW6UXNDZ5GAQDXZDNFGVEKXPO3OVZLYA
```

## 🔧 Required Environment Variable Updates

```env
# Stellar Testnet Configuration
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
RPC_URL="https://soroban-testnet.stellar.org"
HORIZON_URL="https://horizon-testnet.stellar.org"

# Contract Addresses (NEW - Update these!)
FACTORY_CONTRACT_ID="CDEA3HFVIMUJ3MZPUST4CRZ5SVV3FMPB6PILU6MGSDQZKDLTVTQHRM4D"
CONTROLLER_CONTRACT_ID="CAXLM3X6QF6YUZWUVNV3CFE4SMDTEJEWH3KN7ZTGO4WMYIFOLJJV66FE"

# Funding Account (for deploying smart wallets)
STELLAR_FUNDING_SECRET_KEY="<your_funding_secret_key>"
```

## 📝 Deployment Details

- **Network**: Testnet
- **Source Account**: `bran` (G......)
- **Deployment Date**: Wed Jan 14 15:29:28 CST 2026

### Contract WASM Hashes

- **Auth Controller**: `d887023f89062ef5d3585b3ac78f41ad704098b201f1da763371dc7c3929ab29`
- **Account Contract**: `ec1ff19a693aa031f1b554eeebcb5a2658dfee3bc21bb61f42a1f066e7427dfb`
- **Account Factory**: `22785ec38f9d1a7843c00bd650429f1b4d0b1f8a0a221dcadf42dad330bd60d1`

## ✅ Verification

The contracts have been:

- ✅ Deployed to testnet
- ✅ Auth Controller initialized with admin WebAuthn public key
- ✅ Factory contract registered with auth controller

## 🚀 Next Steps

1. **Update your `.env` file** with the new contract addresses above
2. **Restart your development server** to pick up the new configuration
3. **Test registration** - Smart Account deployment should now work!

## 🔗 Transaction Links

- Auth Controller Deployment: https://stellar.expert/explorer/testnet/tx/a79baac15b78cb2cfe86430ed0043348022b025686906c35505b6cedda599329
- Account Contract Deployment: https://stellar.expert/explorer/testnet/tx/bc0b4ee7a997e3e44a51f3c192b83ff16edd2cdcec13d8ffaf7b0132af43f44e
- Factory Contract Deployment: https://stellar.expert/explorer/testnet/tx/731e316f6440aed4bc0a50335e177845b90f0171a8117a0e1c16327383424f7f

## 📄 Full Deployment Info

See `auth-deployment-info-testnet.txt` for complete deployment details.
