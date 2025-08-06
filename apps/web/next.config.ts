import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import type { NextConfig } from 'next'

const appConfig: AppEnvInterface = appEnvConfig('web')
const isProduction = appConfig.env.nodeEnv === 'production'
const nextConfig: NextConfig = {
	serverExternalPackages: ['@packages/lib'],
	images: {
		remotePatterns: [
			{
				protocol: isProduction ? 'https' : 'http',
				hostname: appConfig.database.url || '127.0.0.1',
				port: appConfig.database.port || '54321',
				pathname: '/storage/v1/object/public/project_thumbnails/**',
			},
		],
	},
	async headers() {
		// Only apply strict headers in production
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
                script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com;
                style-src 'self' 'unsafe-inline';
                img-src 'self' data: blob:;
                font-src 'self' data:;
                connect-src 'self' https://flagcdn.com https://*.kindfi.org https://*.supabase.co https://*.vercel.app;
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
			// biome-ignore lint/style/noUselessElse:  no useless else[refactor]
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
