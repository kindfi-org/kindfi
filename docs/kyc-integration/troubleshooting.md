# Didit KYC Integration - Troubleshooting

## Common Issues and Solutions

### Issue 1: Status Shows "Not Started" After Verification

**Symptoms**: User completes verification but status badge still shows "Not Started"

**Possible Causes**:

1. Database update failed
2. RLS policy blocking query
3. Browser client not authenticated
4. Status not refreshing after callback

**Solutions**:

1. **Check Database**:

   ```sql
   SELECT * FROM kyc_reviews
   WHERE user_id = 'user-id-here'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

   Verify the record exists and has the correct status.

2. **Check Browser Console**:

   - Look for errors in `/api/kyc/status` calls
   - Check for RLS policy violations
   - Verify authentication tokens

3. **Check Server Logs**:

   - Look for "Successfully updated KYC status to: X" messages
   - Check for database update errors

4. **Verify RLS Policies**:

   ```sql
   SELECT * FROM pg_policies
   WHERE tablename = 'kyc_reviews';
   ```

   Ensure "User can view own KYC reviews" policy exists.

5. **Force Refresh**:
   - Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
   - Check if status updates after refresh

---

### Issue 2: Callback API Returns 401 Unauthorized

**Symptoms**: `/api/kyc/didit/callback` returns 401 error

**Possible Causes**:

1. NextAuth session expired
2. Session not properly passed to API route

**Solutions**:

1. **Check Session**:

   - Verify user is logged in
   - Check NextAuth session in browser
   - Ensure session token is valid

2. **Check API Route**:
   - Verify `getServerSession(nextAuthOption)` is called
   - Check that session validation happens before database operations

---

### Issue 3: Webhook Signature Verification Fails

**Symptoms**: Webhook requests return 401 Invalid signature

**Possible Causes**:

1. Wrong webhook secret key
2. Signature header missing
3. Timestamp mismatch

**Solutions**:

1. **Verify Webhook Secret**:

   ```bash
   echo $DIDIT_WEBHOOK_SECRET_KEY
   ```

   Ensure it matches Didit dashboard configuration

2. **Check Headers**:

   - Verify `X-Signature-V2` or `X-Signature-Simple` header exists
   - Verify `X-Timestamp` header exists
   - Check Didit webhook documentation for header format

3. **Test Webhook**:
   - Use Didit's webhook testing tool
   - Verify signature algorithm matches implementation

---

### Issue 4: Status Updates But UI Doesn't Refresh

**Symptoms**: Database has correct status but UI shows old status

**Possible Causes**:

1. Component not re-rendering
2. Hook not refreshing
3. Cache issues

**Solutions**:

1. **Check Hook**:

   - Verify `useDiditKYC` hook is polling
   - Check if `refreshStatus` is being called
   - Look for errors in hook execution

2. **Check Component**:

   - Verify `kycStatus` state is being used
   - Check if component re-renders on status change
   - Look for React warnings in console

3. **Force Refresh**:
   - Reload page manually
   - Check if status updates after reload

---

### Issue 5: Multiple KYC Records Created

**Symptoms**: Multiple `kyc_reviews` records for same user

**Possible Causes**:

1. User clicking button multiple times
2. Session creation called multiple times
3. No deduplication logic

**Solutions**:

1. **Prevent Double-Clicks**:

   - Button should be disabled during `isCreating` state
   - Add debouncing to prevent rapid clicks

2. **Check Existing Records**:

   ```sql
   SELECT COUNT(*) FROM kyc_reviews
   WHERE user_id = 'user-id-here';
   ```

   If multiple records exist, consider cleanup script

3. **Add Deduplication**:
   - Check for existing `pending` records before creating new one
   - Update existing record instead of creating new one

---

### Issue 6: RLS Policy Violations

**Symptoms**: Database queries fail with RLS policy errors

**Possible Causes**:

1. User not authenticated
2. `current_auth_user_id()` returning null
3. Policy conditions not met

**Solutions**:

1. **Check Authentication**:

   - Verify user is logged in
   - Check NextAuth session exists
   - Verify JWT token is valid

2. **Check Function**:

   ```sql
   SELECT public.current_auth_user_id();
   ```

   Should return user UUID, not null

3. **Use Service Role**:
   - For server-side operations, use service role client
   - Only after validating user via NextAuth
   - Document why service role is used

---

## Debugging Tips

### 1. Enable Debug Logging

Add console logs to track flow:

```typescript
console.log("🔄 Refreshing KYC status");
console.log("📊 Loaded KYC status:", { status, hasData: !!data });
console.log("✅ Successfully updated KYC status to:", kycStatus);
```

### 2. Check Network Tab

- Monitor API calls in browser DevTools
- Verify request/response payloads
- Check for CORS or authentication errors

### 3. Check Server Logs

- Look for database update confirmations
- Check for error messages
- Verify session validation

### 4. Database Queries

```sql
-- Check user's KYC records
SELECT id, user_id, status, notes, created_at, updated_at
FROM kyc_reviews
WHERE user_id = 'user-id-here'
ORDER BY created_at DESC;

-- Check RLS policies
SELECT * FROM pg_policies
WHERE tablename = 'kyc_reviews';

-- Test current_auth_user_id function
SELECT public.current_auth_user_id();
```

---

## Monitoring

### Key Metrics to Monitor

1. **Session Creation Success Rate**

   - Track `/api/kyc/didit/create-session` success/failure
   - Monitor Didit API response times

2. **Status Update Success Rate**

   - Track callback processing success
   - Monitor webhook delivery (if enabled)

3. **User Experience**
   - Time from click to redirect
   - Time from callback to status display
   - Error rates

### Logging Points

- Session creation (success/failure)
- Database updates (success/failure)
- Status refreshes
- Error occurrences
- Webhook deliveries (if enabled)

---

## Support Contacts

- **Didit Support**: [support@didit.me](mailto:support@didit.me)
- **Didit Documentation**: https://docs.didit.me
- **Internal Team**: Contact project leads for integration issues
