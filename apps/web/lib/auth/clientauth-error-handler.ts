import type { AuthError } from '@supabase/supabase-js'
import { ERROR_MESSAGES } from '../constants/error'
import { Logger } from '../logger'
import type { AuthResponse } from '../types/auth'

export function handleClientAuthError(error: AuthError): AuthResponse {
	const logger = new Logger()
	const errorKey = Object.keys(ERROR_MESSAGES).find((key) =>
		error.message.includes(key),
	) as keyof typeof ERROR_MESSAGES | undefined

	const message = errorKey
		? ERROR_MESSAGES[errorKey]
		: error.message || 'An unknown error occurred'
	logger.error({
		eventType: 'AUTH_ERROR',
		errorMessage: error.message,
		action: 'client_side_auth',
		timestamp: new Date().toISOString(),
	})
	// Also report to Sentry in production via the
	Logger

	return {
		success: false,
		message,
		error: message,
	}
}
