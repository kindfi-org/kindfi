export type AuthErrorCode =
	| 'no_code'
	| 'invalid_code'
	| 'user_not_found'
	| 'session_expired'
	| 'invalid_credentials'
	| 'rate_limited'
	| 'unknown_error'

export interface AuthError {
	code: AuthErrorCode
	message: string
	statusCode: number
}

export const AUTH_ERRORS: Record<AuthErrorCode, AuthError> = {
	no_code: {
		code: 'no_code',
		message: 'No authentication code was provided',
		statusCode: 400,
	},
	invalid_code: {
		code: 'invalid_code',
		message: 'The authentication code is invalid or has expired',
		statusCode: 400,
	},
	user_not_found: {
		code: 'user_not_found',
		message: 'Account not found',
		statusCode: 404,
	},
	session_expired: {
		code: 'session_expired',
		message: 'Your session has expired',
		statusCode: 401,
	},
	invalid_credentials: {
		code: 'invalid_credentials',
		message: 'Invalid credentials provided',
		statusCode: 401,
	},
	rate_limited: {
		code: 'rate_limited',
		message: 'Too many attempts, please try again later',
		statusCode: 429,
	},
	unknown_error: {
		code: 'unknown_error',
		message: 'An unexpected error occurred',
		statusCode: 500,
	},
}
