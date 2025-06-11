# Notification Security Configuration

## HMAC Key Configuration

The notification system uses HMAC (Hash-based Message Authentication Code) to ensure the integrity of notification metadata. This is implemented through the `calculate_metadata_hash()` trigger function.

### Required Configuration

The HMAC key must be configured in your Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to Settings → Database → Variables
3. Add a new variable:
   - Name: `app.settings.metadata_hmac_key`
   - Value: A secure random string (recommended length: 32+ characters)

### Security Considerations

- The HMAC key should be a cryptographically secure random string
- Never commit the actual key to version control
- Rotate the key periodically (recommended: every 90 days)
- Use different keys for development and production environments

### Implementation Details

The HMAC hash is calculated using:

- Algorithm: SHA-256
- Input: JSON stringified metadata
- Key: `app.settings.metadata_hmac_key`
- Output: Hex-encoded hash

The hash is automatically calculated on:

- INSERT operations
- UPDATE operations that modify the metadata field

### Verification

You can verify the HMAC configuration is working by:

1. Creating a notification with metadata
2. Checking that the `metadata_hash` field is populated
3. Attempting to modify the metadata - the hash should update automatically
