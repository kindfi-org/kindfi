/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
	async headers() {
		return [
			{
				source: '/:path*', // Apply security headers to all routes
				headers: [
					// Prevent Clickjacking attacks
					{
						key: 'X-Frame-Options',
						value: 'SAMEORIGIN', // Only allow iframes from the same origin
					},
					// Prevent MIME type sniffing
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					// Enforce HTTPS connections
					{
						key: 'Strict-Transport-Security',
						value: 'max-age=31536000; includeSubDomains; preload',
					},
					// Content Security Policy (CSP)
					{
						key: 'Content-Security-Policy',
						value: `
				default-src 'self'; // We might only accept content from one server IP/hostname
				script-src 'self' https://apis.google.com; // Only allow scripts from self and Google
				img-src 'self' data:;
				connect-src 'self' https://kyc.example.com https://api.example.com; // Allow API calls only to our API and KYC server
				frame-ancestors 'self'; // Prevents embedding in iframes from other domains
				upgrade-insecure-requests;
			  `.replace(/\s{2,}/g, ' '), // Remove extra spaces for compactness
					},
					// Referrer Policy
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin',
					},
					// Enforce XSS protection
					{
						key: 'X-XSS-Protection',
						value: '1; mode=block',
					},
				],
			},
		]
	},
}

module.exports = nextConfig
