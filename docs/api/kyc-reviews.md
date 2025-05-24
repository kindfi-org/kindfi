# KYC Reviews API

## Overview
The KYC Reviews API provides endpoints to manage KYC verification decisions and maintain an audit trail.

## Endpoints

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