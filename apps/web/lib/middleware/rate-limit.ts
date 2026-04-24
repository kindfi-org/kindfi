import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { RateLimiter } from '~/lib/auth/rate-limiter'

export const RATE_LIMIT_PRESETS = {
	strict: { attempts: 3, window: 60, block: 3600 }, // Financial operations
	moderate: { attempts: 10, window: 60, block: 1800 }, // Content creation
	lenient: { attempts: 30, window: 60, block: 900 }, // Low-risk mutations
} as const

export type RateLimitPreset = keyof typeof RATE_LIMIT_PRESETS

export interface RateLimitConfig {
	preset?: RateLimitPreset
	identifier: (req: NextRequest) => string | Promise<string>
}

export function withRateLimit(
	config: RateLimitConfig,
	handler: (req: NextRequest) => Promise<NextResponse>,
) {
	return async (req: NextRequest): Promise<NextResponse> => {
		const preset = RATE_LIMIT_PRESETS[config.preset ?? 'moderate']
		const limiter = new RateLimiter()

		try {
			const id = await config.identifier(req)
			const result = await limiter.increment(id, req.nextUrl.pathname)

			if (result.isBlocked) {
				return NextResponse.json(
					{ error: 'Too many requests. Please try again later.' },
					{
						status: 429,
						headers: { 'Retry-After': preset.window.toString() },
					},
				)
			}
		} catch (err) {
			console.warn('[RateLimit] Redis unavailable, failing open:', err)
		}

		return handler(req)
	}
}
