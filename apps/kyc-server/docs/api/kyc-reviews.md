# KYC Reviews API

## Overview

The KYC Reviews API provides endpoints for managing KYC verification decisions and audit trails.

All endpoints require authentication via a valid Supabase JWT in the `Authorization` header.

---

## Endpoints

### POST `/api/kyc-reviews`

Create a new KYC review.

**Authentication:** Required

**Request Body:**

```json
{
  "user_id": "string",
  "status": "pending | approved | rejected | verified",
  "verification_level": "basic | enhanced",
  "reviewer_id": "string (optional)",
  "notes": "string (optional)"
}
```

**Response:**

```json
{
  "id": "string",
  "user_id": "string",
  "status": "pending | approved | rejected | verified",
  "verification_level": "basic | enhanced",
  "reviewer_id": "string | null",
  "notes": "string | null",
  "created_at": "string",
  "updated_at": "string"
}
```

**Error Response:**

```json
{
  "error": "Invalid request body or unauthorized"
}
```

---

### GET `/api/kyc-reviews/user/:userId`

Get all KYC reviews for a specific user.

**Authentication:** Required

**Response:**

```json
[
  {
    "id": "string",
    "user_id": "string",
    "status": "pending | approved | rejected | verified",
    "verification_level": "basic | enhanced",
    "reviewer_id": "string | null",
    "notes": "string | null",
    "created_at": "string",
    "updated_at": "string"
  }
]
```

**Error Response:**

```json
{
  "error": "User not found or unauthorized"
}
```

---

### GET `/api/kyc-reviews/:id`

Get a specific KYC review by ID.

**Authentication:** Required

**Response:**

```json
{
  "id": "string",
  "user_id": "string",
  "status": "pending | approved | rejected | verified",
  "verification_level": "basic | enhanced",
  "reviewer_id": "string | null",
  "notes": "string | null",
  "created_at": "string",
  "updated_at": "string"
}
```

**Error Response:**

```json
{
  "error": "Review not found or unauthorized"
}
```

---

### PATCH `/api/kyc-reviews/:id`

Update a KYC review by ID.

**Authentication:** Required

**Request Body:**

```json
{
  "status": "pending | approved | rejected | verified (optional)",
  "verification_level": "basic | enhanced (optional)",
  "reviewer_id": "string (optional)",
  "notes": "string (optional)"
}
```

**Response:**

```json
{
  "id": "string",
  "user_id": "string",
  "status": "pending | approved | rejected | verified",
  "verification_level": "basic | enhanced",
  "reviewer_id": "string | null",
  "notes": "string | null",
  "created_at": "string",
  "updated_at": "string"
}
```

**Error Response:**

```json
{
  "error": "Review not found, invalid update, or unauthorized"
}
```

---

### GET `/api/kyc-reviews/user/:userId/latest`

Get the latest KYC review for a user.

**Authentication:** Required

**Response:**

```json
{
  "id": "string",
  "user_id": "string",
  "status": "pending | approved | rejected | verified",
  "verification_level": "basic | enhanced",
  "reviewer_id": "string | null",
  "notes": "string | null",
  "created_at": "string",
  "updated_at": "string"
}
```

**Error Response:**

```json
{
  "error": "No reviews found for user or unauthorized"
}
```

---

## Notes

- All timestamps are ISO 8601 strings.
- Ensure requests include the `Authorization: Bearer <token>` header.
- Error responses follow a consistent `{ "error": "message" }` schema.
- Only authorized reviewers can create or update reviews.