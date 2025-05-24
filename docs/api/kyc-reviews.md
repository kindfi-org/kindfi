# KYC Reviews API

## Overview
The KYC Reviews API provides endpoints to manage KYC verification decisions and maintain an audit trail.

## Endpoints

---

### POST /api/kyc-reviews
Create a new KYC review.

**Request Body:**
```json
{
  "user_id": "string",
  "status": "pending" | "approved" | "rejected" | "verified",
  "verification_level": "basic" | "enhanced",
  "reviewer_id": "string (optional)",
  "notes": "string (optional)"
}
```

**Response:**
```json
{
  "id": "string",
  "user_id": "string",
  "status": "pending" | "approved" | "rejected" | "verified",
  "verification_level": "basic" | "enhanced",
  "reviewer_id": "string (nullable)",
  "notes": "string (nullable)",
  "created_at": "ISO8601 timestamp"
}
```

**Error Example:**
```json
{
  "error": "Missing required field: user_id"
}
```

---

### GET /api/kyc-reviews/user/:userId
Retrieve all KYC reviews for a specific user.

**Path Parameter:**
- `userId` (string): The user's unique identifier.

**Response:**
```json
[
  {
    "id": "string",
    "user_id": "string",
    "status": "pending" | "approved" | "rejected" | "verified",
    "verification_level": "basic" | "enhanced",
    "reviewer_id": "string (nullable)",
    "notes": "string (nullable)",
    "created_at": "ISO8601 timestamp"
  }
]
```

**Error Example:**
```json
{
  "error": "User not found"
}
```

---

### GET /api/kyc-reviews/:reviewId
Retrieve a specific KYC review by its ID.

**Path Parameter:**
- `reviewId` (string): The review's unique identifier.

**Response:**
```json
{
  "id": "string",
  "user_id": "string",
  "status": "pending" | "approved" | "rejected" | "verified",
  "verification_level": "basic" | "enhanced",
  "reviewer_id": "string (nullable)",
  "notes": "string (nullable)",
  "created_at": "ISO8601 timestamp"
}
```

**Error Example:**
```json
{
  "error": "Review not found"
}
```

---

### PUT /api/kyc-reviews/:reviewId
Update an existing KYC review.

**Path Parameter:**
- `reviewId` (string): The review's unique identifier.

**Request Body:**
```json
{
  "status": "pending" | "approved" | "rejected" | "verified",
  "verification_level": "basic" | "enhanced",
  "reviewer_id": "string (optional)",
  "notes": "string (optional)"
}
```

**Response:**
```json
{
  "id": "string",
  "user_id": "string",
  "status": "pending" | "approved" | "rejected" | "verified",
  "verification_level": "basic" | "enhanced",
  "reviewer_id": "string (nullable)",
  "notes": "string (nullable)",
  "created_at": "ISO8601 timestamp",
  "updated_at": "ISO8601 timestamp"
}
```

**Error Example:**
```json
{
  "error": "Review not found or update failed"
}
```

---

### GET /api/kyc-reviews/status/:status
Retrieve all KYC reviews by status.

**Path Parameter:**
- `status` (string): One of `"pending"`, `"approved"`, `"rejected"`, `"verified"`.

**Response:**
```json
[
  {
    "id": "string",
    "user_id": "string",
    "status": "pending" | "approved" | "rejected" | "verified",
    "verification_level": "basic" | "enhanced",
    "reviewer_id": "string (nullable)",
    "notes": "string (nullable)",
    "created_at": "ISO8601 timestamp"
  }
]
```

**Error Example:**
```json
{
  "error": "Invalid status value"
}
```