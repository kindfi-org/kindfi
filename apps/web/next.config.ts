import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import type { NextConfig } from 'next'

const appConfig: AppEnvInterface = appEnvConfig('web')
const isProduction = appConfig.env.nodeEnv === 'production'
const nextConfig: NextConfig = {
	experimental: {
		mdxRs: true,
	},
	serverExternalPackages: ['@packages/lib'],
	images: {
		remotePatterns: [
			{
				protocol: isProduction ? 'https' : 'http',
				hostname: new URL(appConfig.database.url).hostname || '127.0.0.1',
				port: appConfig.database.port || '54321',
				pathname: '/storage/v1/object/public/project_thumbnails/**',
			},
		],
	},
	async headers() {
		// Apply headers for both production and development
		const connectSrc = isProduction
			? `'self' https://flagcdn.com https://apis.google.com https://friendbot-futurenet.stellar.org https://www.google-analytics.com https://www.googletagmanager.com https://rpc-futurenet.stellar.org https://horizon-futurenet.stellar.org https://soroban-testnet.stellar.org https://horizon-testnet.stellar.org https://*.kindfi.org https://dev-api.dashboard.kindfi.org https://*.supabase.co https://*.vercel.app`
			: `'self' https://friendbot-futurenet.stellar.org http://localhost:* http://127.0.0.1:* https://localhost:* https://127.0.0.1:* https://flagcdn.com https://apis.google.com https://www.google-analytics.com https://www.googletagmanager.com https://rpc-futurenet.stellar.org https://horizon-futurenet.stellar.org https://soroban-testnet.stellar.org https://horizon-testnet.stellar.org https://*.kindfi.org https://dev-api.dashboard.kindfi.org https://*.supabase.co https://*.vercel.app`

		if (isProduction) {
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
                script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.googletagmanager.com;
                style-src 'self' 'unsafe-inline';
                img-src 'self' data: blob:;
                font-src 'self' data:;
                connect-src ${connectSrc};
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
		}
		// Apply more permissive headers for development
		return [
			{
				source: '/:path*',
				headers: [
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'Content-Security-Policy',
						value: `
                default-src 'self';
                script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.googletagmanager.com;
                style-src 'self' 'unsafe-inline';
                img-src 'self' data: blob:;
                font-src 'self' data:;
                connect-src ${connectSrc};
                frame-ancestors 'self';
              `.replace(/\s{2,}/g, ' '),
					},
				],
			},
		]
	},
}

module.exports = nextConfig
