import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createClient } from '~/lib/supabase/server'
import { isValidRedirectUrl } from '~/lib/config/validate-url'
import { AuthError } from '@supabase/supabase-js'
import { Logger } from '~/lib/logger'
import { AuthErrorHandler } from '~/lib/auth/error-handler'


const logger = new Logger()
const errorHandler = new AuthErrorHandler(logger)
export async function GET(request: NextRequest) {
	const requestUrl = new URL(request.url)
	const code = requestUrl.searchParams.get('code')
	const redirectUrl = requestUrl.searchParams.get('redirect')

	logger.info({
		eventType: 'AUTH_CALLBACK_REQUEST',
		url: requestUrl.toString(),
		redirectUrl,
		hasCode: !!code,
	})

	// If redirect URL is missing or invalid, return a JSON error
	if (!redirectUrl || !isValidRedirectUrl(redirectUrl)) {
		logger.warn({
			eventType: 'INVALID_REDIRECT_URL',
			redirectUrl,
		})
		return NextResponse.json({ error: 'Invalid redirect URL' }, { status: 400 })
	}

	// Exchange the code for a Supabase session if provided
	if (code) {
		try {
			const supabase = await createClient()
			await supabase.auth.exchangeCodeForSession(code)

			logger.info({
				eventType: 'CODE_EXCHANGE_SUCCESS',
			})
		} catch (error) {
			const response = errorHandler.handleAuthError(
				error as AuthError,
				'exchangeCodeForSession'
			)

			// Add error parameters to the redirect URL
			const finalRedirectUrl = new URL(redirectUrl)
			finalRedirectUrl.searchParams.set('error', response.error ?? 'unknown_error')

			// Redirect with error parameters
			logger.info({
				eventType: 'AUTH_ERROR_REDIRECT',
				redirectUrl: finalRedirectUrl.toString(),
				errorMessage: response.error,
			})
			return NextResponse.redirect(finalRedirectUrl)
		}
	}

	// Redirect to the validated URL
	logger.info({
		eventType: 'SUCCESSFUL_REDIRECT',
		redirectUrl,
	})
	return NextResponse.redirect(redirectUrl)
}