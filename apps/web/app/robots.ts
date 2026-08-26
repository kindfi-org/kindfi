import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kindfi.org'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: [
					'/api/',
					'/admin/',
					'/sign-in',
					'/sign-up',
					'/reset-password',
					'/otp-validation',
					'/passkey-registration',
					'/reset-account',
					'/profile',
					'/create-project',
					'/create-foundation',
				],
			},
			// Allow Google's AI Overview crawler
			{
				userAgent: 'Google-Extended',
				allow: '/',
				disallow: [
					'/api/',
					'/admin/',
					'/sign-in',
					'/sign-up',
					'/reset-password',
					'/otp-validation',
					'/passkey-registration',
					'/reset-account',
					'/profile',
					'/create-project',
					'/create-foundation',
				],
			},
			// Allow OpenAI's crawler for ChatGPT search
			{
				userAgent: 'GPTBot',
				allow: '/',
				disallow: ['/api/', '/admin/', '/profile'],
			},
			// Allow Perplexity AI crawler
			{
				userAgent: 'PerplexityBot',
				allow: '/',
				disallow: ['/api/', '/admin/', '/profile'],
			},
			// Allow Anthropic's Claude crawler
			{
				userAgent: 'ClaudeBot',
				allow: '/',
				disallow: ['/api/', '/admin/', '/profile'],
			},
			// Allow anthropic-ai crawler
			{
				userAgent: 'anthropic-ai',
				allow: '/',
				disallow: ['/api/', '/admin/', '/profile'],
			},
			// Allow Bing/Copilot crawler
			{
				userAgent: 'Bingbot',
				allow: '/',
				disallow: ['/api/', '/admin/', '/profile'],
			},
		],
		sitemap: `${BASE_URL}/sitemap.xml`,
		host: BASE_URL,
	}
}
