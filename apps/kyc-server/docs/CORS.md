# CORS Configuration

This document explains how to configure Cross-Origin Resource Sharing (CORS) for the Passkey Authentication API.

## Overview

CORS is a security feature implemented by browsers that restricts web pages from making requests to a different domain than the one that served the original page. The API includes a configurable CORS middleware that allows you to control which origins can access your API.

## Configuration Options

The CORS middleware can be configured with the following options:

- **allowedOrigins**: Array of allowed origins or `'*'` for wildcard
- **allowedMethods**: HTTP methods to allow (default: `['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']`)
- **allowedHeaders**: HTTP headers to allow (default: `['Content-Type', 'Authorization']`)
- **maxAge**: Cache duration for preflight requests in seconds (default: `86400` - 24 hours)

## Configuration Methods

### 1. Environment Variables

The simplest way to configure CORS is through the `ALLOWED_ORIGINS` environment variable in your `.env` file:

```
# Comma-separated list of allowed origins (no spaces)
ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
```

In development mode, you can use a wildcard to allow all origins:

```
ALLOWED_ORIGINS=*
```

### 2. Modifying the Configuration File

For more advanced configuration, you can modify the `src/config/cors.ts` file:

```typescript
export const corsConfig: CorsOptions = {
  // Set allowed origins
  allowedOrigins: [
    "https://app.example.com",
    "https://admin.example.com",
    "*.example.com", // Wildcard subdomains
  ],

  // HTTP methods allowed
  allowedMethods: ["GET", "POST", "OPTIONS"],

  // HTTP headers allowed
  allowedHeaders: ["Content-Type", "Authorization", "X-Custom-Header"],

  // Cache duration for preflight requests in seconds
  maxAge: 3600, // 1 hour
};
```

## Wildcard Subdomain Support

The CORS middleware supports wildcard subdomains. For example, `*.example.com` will match:

- `app.example.com`
- `admin.example.com`
- `api.example.com`

But will not match:

- `example.com` (no subdomain)
- `app.other-domain.com` (different domain)

## Security Considerations

- Using `'*'` (wildcard) for allowed origins is convenient for development but not recommended for production environments
- Only allow origins that need to access your API
- Consider using environment-specific configurations (development vs. production)
