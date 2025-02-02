import { ERROR_MESSAGES } from '../constants/error'
import type { AuthResponse } from '../types/auth'

export function handleClientAuthError(error: any): AuthResponse {
	const message =
		ERROR_MESSAGES[error.type as keyof typeof ERROR_MESSAGES] || error.message

	console.error('[Auth Error]', {
		eventType: 'AUTH_ERROR',
		errorType: error.type,
		action: 'client_side_auth',
		message: error.message,
		timestamp: new Date().toISOString(),
	})

	return {
		success: false,
		message,
		error: message,
	}
}
