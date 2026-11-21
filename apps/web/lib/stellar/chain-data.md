# Chain data: RPC for recent state, indexer for payment history

- Contract simulation and recent contract state use Stellar RPC (`simulateTransaction`, `getLedgerEntries`). Most RPC methods only cover about the last 7 days; `getEvents` older than that returns nothing.
- Account payment history older than the RPC window is queried from the KindFi SubQuery indexer (`apps/indexer`, entities Payment / Credit / Debit / Transfer), not from `getEvents` pagination loops in the web app. No `getEvents` call exists in the web app today; do not add one.
- Hubble and Galexie are not wired and must not be added from the web app.
- A contract read that finds no value returns a typed `not_found` (`ContractReadResult` in `gamification-reads.ts`). Never substitute `0` for a missing score, balance, or count.
- Source: Stellar `data` skill (`stellar/stellar-dev-skill`, `skills/data/SKILL.md`, tracked in `skills-lock.json`), sections `getLedgerEntries`, `simulateTransaction`, `getEvents`, and "Historical Data Access".
