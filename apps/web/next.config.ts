/**
 * @type {import('next').NextConfig}
 * 
 * This configuration sets security-related HTTP headers for all routes.
 * - '/:path*', // Apply security headers to all routes
 * - `X-Frame-Options`: Prevents Clickjacking attacks.
 * - 'SAMEORIGIN', // Only allow iframes from the same origin
 * - `X-Content-Type-Options`: Disables MIME type sniffing.
 * - `Strict-Transport-Security`: Enforces HTTPS connections.
 * - `Content-Security-Policy`: Controls allowed content sources.
 *        |
 *        |- connect-src 'self' https://kyc.example.com https://api.example.com; // Allow API calls only to our API and KYC server
 *        |- frame-ancestors 'self'; // Prevents embedding in iframes from other domains
 *        |- script-src 'self' https://apis.google.com; // Only allow scripts from self and Google
 * 
 * - `Referrer-Policy`: Restricts referrer information sharing.
 * - `X-XSS-Protection`: Enables browser XSS protection.
 */
const nextConfig = {
    async headers() {
      return [
        {
          source: '/:path*', 
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN', 
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains; preload',
            },
            {
              key: 'Content-Security-Policy',
              value: `
                default-src 'self';
                script-src 'self' https://apis.google.com;
                img-src 'self' data:;
                connect-src 'self' https://kyc.example.com https://api.example.com;
                frame-ancestors 'self';
                upgrade-insecure-requests;
              `.replace(/\s{2,}/g, ' '),
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
          ],
        },
      ];
    },
  };
  
  module.exports = nextConfig;
  
