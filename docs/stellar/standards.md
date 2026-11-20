# Stellar standards KindFi depends on

Status is **not** tracked here. Before relying on a row, confirm it with
[Stellar Raven](https://raven.stellar.org) (`claude mcp add --transport http stellar-raven "https://raven.stellar.org/mcp"`)
and the [stellar-dev-skill](https://github.com/stellar/stellar-dev-skill) `standards` skill
([skills.stellar.org](https://skills.stellar.org/)). Update the status column instead of copying this table.

SEP files: [stellar-protocol/ecosystem](https://github.com/stellar/stellar-protocol/tree/master/ecosystem).

| SEP | Why KindFi cares | Status | Where in the repo |
|-----|------------------|--------|-------------------|
| [SEP-1](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md) stellar.toml | Domain, org and asset discovery for wallets and explorers; needed for a real `home_domain` | confirm via Raven | `docs/stellar/stellar.toml` (not yet served) |
| [SEP-23](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0023.md) StrKey | Tell classic G-addresses from contract C-addresses; escrow signing is G-only | confirm via Raven | `docs/smart-account-suspension.md`, `apps/web/lib/smart-account/README.md` |
| [SEP-50](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0050.md) NFT metadata | `nft-kindfi` uses OpenZeppelin's non-fungible interface, closest to SEP-50; attributes follow its metadata JSON schema | confirm via Raven | `apps/contract/contracts/nft-kindfi/src/types.rs`, `apps/contract/contracts/reputation/src/nft_client.rs` |

## Deliberately not listed

- **SEP-41 (token interface):** no contract in `apps/contract` claims it. The only token-like contract is the NFT one.
- **SEP-10 (web auth):** not implemented. Login is WebAuthn plus NextAuth
  (`apps/web/hooks/passkey/use-passkey-auth.ts`), with no SEP-10 challenge flow.
- **SEP-55 (verified builds):** a later issue; it will point at `home_domain` once the domain serving SEP-1 is known.
