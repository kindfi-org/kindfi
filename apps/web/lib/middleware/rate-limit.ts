/**
 * @file rate-limit.ts
 * @description Route-level rate limiting middleware for Next.js API routes.
 *
 * ## Presets
 *
 * | Preset     | Requests / min | Block duration | Use case                              |
 * |------------|---------------|----------------|---------------------------------------|
 * | `strict`   | 3             | 60 min         | Financial & identity-sensitive routes |
 * | `moderate` | 10            | 30 min         | Content creation routes               |
 * | `lenient`  | 30            | 15 min         | Low-risk mutation routes              |
 *
 * ## Redis key format
 *
 * ```
 * rate_limit:<pathname>:<preset>:<identifier>
 * rate_limit_block:<pathname>:<preset>:<identifier>
 * ```
 *
 * Where `identifier` is the authenticated user ID when available, or the
 * client IP address (`x-forwarded-for` header), falling back to `"anonymous"`.
 *
 * ## Redis unavailability
 *
 * When Upstash Redis is unreachable the limiter **fails open**: requests are
 * allowed through and a warning is emitted via the logger. This prevents Redis
 * outages from taking down API routes.
 *
 * ## Response headers
 *
 * Successful (non-blocked) responses include:
 * - `X-RateLimit-Remaining` — number of requests remaining in the current window.
 *
 * Blocked responses include:
 * - HTTP `429 Too Many Requests`
 * - `Retry-After` — seconds until the block expires.
 *
 * ## Protected routes
 *
 * ### High priority — `strict` (3 req/min, 1 h block)
 * - `POST /api/escrow/fund`
 * - `POST /api/escrow/initialize`
 * - `POST /api/escrow/dispute`
 * - `POST /api/escrow/review`
 * - `POST /api/escrow/sign-and-submit`
 * - `POST /api/contributions/create`
 * - `POST /api/governance/vote`
 * - `POST /api/kyc/didit/create-session`
 *
 * ### Medium priority — `moderate` (10 req/min, 30 min block)
 * - `POST /api/comments`
 * - `POST /api/foundations/create`
 * - `POST /api/projects/create`
 * - `POST /api/notifications/push`
 *
 * ### Previously protected
 * - `POST /api/nfts/mint` (strict)
 * - `POST /api/nfts/evolve` (strict)
 * - `GET  /api/auth/confirm` (manual RateLimiter)
 * - `POST /api/quests/progress` (strict)
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
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
		const limiter = new RateLimiter({
			maxAttempts: preset.attempts,
			windowSecs: preset.window,
			blockSecs: preset.block,
			configId: config.preset ?? 'moderate',
		})

		try {
			const id = await config.identifier(req)
			const result = await limiter.increment(id, req.nextUrl.pathname)

			if (result.isBlocked) {
				return NextResponse.json(
					{ error: 'Too many requests. Please try again later.' },
					{
						status: 429,
						headers: { 'Retry-After': preset.block.toString() },
					},
				)
			}

			const response = await handler(req)
			response.headers.set('X-RateLimit-Remaining', String(result.attemptsRemaining ?? 0))
			return response
		} catch (err) {
			logger.warn('[RateLimit] Redis unavailable, failing open:', err)
		}

		return handler(req)
	}
}
