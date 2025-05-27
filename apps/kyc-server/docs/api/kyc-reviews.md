# KYC Reviews API

## Overview
The KYC Reviews API provides endpoints for managing KYC verification decisions and maintaining audit trails for user verification processes.

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Base URL
```
/api/kyc-reviews
```

## Endpoints

### Create KYC Review
**POST** `/api/kyc-reviews`

Creates a new KYC review entry for tracking verification decisions.

#### Request Body
```json
{
  "user_id": "string",
  "status": "pending | approved | rejected | verified",
  "verification_level": "basic | enhanced",
  "reviewer_id": "string (optional)",
  "notes": "string (optional)"
}
```

#### Response
```json
{
  "id": "uuid",
  "user_id": "string",
  "status": "pending",
  "verification_level": "basic",
  "reviewer_id": "string",
  "notes": "string",
  "created_at": "2025-01-07T12:00:00Z",
  "updated_at": "2025-01-07T12:00:00Z"
}
```

#### Status Codes
- `201` - Created successfully
- `400` - Bad request (invalid input)
- `401` - Unauthorized
- `500` - Internal server error

### Get User KYC Reviews
**GET** `/api/kyc-reviews/user/:userId`

Retrieves all KYC reviews for a specific user, ordered by creation date (newest first).

#### Parameters
- `userId` (path) - The ID of the user

#### Response
```json
[
  {
    "id": "uuid",
    "user_id": "string",
    "status": "approved",
    "verification_level": "enhanced",
    "reviewer_id": "string",
    "notes": "string",
    "created_at": "2025-01-07T12:00:00Z",
    "updated_at": "2025-01-07T12:00:00Z"
  }
]
```

#### Status Codes
- `200` - Success
- `401` - Unauthorized
- `500` - Internal server error

### Get KYC Review by ID
**GET** `/api/kyc-reviews/:id`

Retrieves a specific KYC review by its ID.

#### Parameters
- `id` (path) - The UUID of the KYC review

#### Response
```json
{
  "id": "uuid",
  "user_id": "string",
  "status": "verified",
  "verification_level": "enhanced",
  "reviewer_id": "string",
  "notes": "string",
  "created_at": "2025-01-07T12:00:00Z",
  "updated_at": "2025-01-07T12:00:00Z"
}
```

#### Status Codes
- `200` - Success
- `401` - Unauthorized
- `404` - KYC review not found
- `500` - Internal server error

### Update KYC Review
**PATCH** `/api/kyc-reviews/:id`

Updates an existing KYC review. Only provided fields will be updated.

#### Parameters
- `id` (path) - The UUID of the KYC review to update

#### Request Body
```json
{
  "status": "pending | approved | rejected | verified (optional)",
  "verification_level": "basic | enhanced (optional)",
  "reviewer_id": "string (optional)",
  "notes": "string (optional)"
}
```

#### Response
```json
{
  "id": "uuid",
  "user_id": "string",
  "status": "approved",
  "verification_level": "enhanced",
  "reviewer_id": "string",
  "notes": "Updated notes",
  "created_at": "2025-01-07T12:00:00Z",
  "updated_at": "2025-01-07T12:05:00Z"
}
```

#### Status Codes
- `200` - Updated successfully
- `400` - Bad request (no valid fields provided)
- `401` - Unauthorized
- `404` - KYC review not found
- `500` - Internal server error

### Get Latest KYC Review
**GET** `/api/kyc-reviews/user/:userId/latest`

Retrieves the most recent KYC review for a specific user.

#### Parameters
- `userId` (path) - The ID of the user

#### Response
```json
{
  "id": "uuid",
  "user_id": "string",
  "status": "verified",
  "verification_level": "enhanced",
  "reviewer_id": "string",
  "notes": "string",
  "created_at": "2025-01-07T12:00:00Z",
  "updated_at": "2025-01-07T12:00:00Z"
}
```

#### Status Codes
- `200` - Success
- `401` - Unauthorized
- `404` - No KYC reviews found for user
- `500` - Internal server error

## Data Types

### KYC Status
- `pending` - Review is awaiting processing
- `approved` - KYC has been approved
- `rejected` - KYC has been rejected
- `verified` - KYC has been fully verified

### Verification Level
- `basic` - Basic level verification
- `enhanced` - Enhanced level verification with additional checks

## Error Response Format
All error responses follow this format:
```json
{
  "error": "Error message describing what went wrong"
}
```

## Examples

### Create a KYC Review
```bash
curl -X POST http://localhost:3001/api/kyc-reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "user_id": "user-123",
    "status": "pending",
    "verification_level": "basic",
    "notes": "Initial KYC review submission"
  }'
```

### Update KYC Review Status
```bash
curl -X PATCH http://localhost:3001/api/kyc-reviews/review-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "status": "approved",
    "notes": "Documents verified successfully"
  }'
```

### Get User's KYC History
```bash
curl -X GET http://localhost:3001/api/kyc-reviews/user/user-123 \
  -H "Authorization: Bearer your-token"
```