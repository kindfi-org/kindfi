# Stellar standards in KindFi

Use the [Stellar Standards skill](https://github.com/stellar/stellar-dev-skill/tree/main/skills/standards) to find the relevant specification and [Stellar Raven](https://raven.stellar.org/) to confirm its current status.

| Standard | Status | Where KindFi uses it |
| --- | --- | --- |
| [SEP-1 · stellar.toml](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md) | confirm via Raven | The [source manifest](./stellar.toml) records organization metadata and the USDC issuers used on mainnet and testnet. The domain owner will publish it at `/.well-known/stellar.toml`. |
| [SEP-23 · StrKey](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0023.md) | confirm via Raven | [Wallet send](../../apps/web/lib/wallet-send/validation/destination.ts) validates G and muxed M destinations with StrKey and rejects C destinations. [Production escrow](../smart-account-suspension.md) signs with classic G-address wallets. |
| [SEP-50 · Non-fungible tokens](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0050.md) | confirm via Raven | The [KindFi NFT contract](../../apps/contract/contracts/nft-kindfi/src/lib.rs) implements OpenZeppelin's `NonFungibleToken` trait. SEP-50 is the relevant interface reference. |

[Passkey sign-in](../../apps/web/hooks/passkey/use-passkey-auth.ts) uses a WebAuthn challenge and creates a NextAuth session through its credentials provider.
