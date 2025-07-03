import { appEnvConfig } from '@packages/lib/config'
import type { NextConfig } from 'next'

const appConfig = appEnvConfig('web')

const nextConfig: NextConfig = {
	// Add runtime configuration for environment variables
	env: {
		// Only expose specific variables to the client
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		NEXT_PUBLIC_SUPABASE_SERVICE_KEY:
			process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
		NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
		NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
	},

	async headers() {
		// Only apply strict headers in production
		if (appConfig.env.nodeEnv === 'production') {
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
                script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com;
                style-src 'self' 'unsafe-inline';
                img-src 'self' data: blob:;
                font-src 'self' data:;
                connect-src 'self' https://kyc.example.com https://api.example.com ${appConfig.database.url} https://*.vercel.app;
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
			]
			// biome-ignore lint/style/noUselessElse: <explanation>
		} else {
			// Return minimal headers for development
			return [
				{
					source: '/:path*',
					headers: [
						{
							key: 'X-Content-Type-Options',
							value: 'nosniff',
						},
					],
				},
			]
		}
	},
}

module.exports = nextConfig
