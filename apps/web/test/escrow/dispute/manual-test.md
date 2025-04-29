# Escrow Dispute System Manual Test

This document outlines manual testing procedures for the escrow dispute system.

## Prerequisites

1. Make sure the Next.js application is running:
   ```bash
   cd apps/web
   bun run dev
   ```

2. Make sure Supabase is running and the migrations have been applied:
   ```bash
   cd services/supabase
   supabase start
   ```

## Test Cases

### 1. View Disputes List

1. Navigate to `/escrow/dispute`
2. Verify that the dispute list page loads correctly
3. Verify that you can select different escrows to view their disputes
4. Verify that the "Create Dispute" button is visible

### 2. Create a New Dispute

1. Navigate to `/escrow/dispute/create` or click "Create Dispute" on the disputes list page
2. Fill in the dispute form:
   - Reason: "Service not delivered as promised"
   - (Optional) Evidence URL: "https://example.com/evidence"
3. Click "Submit"
4. Verify that you are redirected to the dispute details page
5. Verify that the dispute details show the correct information

### 3. View Dispute Details

1. Navigate to `/escrow/dispute/[id]` (using an ID from a previously created dispute)
2. Verify that the dispute details page loads correctly
3. Verify that all dispute information is displayed correctly:
   - Dispute ID
   - Status
   - Reason
   - Created by
   - Created at
4. Verify that the "Add Evidence" and "Resolve Dispute" buttons are visible (if applicable)

### 4. Add Evidence to a Dispute

1. Navigate to a dispute details page
2. Click "Add Evidence"
3. Fill in the evidence form:
   - Evidence URL: "https://example.com/new-evidence"
   - Description: "Screenshot of conversation"
4. Click "Submit"
5. Verify that the evidence is added to the dispute
6. Verify that the evidence is displayed in the dispute details

### 5. Resolve a Dispute

1. Navigate to a dispute details page
2. Click "Resolve Dispute"
3. Fill in the resolution form:
   - Approver Funds: "50"
   - Service Provider Funds: "50"
   - Resolution: "Both parties agreed to split the funds"
4. Click "Submit"
5. Verify that the dispute status is updated to "resolved"
6. Verify that the resolution details are displayed in the dispute details

## API Testing

### 1. Create Dispute API

```bash
curl -X POST http://localhost:3000/api/escrow/dispute \
  -H "Content-Type: application/json" \
  -d '{"contractId":"0x123abc","signer":"user123","reason":"Service not delivered as promised"}'
```

Expected response:
```json
{
  "dispute": {
    "id": "...",
    "contractId": "0x123abc",
    "status": "pending",
    "reason": "Service not delivered as promised",
    "initiator": "user123",
    "createdAt": { ... },
    "updatedAt": { ... }
  }
}
```

### 2. Get Disputes API

```bash
curl http://localhost:3000/api/escrow/dispute?escrowId=123e4567-e89b-12d3-a456-426614174000
```

Expected response:
```json
{
  "disputes": [
    {
      "id": "...",
      "contractId": "...",
      "status": "...",
      "reason": "...",
      "initiator": "...",
      "createdAt": { ... },
      "updatedAt": { ... }
    }
  ]
}
```

### 3. Get Dispute Details API

```bash
curl http://localhost:3000/api/escrow/dispute/[dispute-id]
```

Expected response:
```json
{
  "dispute": {
    "id": "...",
    "contractId": "...",
    "status": "...",
    "reason": "...",
    "initiator": "...",
    "createdAt": { ... },
    "updatedAt": { ... },
    "evidence": [
      {
        "id": "...",
        "disputeId": "...",
        "evidenceUrl": "...",
        "description": "...",
        "submittedBy": "...",
        "createdAt": { ... }
      }
    ]
  }
}
```

### 4. Add Evidence API

```bash
curl -X POST http://localhost:3000/api/escrow/dispute/[dispute-id]/evidence \
  -H "Content-Type: application/json" \
  -d '{"evidenceUrl":"https://example.com/evidence","description":"Screenshot of conversation","submittedBy":"user123"}'
```

Expected response:
```json
{
  "evidence": {
    "id": "...",
    "disputeId": "...",
    "evidenceUrl": "https://example.com/evidence",
    "description": "Screenshot of conversation",
    "submittedBy": "user123",
    "createdAt": { ... }
  }
}
```

### 5. Resolve Dispute API

```bash
curl -X POST http://localhost:3000/api/escrow/dispute/[dispute-id]/resolve \
  -H "Content-Type: application/json" \
  -d '{"contractId":"0x123abc","disputeResolver":"resolver123","approverFunds":"50","serviceProviderFunds":"50","resolution":"Both parties agreed to split the funds"}'
```

Expected response:
```json
{
  "dispute": {
    "id": "...",
    "contractId": "...",
    "status": "resolved",
    "reason": "...",
    "initiator": "...",
    "mediatorAddress": "resolver123",
    "resolution": "Both parties agreed to split the funds",
    "createdAt": { ... },
    "updatedAt": { ... }
  }
}
```

## Database Verification

After running the tests, verify the database tables:

1. Check the `escrow_disputes` table:
   ```sql
   SELECT * FROM escrow_disputes;
   ```

2. Check the `escrow_dispute_evidences` table:
   ```sql
   SELECT * FROM escrow_dispute_evidences;
   ```

3. Check that the `dispute_flag` is set on the escrow contract:
   ```sql
   SELECT * FROM escrow_contracts WHERE id = '[contract-id]';
   ```
