# Security Guidelines for Contract Deployment Files

## ⚠️ Important Security Notice

**NEVER commit secret keys, private keys, or sensitive credentials to version control.**

## What's Safe to Expose

The following information is **public** and safe to include in documentation:

- ✅ **Contract Addresses** (C-addresses like `CCSZX5HH...`)
  - These are public on-chain identifiers
  - Anyone can query them on Stellar Explorer

- ✅ **Account Addresses** (G-addresses like `GAC63U4Z...`)
  - These are public account identifiers
  - Not secret, but don't reveal account balances unnecessarily

- ✅ **WASM Hashes**
  - Public identifiers for contract code
  - Used to verify contract deployments

- ✅ **Environment Variable Names**
  - Variable names like `REPUTATION_CONTRACT_ADDRESS` are not secrets
  - Only the values may contain secrets

## What's NOT Safe to Expose

**NEVER commit these to version control:**

- ❌ **Secret Keys** (starting with `SC...`)
  - These provide full control over Stellar accounts
  - Store in Supabase Edge Functions Secrets or secure vaults

- ❌ **Private Keys**
  - Same as secret keys - full account control

- ❌ **API Keys**
  - Any API keys, tokens, or authentication credentials

- ❌ **Passwords**
  - Database passwords, service passwords, etc.

## File Naming Convention

Files containing sensitive information should follow this pattern:
- `*-deployment-info-*.txt` - Contains contract addresses (safe)
- `*-service-account-setup.txt` - Contains secret keys (NOT SAFE for git)
- `complete-deployment-summary-*.txt` - May contain secrets (NOT SAFE for git)

## Best Practices

1. **Use `.env` files** for local development (already in `.gitignore`)
2. **Use Supabase Edge Functions Secrets** for production credentials
3. **Use environment variable templates** (`.env.example`) without actual values
4. **Review files before committing** - check for `SC`, `SA`, or other secret patterns
5. **Rotate keys immediately** if accidentally committed

## If You Accidentally Commit Secrets

1. **Immediately rotate the exposed keys**
2. **Remove from git history** using `git filter-branch` or BFG Repo-Cleaner
3. **Update all systems** using the old key
4. **Review access logs** for unauthorized usage

## Current Secure Storage

- **Backend Service Account Secret**: Stored in Supabase Edge Functions Secrets
- **Contract Addresses**: Safe to document (public on-chain)
- **Environment Variables**: Use `.env` files (gitignored) or Supabase secrets

## Template Files

When creating deployment documentation:
- Use `[REDACTED]` or `[See Supabase Secrets]` for secret values
- Include instructions on where to find the actual values
- Never include actual secret keys in committed files
