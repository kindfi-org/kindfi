# Didit KYC Integration - User Flow

## Complete User Journey

### 1. Initial State

**User sees**: KYC Card showing "Not Started" status with "Start KYC Process" button.

**Database state**: No `kyc_reviews` record exists for user.

---

### 2. Starting Verification

**User action**: Clicks "Start KYC Process" button.

**What happens**:

1. `KYCCard` calls `createSession()` from `useDiditKYC` hook
2. Hook calls `POST /api/kyc/didit/create-session`
3. Server creates Didit session via Didit API
4. Server stores `session_id` and `session_token` in `kyc_reviews` table with status `pending`
5. Server returns `verification_url`
6. Client shows `KYCRedirectModal` with 3-second countdown
7. User can cancel or wait for auto-redirect

**Database state**: New `kyc_reviews` record created with:

- `status`: `pending`
- `notes`: Contains `diditSessionId` and `diditSessionToken`

---

### 3. Verification on Didit

**User action**: Completes verification steps on Didit.me website.

**What happens**:

1. User provides required documents/information
2. Didit processes verification
3. Didit determines status (Approved, Declined, In Review, etc.)

**Status possibilities**:

- **Approved**: Verification successful
- **Declined**: Verification failed
- **In Review**: Verification under manual review
- **In Progress**: Verification still in progress

---

### 4. Callback Redirect

**User action**: Didit redirects back to KindFi.

**Redirect URL**:

```
https://kindfi.org/profile?kyc=completed&status=Approved&verificationSessionId=xxx
```

**What happens**:

1. **Server-side (Profile Page)**:

   - Extracts `status` and `verificationSessionId` from URL params
   - Maps Didit status to internal enum (`Approved` → `approved`)
   - Finds KYC record by `verificationSessionId` in notes
   - Updates database with new status
   - Logs success message

2. **Client-side (Profile Dashboard)**:

   - Detects `kycCompleted` prop
   - Extracts status from URL params
   - Shows appropriate toast notification:
     - **Approved**: Success toast
     - **Declined**: Error toast
     - **In Review**: Info toast
   - Calls `POST /api/kyc/didit/callback` to ensure status is synced
   - Triggers page reload after callback completes

3. **After Reload**:
   - Fresh page load fetches latest status via `/api/kyc/status`
   - KYC Card displays correct status badge
   - Status message updates accordingly

---

### 5. Status Display

**Approved Status**:

- Badge: Green "Verified" badge with checkmark
- Message: "Your identity has been verified successfully"
- Button: Hidden (verification complete)

**Rejected Status**:

- Badge: Red "Rejected" badge
- Message: "Verification was rejected. Please review the requirements and try again."
- Button: "Retry Verification" button shown

**Pending Status**:

- Badge: Yellow "In Progress" badge
- Message: "Your verification is in progress. Please wait for review."
- Button: Hidden (verification in progress)

**Not Started Status**:

- Badge: Gray "Not Started" badge
- Message: "Complete verification to unlock all features and build trust with the community."
- Button: "Start KYC Process" button shown

---

## Alternative Flow: Webhook Updates

If webhooks are configured, status can also be updated via webhook:

1. Didit sends webhook event to `/api/kyc/didit/webhook`
2. Server verifies webhook signature (HMAC)
3. Server finds KYC record by `session_id`
4. Server updates status in database
5. Status is reflected on next page load or polling refresh

**Note**: Webhooks are useful for real-time updates, but the callback flow is the primary method.

---

## Error Scenarios

### 1. Session Creation Fails

**User sees**: Error toast notification

**What happens**:

- Error is logged to console
- User can retry by clicking button again
- No database record created

### 2. Callback Processing Fails

**User sees**: Generic completion toast

**What happens**:

- Error is logged to console
- Page still reloads
- Status may not update immediately
- Polling will catch update eventually

### 3. Status Not Updating

**Possible causes**:

- Database update failed
- RLS policy blocking query
- Browser client not authenticated

**Solution**:

- Check browser console for errors
- Verify RLS policies are applied
- Ensure user is authenticated
- Check `/api/kyc/status` endpoint response

---

## Testing Checklist

- [ ] User can start KYC process
- [ ] Redirect modal shows correctly
- [ ] User is redirected to Didit
- [ ] Callback URL contains correct parameters
- [ ] Status updates correctly after callback
- [ ] Correct badge displays for each status
- [ ] Toast notifications show appropriate messages
- [ ] Page reloads after callback
- [ ] Status persists after page reload
- [ ] Webhook updates work (if configured)
- [ ] Error states are handled gracefully
