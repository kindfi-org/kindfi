# Chain data: RPC for recent state, indexer for payment history

- Contract simulation and current contract state use Stellar RPC (`simulateTransaction`, `getLedgerEntries`). `getLedgerEntries` reads live state: an entry does not become unreadable just because it was last updated more than seven days ago.
- `getEvents` has a configurable retention window. A `startLedger` older than the oldest retained ledger returns an error, not an empty page — so a missing page is never proof that nothing happened.
- Account payment history older than the RPC window is queried from the KindFi SubQuery indexer (`apps/indexer`, entities Payment / Credit / Debit / Transfer), not from `getEvents` pagination loops in the web app. No `getEvents` call exists in the web app today; do not add one.
- Hubble and Galexie are not wired and must not be added from the web app.
- A contract read that finds no value returns a typed `not_found` (`ContractReadResult` in `gamification-reads.ts`). Never substitute `0` for a missing score, balance, or count.
- An RPC failure returns a typed `error`, deliberately distinct from `not_found`. Issue #1135 step 2 asked for `not_found` on a failed RPC call, but that contract is not used: returning `not_found` would let write paths treat an RPC outage as a confirmed absence — quest sync, for example, could then create a duplicate definition for a quest that already exists. Callers must treat `error` as "unknown, retry or fail", never as "missing".
- Source: Stellar `data` skill (`stellar/stellar-dev-skill`, `skills/data/SKILL.md`, tracked in `skills-lock.json`), sections `getLedgerEntries`, `simulateTransaction`, `getEvents`, and "Historical Data Access".
