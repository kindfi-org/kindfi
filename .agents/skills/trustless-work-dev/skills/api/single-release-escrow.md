# Single-Release Escrow

Single-release escrows release all funds in one payment after all milestones are completed and approved.

## When to Use

- Fixed-price projects
- All-or-nothing payment structure
- Simple milestone tracking
- Projects where partial payments aren't needed

## API Headers

All endpoints require these headers:

| Name | Value |
|------|-------|
| `Content-Type` | `application/json` |
| `x-api-key` | `<your_api_key>` |

**Note:** Use `x-api-key` header (not `Authorization: Bearer`).

## Deploy Escrow

**Endpoint:** `POST /deployer/single-release`

### Request Schema

```typescript
interface SingleReleaseContract {
  signer: string;                    // Entity that signs the transaction that deploys and initializes the escrow
  engagementId: string;               // Unique identifier for the escrow
  title: string;                      // Name of the escrow
  description: string;                // Text describing the function of the escrow
  roles: {
    approver: string;                 // Address of the entity requiring the service
    serviceProvider: string;           // Address of the entity providing the service
    platformAddress: string;          // Address of the entity that owns the escrow
    releaseSigner: string;            // Address of the user in charge of releasing the escrow funds to the service provider
    disputeResolver: string;          // Address in charge of resolving disputes within the escrow
    receiver: string;                 // Address where escrow proceeds will be sent to
  };
  amount: number;                     // Amount to be transferred upon completion of escrow milestones
  platformFee: number;               // Commission that the platform will receive when the escrow is completed
  milestones: {
    description: string;               // Text describing the function of the milestone
    // Note: Do NOT include "approvedFlag" or "status" when deploying
  }[];
  trustline: {
    address: string;                  // Public address establishing permission to accept and use a specific token
    symbol: string;                   // Official abbreviation representing the token (e.g., "USDC", "EURC")
  };
}
```

### Required Fields

- `signer` (required)
- `engagementId` (required)
- `title` (required)
- `description` (required)
- `roles` (required)
- `amount` (required)
- `platformFee` (required)
- `milestones` (required)
- `trustline` (required)

### Constraints

- Amount cannot be zero
- Platform fee cannot exceed 99%
- Cannot define more than 50 milestones in an escrow
- All flags (approved, disputed, released) must be false when deploying
- Escrow must have at least one milestone

### Example Request

```json
{
  "signer": "GABC1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "engagementId": "project-123",
  "title": "Website Development",
  "description": "Build a responsive website with 3 pages",
  "roles": {
    "approver": "GGHI7890123456789012345678901234567890123",
    "serviceProvider": "GDEF4567890123456789012345678901234567890",
    "platformAddress": "GPLT1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "releaseSigner": "GGHI7890123456789012345678901234567890123",
    "disputeResolver": "GJKL0123456789012345678901234567890123456",
    "receiver": "GDEF4567890123456789012345678901234567890"
  },
  "amount": 5000,
  "platformFee": 100,
  "milestones": [
    {
      "description": "Design mockups"
    },
    {
      "description": "Frontend development"
    },
    {
      "description": "Backend integration"
    },
    {
      "description": "Testing and deployment"
    }
  ],
  "trustline": {
    "address": "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
    "symbol": "USDC"
  }
}
```

### Response

Returns unsigned XDR transaction:

```json
{
  "unsignedTransaction": "AAAAAgAAAAD..."
}
```

### Errors

- `400`: Amount cannot be zero
- `400`: Escrow already initialized
- `400`: The platform fee cannot exceed 99%
- `400`: Escrow initialized without milestone
- `400`: Cannot define more than 50 milestones in an escrow
- `400`: All flags (approved, disputed, released) must be false in order to execute this function
- `401`: Unauthorized access
- `429`: Too many requests
- `500`: An unexpected error occurred

### Complete Example

```typescript
import axios from "axios";

const http = axios.create({
  baseURL: "https://api.trustlesswork.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": your_api_key,
  },
});

export const deployEscrow = async () => {
  // Get the signer address
  const { address } = await kit.getAddress();

  // Execute the endpoint
  const response = await http.post(
    "/deployer/single-release",
    {
      signer: address,
      engagementId: "project-123",
      title: "Website Development",
      description: "Build responsive website",
      roles: {
        approver: approverAddress,
        serviceProvider: serviceProviderAddress,
        platformAddress: platformAddress,
        releaseSigner: releaseSignerAddress,
        disputeResolver: disputeResolverAddress,
        receiver: serviceProviderAddress,
      },
      amount: 5000,
      platformFee: 100,
      milestones: [
        { description: "Design mockups" },
        { description: "Frontend development" },
        { description: "Backend integration" },
      ],
      trustline: {
        address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
        symbol: "USDC",
      },
    }
  );

  // Get the unsigned transaction hash
  const { unsignedTransaction } = response.data;

  // Sign the transaction by wallet
  const { signedTxXdr } = await signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  // Send the transaction to Stellar Network
  const tx = await http.post("/helper/send-transaction", {
    signedXdr: signedTxXdr,
  });

  const { data } = tx;
  return data;
};
```

## Fund Escrow

**Endpoint:** `POST /escrow/single-release/fund-escrow`

Deposit funds into an existing escrow contract.

### Request Schema

```typescript
interface FundEscrow {
  contractId: string;  // ID (address) that identifies the escrow contract
  signer: string;      // Entity that signs the transaction that deploys and initializes the escrow
  amount: string;      // Amount to transfer to the escrow contract
}
```

### Required Fields

- `contractId` (required)
- `signer` (required)
- `amount` (required)

### Constraints

- Amount cannot be equal to or less than zero
- The provided escrow properties must match the stored escrow

### Example Request

```json
{
  "contractId": "CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "signer": "GABC1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "amount": "5000"
}
```

### Response

Returns unsigned XDR transaction:

```json
{
  "unsignedTransaction": "AAAAAgAAAAD..."
}
```

### Errors

- `400`: Amount cannot be equal to or less than zero
- `400`: The provided escrow properties do not match the stored escrow
- `401`: Unauthorized access
- `429`: Too many requests
- `500`: An unexpected error occurred

### Complete Example

```typescript
import axios from "axios";

const http = axios.create({
  baseURL: "https://api.trustlesswork.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": your_api_key,
  },
});

export const fundEscrow = async (contractId: string, amount: string) => {
  const { address } = await kit.getAddress();

  const response = await http.post("/escrow/single-release/fund-escrow", {
    contractId,
    signer: address,
    amount,
  });

  const { unsignedTransaction } = response.data;

  const { signedTxXdr } = await signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  const tx = await http.post("/helper/send-transaction", {
    signedXdr: signedTxXdr,
  });

  return tx.data;
};
```

## Change Milestone Status

**Endpoint:** `POST /escrow/single-release/change-milestone-status`

Service Provider updates the status and evidence of a milestone.

### Request Schema

```typescript
interface ChangeMilestoneStatus {
  contractId: string;      // ID (address) that identifies the escrow contract
  milestoneIndex: string;   // Position that identifies the milestone within the group of milestones in the escrow
  newStatus: string;        // New value for the status property within the escrow milestone
  newEvidence: string;      // New value for the evidence property within the escrow milestone
  serviceProvider: string;  // Address of the entity providing the service
}
```

### Required Fields

- `contractId` (required)
- `milestoneIndex` (required)
- `newStatus` (required)
- `newEvidence` (required)
- `serviceProvider` (required)

### Example Request

```json
{
  "contractId": "CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "milestoneIndex": "0",
  "newStatus": "In Progress",
  "newEvidence": "https://example.com/proof-of-work.pdf",
  "serviceProvider": "GDEF4567890123456789012345678901234567890"
}
```

### Response

Returns unsigned XDR transaction:

```json
{
  "unsignedTransaction": "AAAAAgAAAAD..."
}
```

### Errors

- `400`: Escrow not found
- `400`: Only the service provider can change milestone status
- `400`: Invalid milestone index
- `400`: Escrow initialized without milestone
- `401`: Unauthorized access
- `429`: Too many requests
- `500`: An unexpected error occurred

### Complete Example

```typescript
import axios from "axios";

const http = axios.create({
  baseURL: "https://api.trustlesswork.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": your_api_key,
  },
});

export const changeMilestoneStatus = async (
  contractId: string,
  milestoneIndex: string,
  newStatus: string,
  newEvidence: string
) => {
  const { address } = await kit.getAddress();

  const response = await http.post(
    "/escrow/single-release/change-milestone-status",
    {
      contractId,
      milestoneIndex,
      newStatus,
      newEvidence,
      serviceProvider: address,
    }
  );

  const { unsignedTransaction } = response.data;

  const { signedTxXdr } = await signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  const tx = await http.post("/helper/send-transaction", {
    signedXdr: signedTxXdr,
  });

  return tx.data;
};
```

## Approve Milestone

**Endpoint:** `POST /escrow/single-release/approve-milestone`

Approver approves a milestone. In single-release, all milestones must be approved before release.

### Request Schema

```typescript
interface ApproveMilestone {
  contractId: string;      // ID (address) that identifies the escrow contract
  milestoneIndex: string;  // Position that identifies the milestone within the group of milestones in the escrow
  approver: string;        // Address of the entity requiring the service
}
```

### Required Fields

- `contractId` (required)
- `milestoneIndex` (required)
- `approver` (required)

### Example Request

```json
{
  "contractId": "CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "milestoneIndex": "0",
  "approver": "GGHI7890123456789012345678901234567890123"
}
```

### Response

Returns unsigned XDR transaction:

```json
{
  "unsignedTransaction": "AAAAAgAAAAD..."
}
```

### Errors

- `400`: Escrow not found
- `400`: Only the approver can change milestone flag
- `400`: You cannot approve a milestone that has already been approved previously
- `400`: The milestone status cannot be empty
- `400`: Escrow initialized without milestone
- `400`: Invalid milestone index
- `401`: Unauthorized access
- `429`: Too many requests
- `500`: An unexpected error occurred

### Complete Example

```typescript
import axios from "axios";

const http = axios.create({
  baseURL: "https://api.trustlesswork.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": your_api_key,
  },
});

export const approveMilestone = async (
  contractId: string,
  milestoneIndex: string
) => {
  const { address } = await kit.getAddress();

  const response = await http.post(
    "/escrow/single-release/approve-milestone",
    {
      contractId,
      milestoneIndex,
      approver: address,
    }
  );

  const { unsignedTransaction } = response.data;

  const { signedTxXdr } = await signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  const tx = await http.post("/helper/send-transaction", {
    signedXdr: signedTxXdr,
  });

  return tx.data;
};
```

## Release Funds

**Endpoint:** `POST /escrow/single-release/release-funds`

Releases all funds after all milestones are approved.

### Request Schema

```typescript
interface ReleaseFunds {
  contractId: string;      // ID (address) that identifies the escrow contract
  releaseSigner: string;  // Address of the user in charge of releasing the escrow funds to the receiver
}
```

### Required Fields

- `contractId` (required)
- `releaseSigner` (required)

### Example Request

```json
{
  "contractId": "CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "releaseSigner": "GGHI7890123456789012345678901234567890123"
}
```

### Response

Returns unsigned XDR transaction:

```json
{
  "unsignedTransaction": "AAAAAgAAAAD..."
}
```

### Errors

- `400`: The escrow funds have been released
- `400`: This escrow is already resolved
- `400`: Only the release signer can release the escrow earnings
- `400`: Escrow initialized without milestone
- `400`: The escrow must be completed to release earnings
- `400`: Escrow has been opened for dispute resolution
- `400`: Escrow not found
- `401`: Unauthorized access
- `429`: Too many requests
- `500`: An unexpected error occurred

### Complete Example

```typescript
import axios from "axios";

const http = axios.create({
  baseURL: "https://api.trustlesswork.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": your_api_key,
  },
});

export const releaseFunds = async (contractId: string) => {
  const { address } = await kit.getAddress();

  const response = await http.post("/escrow/single-release/release-funds", {
    contractId,
    releaseSigner: address,
  });

  const { unsignedTransaction } = response.data;

  const { signedTxXdr } = await signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  const tx = await http.post("/helper/send-transaction", {
    signedXdr: signedTxXdr,
  });

  return tx.data;
};
```

## Dispute Escrow

**Endpoint:** `POST /escrow/single-release/dispute-escrow`

Any party can initiate a dispute for the entire escrow.

### Request Schema

```typescript
interface DisputeEscrow {
  contractId: string;  // ID (address) that identifies the escrow contract
  signer: string;      // Entity that signs the transaction that deploys and initializes the escrow
}
```

### Required Fields

- `contractId` (required)
- `signer` (required)

### Example Request

```json
{
  "contractId": "CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "signer": "GABC1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
}
```

### Response

Returns unsigned XDR transaction:

```json
{
  "unsignedTransaction": "AAAAAgAAAAD..."
}
```

### Errors

- `400`: Escrow not found
- `400`: Escrow already in dispute
- `400`: You are not authorized to change the dispute flag
- `400`: The dispute resolver cannot dispute the escrow
- `401`: Unauthorized access
- `429`: Too many requests
- `500`: An unexpected error occurred

### Complete Example

```typescript
import axios from "axios";

const http = axios.create({
  baseURL: "https://api.trustlesswork.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": your_api_key,
  },
});

export const disputeEscrow = async (contractId: string) => {
  const { address } = await kit.getAddress();

  const response = await http.post(
    "/escrow/single-release/dispute-escrow",
    {
      contractId,
      signer: address,
    }
  );

  const { unsignedTransaction } = response.data;

  const { signedTxXdr } = await signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  const tx = await http.post("/helper/send-transaction", {
    signedXdr: signedTxXdr,
  });

  return tx.data;
};
```

## Resolve Dispute

**Endpoint:** `POST /escrow/single-release/resolve-dispute`

Dispute Resolver decides how to distribute funds by providing distributions.

### Request Schema

```typescript
interface ResolveDispute {
  contractId: string;        // ID (address) that identifies the escrow contract
  disputeResolver: string;    // Address of the user defined to resolve disputes in an escrow
  distributions: [string, string][];  // Array of distributions detailing address and amount to allocate when resolving the dispute. Amounts should sum the remaining escrow funds (post-fees).
}
```

### Distributions Format

Distributions is an array of tuples: `[address, amount]`

```typescript
distributions: [
  ["GDEF4567890123456789012345678901234567890", "4000"],
  ["GABC1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", "900"]
]
```

### Required Fields

- `contractId` (required)
- `disputeResolver` (required)
- `distributions` (required)

### Constraints

- None of the amounts to be transferred should be less or equal than 0
- The sum of distributions must equal the current escrow balance when resolving an escrow dispute
- The total amount to be distributed cannot be equal to zero

### Example Request

```json
{
  "contractId": "CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "disputeResolver": "GJKL0123456789012345678901234567890123456",
  "distributions": [
    ["GDEF4567890123456789012345678901234567890", "4000"],
    ["GABC1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", "900"]
  ]
}
```

### Response

Returns unsigned XDR transaction:

```json
{
  "unsignedTransaction": "AAAAAgAAAAD..."
}
```

### Errors

- `400`: Only the dispute resolver can execute this function
- `400`: None of the amounts to be transferred should be less or equal than 0
- `400`: Escrow not in dispute
- `400`: Insufficient funds for resolution
- `400`: The sum of distributions must equal the current escrow balance when resolving an escrow dispute
- `400`: The total amount to be distributed cannot be equal to zero
- `400`: Escrow not found
- `401`: Unauthorized access
- `429`: Too many requests
- `500`: An unexpected error occurred

### Complete Example

```typescript
import axios from "axios";

const http = axios.create({
  baseURL: "https://api.trustlesswork.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": your_api_key,
  },
});

export const resolveDispute = async (
  contractId: string,
  distributions: [string, string][]
) => {
  const { address } = await kit.getAddress();

  const response = await http.post(
    "/escrow/single-release/resolve-dispute",
    {
      contractId,
      disputeResolver: address,
      distributions,
    }
  );

  const { unsignedTransaction } = response.data;

  const { signedTxXdr } = await signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  const tx = await http.post("/helper/send-transaction", {
    signedXdr: signedTxXdr,
  });

  return tx.data;
};
```

## Update Escrow

**Endpoint:** `PUT /escrow/single-release/update-escrow`

Update escrow properties. **Only the platform address can execute this endpoint.**

### Requirements

1. Only the entity with the platform role has permissions to execute this endpoint
2. If an escrow has funds, the only thing the platform can do is add more milestones. The other properties cannot be modified under any circumstances.

### Request Schema

```typescript
interface UpdateSingleReleaseEscrow {
  signer: string;      // Entity that signs the transaction that deploys and initializes the escrow
  contractId: string;  // ID (address) that identifies the escrow contract
  escrow: {
    engagementId: string;
    title: string;
    description: string;
    roles: {
      approver: string;
      serviceProvider: string;
      platformAddress: string;
      releaseSigner: string;
      disputeResolver: string;
      receiver: string;
    };
    amount: number;
    platformFee: number;
    milestones: {
      description: string;
      status?: string;      // Milestone status. Ex: Approved, In dispute, etc...
      approved?: boolean;    // Flag indicating whether a milestone has been approved by the approver
    }[];
    flags?: {
      disputed?: boolean;   // Flag indicating that an escrow is in dispute
      released?: boolean;    // Flag indicating that escrow funds have already been released
      resolved?: boolean;    // Flag indicating that a disputed escrow has already been resolved
    };
    isActive?: boolean;      // Flag indicating whether the escrow is active or not at the database level
    receiverMemo?: number;   // Field used to identify the recipient's address in transactions through an intermediary account
    trustline: {
      address: string;       // Public address establishing permission to accept and use a specific token
    };
  };
}
```

### Required Fields

- `signer` (required)
- `contractId` (required)
- `escrow` (required)

### Constraints

- Only the platform address should be able to execute this function
- The platform address of the escrow cannot be changed
- Escrow has been opened for dispute resolution (cannot update)
- All flags (approved, disputed, released) must be false in order to execute this function
- The platform fee cannot exceed 99%
- Amount cannot be equal to or less than zero
- Cannot define more than 50 milestones in an escrow
- You can't change the escrow properties after the milestone is approved
- If escrow has funds, only milestones can be added

### Example Request

```json
{
  "signer": "GPLT1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "contractId": "CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "escrow": {
    "engagementId": "project-123",
    "title": "Updated Website Development",
    "description": "Updated description",
    "roles": {
      "approver": "GGHI7890123456789012345678901234567890123",
      "serviceProvider": "GDEF4567890123456789012345678901234567890",
      "platformAddress": "GPLT1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      "releaseSigner": "GGHI7890123456789012345678901234567890123",
      "disputeResolver": "GJKL0123456789012345678901234567890123456",
      "receiver": "GDEF4567890123456789012345678901234567890"
    },
    "amount": 5000,
    "platformFee": 100,
    "milestones": [
      {
        "description": "Design mockups",
        "status": "pending",
        "approved": false
      },
      {
        "description": "Frontend development",
        "status": "pending",
        "approved": false
      }
    ],
    "flags": {
      "disputed": false,
      "released": false,
      "resolved": false
    },
    "isActive": true,
    "receiverMemo": 0,
    "trustline": {
      "address": "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA"
    }
  }
}
```

### Response

Returns unsigned XDR transaction:

```json
{
  "unsignedTransaction": "AAAAAgAAAAD..."
}
```

### Errors

- `400`: Escrow not found
- `400`: The platform fee cannot exceed 99%
- `400`: Amount cannot be equal to or less than zero
- `400`: Escrow initialized without milestone
- `400`: Cannot define more than 50 milestones in an escrow
- `400`: Only the platform address should be able to execute this function
- `400`: The platform address of the escrow cannot be changed
- `400`: Escrow has been opened for dispute resolution
- `400`: All flags (approved, disputed, released) must be false in order to execute this function
- `400`: The provided escrow properties do not match the stored escrow
- `400`: You can't change the escrow properties after the milestone is approved
- `401`: Unauthorized access
- `429`: Too many requests
- `500`: An unexpected error occurred

### Complete Example

```typescript
import axios from "axios";

const http = axios.create({
  baseURL: "https://api.trustlesswork.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": your_api_key,
  },
});

export const updateEscrow = async (
  contractId: string,
  escrowData: UpdateEscrowData
) => {
  const { address } = await kit.getAddress();

  const response = await http.put(
    "/escrow/single-release/update-escrow",
    {
      signer: address,
      contractId,
      escrow: escrowData,
    }
  );

  const { unsignedTransaction } = response.data;

  const { signedTxXdr } = await signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  const tx = await http.post("/helper/send-transaction", {
    signedXdr: signedTxXdr,
  });

  return tx.data;
};
```

## Complete Workflow Example

```typescript
import axios from "axios";

const http = axios.create({
  baseURL: "https://api.trustlesswork.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.TRUSTLESS_WORK_API_KEY,
  },
});

async function singleReleaseWorkflow() {
  const { address } = await kit.getAddress();

  // 1. Deploy escrow
  const deployResponse = await http.post("/deployer/single-release", {
    signer: address,
    engagementId: "project-123",
    title: "Website Development",
    description: "Build responsive website",
    roles: {
      approver: approverAddress,
      serviceProvider: serviceProviderAddress,
      platformAddress: platformAddress,
      releaseSigner: releaseSignerAddress,
      disputeResolver: disputeResolverAddress,
      receiver: serviceProviderAddress,
    },
    amount: 5000,
    platformFee: 100,
    milestones: [
      { description: "Design mockups" },
      { description: "Frontend development" },
      { description: "Backend integration" },
      { description: "Testing and deployment" },
    ],
    trustline: {
      address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
      symbol: "USDC",
    },
  });

  const { unsignedTransaction: deployXdr } = deployResponse.data;
  const { signedTxXdr: signedDeployXdr } = await signTransaction(deployXdr, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  const deployTx = await http.post("/helper/send-transaction", {
    signedXdr: signedDeployXdr,
  });

  const contractId = deployTx.data.contractId; // Extract from response

  // 2. Fund escrow
  const fundResponse = await http.post("/escrow/single-release/fund-escrow", {
    contractId,
    signer: address,
    amount: "5000",
  });

  const { unsignedTransaction: fundXdr } = fundResponse.data;
  const { signedTxXdr: signedFundXdr } = await signTransaction(fundXdr, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  await http.post("/helper/send-transaction", {
    signedXdr: signedFundXdr,
  });

  // 3. Complete milestones (service provider)
  for (let i = 0; i < 4; i++) {
    const completeResponse = await http.post(
      "/escrow/single-release/change-milestone-status",
      {
        contractId,
        milestoneIndex: i.toString(),
        newStatus: "Completed",
        newEvidence: `https://example.com/milestone-${i}-proof.pdf`,
        serviceProvider: serviceProviderAddress,
      }
    );

    const { unsignedTransaction: completeXdr } = completeResponse.data;
    const { signedTxXdr: signedCompleteXdr } = await signTransaction(
      completeXdr,
      {
        address: serviceProviderAddress,
        networkPassphrase: WalletNetwork.TESTNET,
      }
    );

    await http.post("/helper/send-transaction", {
      signedXdr: signedCompleteXdr,
    });
  }

  // 4. Approve milestones (approver)
  for (let i = 0; i < 4; i++) {
    const approveResponse = await http.post(
      "/escrow/single-release/approve-milestone",
      {
        contractId,
        milestoneIndex: i.toString(),
        approver: approverAddress,
      }
    );

    const { unsignedTransaction: approveXdr } = approveResponse.data;
    const { signedTxXdr: signedApproveXdr } = await signTransaction(
      approveXdr,
      {
        address: approverAddress,
        networkPassphrase: WalletNetwork.TESTNET,
      }
    );

    await http.post("/helper/send-transaction", {
      signedXdr: signedApproveXdr,
    });
  }

  // 5. Release escrow (all funds released at once)
  const releaseResponse = await http.post(
    "/escrow/single-release/release-funds",
    {
      contractId,
      releaseSigner: releaseSignerAddress,
    }
  );

  const { unsignedTransaction: releaseXdr } = releaseResponse.data;
  const { signedTxXdr: signedReleaseXdr } = await signTransaction(releaseXdr, {
    address: releaseSignerAddress,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  await http.post("/helper/send-transaction", {
    signedXdr: signedReleaseXdr,
  });
}
```

## Query Escrow Status

Use helper endpoints to check escrow status:

```typescript
// Get escrow by contract ID
const response = await http.get(
  `/helper/get-escrow-by-contract-ids?contractIds=${contractId}&validateOnChain=true`,
  {
    headers: {
      "x-api-key": your_api_key,
    },
  }
);

const escrows = await response.data;
```

## Key Differences from Multi-Release

- **Single payment**: All funds released at once after all milestones approved
- **No partial releases**: Cannot release funds per milestone
- **Simpler workflow**: Complete all → Approve all → Release once
- **Amount field**: Single `amount` field (not per-milestone)
- **Receiver**: Single receiver for entire escrow (not per-milestone)

## Common Patterns

### Using Axios

```typescript
import axios from "axios";

const http = axios.create({
  baseURL: "https://api.trustlesswork.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": your_api_key,
  },
});
```

### Transaction Flow

```typescript
// 1. Call endpoint
const response = await http.post("/endpoint", payload);

// 2. Get unsigned transaction
const { unsignedTransaction } = response.data;

// 3. Sign transaction
const { signedTxXdr } = await signTransaction(unsignedTransaction, {
  address,
  networkPassphrase: WalletNetwork.TESTNET,
});

// 4. Send transaction
const tx = await http.post("/helper/send-transaction", {
  signedXdr: signedTxXdr,
});

// 5. Handle response
const { data } = tx;
```
