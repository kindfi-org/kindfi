# Audit Logging — Escrow and NFT Operations

Structured audit logging for all mutation operations in the KindFi escrow and NFT subsystems. Logs are emitted as structured JSON to `console.info` and persisted to the `audit_logs` Supabase table.

## Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `correlation_id` | TEXT | Unique ID linking related log entries |
| `operation` | TEXT | Operation name (e.g., `escrow.initialize`) |
| `resource_type` | TEXT | Resource category (`escrow`, `transaction`, `milestone`, `dispute`, `nft`) |
| `resource_id` | TEXT | ID of the affected resource (nullable) |
| `actor_id` | TEXT | User or masked address performing the action (nullable) |
| `status` | TEXT | `initiated`, `success`, `failure`, or `validation_error` |
| `metadata` | JSONB | Operation-specific data (amounts, hashes, tiers, etc.) |
| `error_code` | TEXT | HTTP status code or error identifier on failure |
| `duration_ms` | INTEGER | Wall-clock duration of the operation |
| `created_at` | TIMESTAMPTZ | Auto-set by database |

## Operations Covered

| Operation | Resource Type | Route |
|-----------|---------------|-------|
| `escrow.initialize` | `escrow` | `POST /api/escrow/initialize` |
| `escrow.fund` | `transaction` | `POST /api/escrow/fund` |
| `escrow.fund.update` | `transaction` | `POST /api/escrow/fund/[transactionHash]` |
| `escrow.review` | `milestone` | `POST /api/escrow/review` |
| `escrow.sign_and_submit` | `escrow` | `POST /api/escrow/sign-and-submit` |
| `escrow.dispute.create` | `dispute` | `POST /api/escrow/dispute` |
| `escrow.dispute.sign` | `dispute` | `POST /api/escrow/dispute/sign` |
| `escrow.dispute.resolve` | `dispute` | `POST /api/escrow/dispute/resolve` |
| `escrow.dispute.assign_mediator` | `dispute` | `POST /api/escrow/dispute/assign` |
| `nft.mint` | `nft` | `POST /api/nfts/mint` |
| `nft.evolve` | `nft` | `POST /api/nfts/evolve` |

## PII Handling

- **Wallet/Stellar addresses** — always masked via `AuditLogger.maskAddress()` → `"GABC***WXYZ"`
- **User UUIDs** — safe to use as `actorId` (pseudonymous, not PII)
- **Contract addresses, transaction hashes, amounts** — safe to include in metadata
- **IP addresses, emails, names** — never included in audit logs

## Usage

```typescript
import { AuditLogger } from '~/lib/services/audit-logger'
import { generateUniqueId } from '~/lib/utils/id'

const auditLogger = new AuditLogger()
const correlationId = generateUniqueId('audit-')
const startTime = Date.now()

// On success
await auditLogger.log({
  correlationId,
  operation: 'escrow.initialize',
  resourceType: 'escrow',
  resourceId: escrowId,
  actorId: userId,
  status: 'success',
  durationMs: Date.now() - startTime,
  metadata: { contractAddress },
})

// On failure (in catch block)
await auditLogger.log({
  correlationId,
  operation: 'escrow.initialize',
  resourceType: 'escrow',
  status: 'failure',
  errorCode: '500',
  durationMs: Date.now() - startTime,
  metadata: { error: error.message },
})
```

## Querying Examples

```sql
-- All failed operations in the last 24 hours
SELECT * FROM audit_logs
WHERE status = 'failure'
  AND created_at > now() - interval '24 hours'
ORDER BY created_at DESC;

-- Trace all events for a specific correlation ID
SELECT * FROM audit_logs
WHERE correlation_id = 'audit-1711324800-a1b2c3d4'
ORDER BY created_at;

-- Escrow operations by a specific actor
SELECT operation, status, duration_ms, created_at
FROM audit_logs
WHERE actor_id = 'user-uuid-here'
  AND resource_type = 'escrow'
ORDER BY created_at DESC;

-- Average duration per operation type
SELECT operation, AVG(duration_ms) AS avg_ms, COUNT(*) AS total
FROM audit_logs
WHERE status = 'success'
GROUP BY operation
ORDER BY avg_ms DESC;
```

## Design Decisions

- **Never throws** — the `AuditLogger.log()` method catches all DB errors to avoid disrupting the main request flow
- **Console + DB** — always emits to `console.info` (observable in logs) even if DB write fails
- **No middleware** — each route instruments audit logging inline because metadata varies per operation
- **Correlation IDs** — generated per-request using `generateUniqueId('audit-')`, not propagated via AsyncLocalStorage
