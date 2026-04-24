import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { AuthError } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { AuthErrorHandler } from '~/lib/auth/error-handler'
import { isValidRedirectUrl } from '~/lib/config/validate-url'
import { Logger } from '~/lib/logger'
import { authCallbackQuerySchema } from '~/lib/schemas/auth.schemas'
import { validateRequest } from '~/lib/utils/validation'

const logger = new Logger()
const errorHandler = new AuthErrorHandler(logger)
export async function GET(request: NextRequest) {
	const requestUrl = new URL(request.url)
	const queryData = {
		code: requestUrl.searchParams.get('code') ?? undefined,
		redirect: requestUrl.searchParams.get('redirect') ?? '',
	}

	logger.info({
		eventType: 'AUTH_CALLBACK_REQUEST',
		url: requestUrl.toString(),
		redirectUrl: queryData.redirect,
		hasCode: !!queryData.code,
	})

	const validation = validateRequest(authCallbackQuerySchema, queryData)
	if (!validation.success) {
		return validation.response
	}
	const { code, redirect: redirectUrl } = validation.data

	// If redirect URL is invalid (not in allowed domains), return a JSON error
	if (!isValidRedirectUrl(redirectUrl)) {
		logger.warn({
			eventType: 'INVALID_REDIRECT_URL',
			redirectUrl,
		})
		return NextResponse.json({ error: 'Invalid redirect URL' }, { status: 400 })
	}

	// Exchange the code for a Supabase session if provided
	if (code) {
		try {
			const supabase = await createSupabaseServerClient()
			await supabase.auth.exchangeCodeForSession(code)

			logger.info({
				eventType: 'CODE_EXCHANGE_SUCCESS',
			})
		} catch (error) {
			const response = errorHandler.handleAuthError(
				error as AuthError,
				'exchangeCodeForSession',
			)

			// Add error parameters to the redirect URL
			const finalRedirectUrl = new URL(redirectUrl)
			finalRedirectUrl.searchParams.set(
				'error',
				response.error ?? 'unknown_error',
			)

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
