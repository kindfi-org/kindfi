import { createSupabaseServerClient } from '@packages/lib/src/supabase/server-client'
import type { EmailOtpType } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { AuthErrorHandler } from '~/lib/auth/error-handler'
import { RateLimiter } from '~/lib/auth/rate-limiter'
import { Logger } from '~/lib/logger'

const logger = new Logger()
const errorHandler = new AuthErrorHandler(logger)
const rateLimiter = new RateLimiter()

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url)
	const tokenHash = searchParams.get('token_hash')
	const type = searchParams.get('type') as EmailOtpType | null
	const next = searchParams.get('next') ?? '/'

	logger.info({
		eventType: 'EMAIL_VERIFICATION_REQUEST',
		hasToken: !!tokenHash,
		type,
	})

	if (!tokenHash || !type) {
		logger.warn({
			eventType: 'INVALID_VERIFICATION_REQUEST',
			hasToken: !!tokenHash,
			hasType: !!type,
		})
		redirect('/error?reason=missing_parameters')
	}

	// Get client IP for rate limiting
	const headersList = await headers()
	const clientIp = headersList.get('x-forwarded-for') || 'unknown'

	// Check rate limiting
	const rateLimitResult = await rateLimiter.increment(clientIp, 'verifyOtp')
	if (rateLimitResult.isBlocked) {
		logger.warn({
			eventType: 'RATE_LIMIT_EXCEEDED',
			clientIp,
			action: 'verifyOtp',
		})
		const errorUrl = new URL('/error', request.url)
		errorUrl.searchParams.set('reason', 'rate_limit_exceeded')
		errorUrl.searchParams.set(
			'error',
			'Too many attempts. Please try again later.',
		)
		redirect(errorUrl.toString())
	}

	try {
		const supabase = await createSupabaseServerClient()
		const { error } = await supabase.auth.verifyOtp({
			type,
			token_hash: tokenHash,
		})

		if (error) {
			const response = errorHandler.handleAuthError(error, 'verifyOtp')

			logger.error({
				eventType: 'OTP_VERIFICATION_ERROR',
				errorMessage: response.error,
				type,
				clientIp,
				attemptsRemaining: rateLimitResult.attemptsRemaining,
			})

			// Add error to the redirect URL
			const errorUrl = new URL('/error', request.url)
			errorUrl.searchParams.set('reason', 'verification_failed')
			errorUrl.searchParams.set('error', response.error ?? 'unknown_error')
			redirect(errorUrl.toString())
		}

		// Reset rate limiting on success
		await rateLimiter.reset(clientIp, 'verifyOtp')

		logger.info({
			eventType: 'OTP_VERIFICATION_SUCCESS',
			type,
			clientIp,
		})

		redirect(next)
	} catch (error) {
		logger.error({
			eventType: 'UNEXPECTED_ERROR',
			error: error instanceof Error ? error.message : 'Unknown error',
			clientIp,
		})
		redirect('/error?reason=unexpected_error')
	}
}
