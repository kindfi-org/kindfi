import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthErrorHandler } from '~/lib/auth/error-handler'
import { ERROR_MESSAGES } from '~/lib/constants/error'
import type { Logger } from '~/lib/logger'
import { AuthErrorType } from '~/lib/types/auth'

interface AuthCallbackParams {
	code: string | null
	redirectTo: string | null
	logger: Logger
	errorHandler: AuthErrorHandler
	supabase: SupabaseClient
	defaultRedirect?: string
	onError?: (error: string) => void
}

interface AuthCallbackResult {
	success: boolean
	redirectPath: string
	error?: string
}

export async function useAuthCallback({
	code,
	redirectTo,
	logger,
	errorHandler,
	supabase,
	defaultRedirect = '/dashboard',
	onError,
}: AuthCallbackParams): Promise<AuthCallbackResult> {
	if (!code) {
		const error = ERROR_MESSAGES[AuthErrorType.NO_CODE_PROVIDED]
		logger.warn({
			eventType: 'AUTH_CALLBACK_ERROR',
			errorType: AuthErrorType.NO_CODE_PROVIDED,
			timestamp: new Date().toISOString(),
		})

		onError?.(error)
		return {
			success: false,
			redirectPath: '/sign-in',
			error,
		}
	}

	try {
		const { error: authError } =
			await supabase.auth.exchangeCodeForSession(code)

		if (authError) {
			const errorResponse = errorHandler.handleAuthError(
				authError,
				'AUTH_CALLBACK',
			)
			onError?.(errorResponse.message)
			return {
				success: false,
				redirectPath: '/sign-in',
				error: errorResponse.message,
			}
		}

		return {
			success: true,
			redirectPath: redirectTo || defaultRedirect,
		}
	} catch (error: any) {
		const serverError = ERROR_MESSAGES[AuthErrorType.SERVER_ERROR]
		logger.error({
			eventType: 'AUTH_CALLBACK_ERROR',
			errorType: AuthErrorType.SERVER_ERROR,
			error: error.message,
			timestamp: new Date().toISOString(),
		})

		onError?.(serverError)
		return {
			success: false,
			redirectPath: '/sign-in',
			error: serverError,
		}
	}
}
