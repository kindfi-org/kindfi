# Escrow Dispute System Manual Test

This document outlines manual testing procedures for the escrow dispute system.

## Prerequisites

### Environment Setup

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

### Environment Variables

1. Ensure you have a proper `.env.local` file in the `apps/web` directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=<your-wallet-connect-id>
   ```
   - The Supabase anon key can be found in the Supabase dashboard or output when running `supabase start`
   - For testing purposes, you can use a placeholder for the WalletConnect project ID if not testing wallet connections

2. If testing blockchain interactions, ensure these additional variables are set:
   ```
   NEXT_PUBLIC_CHAIN_ID=11155111  # Sepolia testnet
   NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=<testnet-contract-address>
   ```

### Test Data Requirements

1. You must have at least one existing escrow contract in the database to test the dispute features
   - If needed, use the demo IDs in `apps/web/lib/constants/demo-ids.ts` for testing
   - In development mode, the application will use these demo IDs automatically

2. You should be logged in with a user account that has permission to create and manage disputes
   - The test user should have the appropriate wallet address configured
   - For testing mediator features, you'll need a separate account with mediator permissions

## Test Cases

### 1. View Disputes List

1. Navigate to `/escrow/dispute`
2. Verify that the dispute list page loads correctly
   - **Expected UI**: A page with a header "Escrow Disputes", escrow selection buttons at the top, and a list of disputes below
   - **Expected State**: If no disputes exist, a message indicating "No disputes found" should be displayed
3. Verify that you can select different escrows to view their disputes
   - **Expected UI**: Clicking an escrow button should highlight it and update the disputes list below
   - **Expected State**: The URL should update with the selected escrow ID as a query parameter
4. Verify that the "Create Dispute" button is visible
   - **Expected UI**: A prominent button labeled "Create Dispute" should be visible, typically in the top-right corner or below the escrow selection

### 2. Create a New Dispute

1. Navigate to `/escrow/dispute/create` or click "Create Dispute" on the disputes list page
   - **Expected UI**: A form page with a header "Create Dispute" should load
   - **Expected State**: The form should include fields for escrow selection, reason, and optional evidence
2. Fill in the dispute form:
   - Escrow ID: Select from the dropdown or use the pre-selected value
   - Reason: "Service not delivered as promised"
   - (Optional) Evidence URL: "https://example.com/evidence"
   - **Expected UI**: All form fields should have proper validation with error messages for invalid inputs
   - **Expected State**: The submit button should be disabled until all required fields are filled
3. Click "Submit"
   - **Expected UI**: A loading indicator should appear while the request is processing
4. Verify that you are redirected to the dispute details page
   - **Expected UI**: You should be redirected to `/escrow/dispute/[new-dispute-id]`
   - **Expected State**: A success notification should briefly appear confirming the dispute was created
5. Verify that the dispute details show the correct information
   - **Expected UI**: The dispute details page should display the reason, status ("pending"), creation date, and any provided evidence
   - **Expected State**: The dispute ID in the URL should match the newly created dispute

### 3. View Dispute Details

1. Navigate to `/escrow/dispute/[id]` (using an ID from a previously created dispute)
   - **Expected UI**: The dispute details page should load with a header showing "Dispute Details" or the dispute ID
   - **Expected State**: The URL should contain the dispute ID you're viewing
2. Verify that the dispute details page loads correctly
   - **Expected UI**: The page should be organized in sections with dispute information at the top and evidence list below
   - **Expected State**: No loading errors should appear, and all data should be properly formatted
3. Verify that all dispute information is displayed correctly:
   - Dispute ID: Should match the ID in the URL
   - Status: Should show the current status (e.g., "pending", "in_review", "resolved")
   - Reason: Should display the full reason text
   - Created by: Should show the wallet address or username of the initiator
   - Created at: Should show the formatted date and time
   - **Expected UI**: Each field should be clearly labeled and formatted appropriately
   - **Expected State**: Status should have appropriate styling (color-coding) based on its value
4. Verify that the "Add Evidence" and "Resolve Dispute" buttons are visible (if applicable)
   - **Expected UI**: "Add Evidence" button should be visible to all parties
   - **Expected State**: "Resolve Dispute" button should only be visible to mediators or admins
   - **Expected State**: If the dispute is already resolved, these action buttons should be disabled or hidden

### 4. Add Evidence to a Dispute

1. Navigate to a dispute details page
   - **Prerequisite**: The dispute must be in a state that allows adding evidence (not resolved)
2. Click "Add Evidence"
   - **Expected UI**: A modal or form should appear with fields for evidence URL and description
   - **Expected State**: The form should be pre-populated with the dispute ID (hidden or displayed)
3. Fill in the evidence form:
   - Evidence URL: "https://example.com/new-evidence"
   - Description: "Screenshot of conversation"
   - **Expected UI**: Form fields should have validation with appropriate error messages
   - **Expected State**: The submit button should be disabled until all required fields are filled
4. Click "Submit"
   - **Expected UI**: A loading indicator should appear while the evidence is being submitted
   - **Expected State**: Form inputs should be disabled during submission
5. Verify that the evidence is added to the dispute
   - **Expected UI**: A success message should appear confirming the evidence was added
   - **Expected State**: The form should close or reset after successful submission
6. Verify that the evidence is displayed in the dispute details
   - **Expected UI**: The evidence list should update to include the new evidence with URL and description
   - **Expected State**: The evidence should show your user as the submitter and the current date/time

### 5. Resolve a Dispute

1. Navigate to a dispute details page
   - **Prerequisite**: You must have mediator or admin permissions to resolve disputes
   - **Prerequisite**: The dispute must be in a state that allows resolution (not already resolved)
2. Click "Resolve Dispute"
   - **Expected UI**: A modal or form should appear with fields for fund distribution and resolution notes
   - **Expected State**: The form should display the total escrow amount and validate that allocations sum to this amount
3. Fill in the resolution form:
   - Approver Funds: "50"
   - Service Provider Funds: "50"
   - Resolution: "Both parties agreed to split the funds"
   - **Expected UI**: Form fields should have validation with appropriate error messages
   - **Expected State**: The submit button should be disabled until all required fields are filled and allocations are valid
4. Click "Submit"
   - **Expected UI**: A loading indicator should appear while the resolution is being processed
   - **Expected State**: Form inputs should be disabled during submission
   - **Expected UI**: A confirmation dialog may appear asking you to confirm the resolution
5. Verify that the dispute status is updated to "resolved"
   - **Expected UI**: The status indicator should change to "resolved" with appropriate styling (usually green)
   - **Expected State**: The resolution timestamp should be updated to the current time
6. Verify that the resolution details are displayed in the dispute details
   - **Expected UI**: A resolution section should appear showing the fund distribution and resolution notes
   - **Expected State**: Action buttons like "Add Evidence" and "Resolve Dispute" should be disabled or hidden
   - **Expected State**: A transaction hash or link may be displayed if the resolution triggered an on-chain transaction

## API Testing

> **Note**: Replace placeholder values (like `<dispute-id>`) with actual values from your test database. All API responses include a `status` field with value `SUCCESS` or `ERROR`.

### 1. Create Dispute API

```bash
curl -X POST http://localhost:3000/api/escrow/dispute \
  -H "Content-Type: application/json" \
  -d '{"escrowId":"0x123abc","reason":"Service not delivered as promised","initiator":"user123"}'
```

Expected response:
```json
{
  "status": "SUCCESS",
  "dispute": {
    "id": "uuid-format-id",
    "escrowId": "0x123abc",
    "status": "pending",
    "reason": "Service not delivered as promised",
    "initiator": "user123",
    "createdAt": "2025-04-29T20:00:00.000Z",
    "updatedAt": "2025-04-29T20:00:00.000Z"
  }
}
```

### 2. Get Disputes API

```bash
# Replace <escrow-id> with an actual escrow contract ID
curl http://localhost:3000/api/escrow/dispute?escrowId=<escrow-id>
```

Expected response:
```json
{
  "status": "SUCCESS",
  "disputes": [
    {
      "id": "uuid-format-id",
      "escrowId": "0x123abc",
      "status": "pending",
      "reason": "Service not delivered as promised",
      "initiator": "user123",
      "createdAt": "2025-04-29T20:00:00.000Z",
      "updatedAt": "2025-04-29T20:00:00.000Z"
    }
  ]
}
```

### 3. Get Dispute Details API

```bash
# Replace <dispute-id> with an actual dispute ID
curl http://localhost:3000/api/escrow/dispute/<dispute-id>
```

Expected response:
```json
{
  "status": "SUCCESS",
  "dispute": {
    "id": "uuid-format-id",
    "escrowId": "0x123abc",
    "status": "pending",
    "reason": "Service not delivered as promised",
    "initiator": "user123",
    "createdAt": "2025-04-29T20:00:00.000Z",
    "updatedAt": "2025-04-29T20:00:00.000Z",
    "evidence": [
      {
        "id": "uuid-format-id",
        "escrowDisputeId": "uuid-format-id",
        "evidenceUrl": "https://example.com/evidence",
        "description": "Screenshot of conversation",
        "submittedBy": "user123",
        "createdAt": "2025-04-29T20:00:00.000Z"
      }
    ]
  }
}
```

### 4. Add Evidence API

```bash
# Replace <dispute-id> with an actual dispute ID
curl -X POST http://localhost:3000/api/escrow/dispute/<dispute-id>/evidence \
  -H "Content-Type: application/json" \
  -d '{"evidenceUrl":"https://example.com/evidence","description":"Screenshot of conversation","submittedBy":"user123"}'
```

Expected response:
```json
{
  "status": "SUCCESS",
  "evidence": {
    "id": "uuid-format-id",
    "escrowDisputeId": "uuid-format-id",
    "evidenceUrl": "https://example.com/evidence",
    "description": "Screenshot of conversation",
    "submittedBy": "user123",
    "createdAt": "2025-04-29T20:00:00.000Z"
  }
}
```

### 5. Resolve Dispute API

```bash
# Replace <dispute-id> with an actual dispute ID
curl -X POST http://localhost:3000/api/escrow/dispute/<dispute-id>/resolve \
  -H "Content-Type: application/json" \
  -d '{"approverFunds":"50","serviceProviderFunds":"50","resolution":"Both parties agreed to split the funds","mediatorAddress":"0xabc123"}'
```

Expected response:
```json
{
  "status": "SUCCESS",
  "dispute": {
    "id": "uuid-format-id",
    "escrowId": "0x123abc",
    "status": "resolved",
    "reason": "Service not delivered as promised",
    "initiator": "user123",
    "mediatorAddress": "0xabc123",
    "resolution": "Both parties agreed to split the funds",
    "createdAt": "2025-04-29T20:00:00.000Z",
    "updatedAt": "2025-04-29T20:00:00.000Z",
    "resolvedAt": "2025-04-29T20:10:00.000Z"
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
