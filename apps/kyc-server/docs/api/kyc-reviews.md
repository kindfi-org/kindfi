# KYC Reviews API

## Overview
The KYC Reviews API provides endpoints for managing KYC verification decisions and audit trails.

## Endpoints

### POST /api/kyc-reviews
Create a new KYC review.

**Request Body:**
```json
{
  "user_id": "string",
  "status": "pending | approved | rejected | verified",
  "verification_level": "basic | enhanced",
  "reviewer_id": "string (optional)",
  "notes": "string (optional)"
}