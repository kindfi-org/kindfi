import { AuthErrorType } from '../types/auth'

export const ERROR_MESSAGES: Record<AuthErrorType, string> = {
	[AuthErrorType.INVALID_CREDENTIALS]: 'Invalid email or password',
	[AuthErrorType.EMAIL_NOT_CONFIRMED]:
		'Please verify your email address before logging in',
	[AuthErrorType.INVALID_RESET_TOKEN]: 'Invalid or expired password reset link',
	[AuthErrorType.WEAK_PASSWORD]: 'Password must be at least 8 characters long',
	[AuthErrorType.EMAIL_TAKEN]: 'An account with this email already exists',
	[AuthErrorType.EXPIRED_CODE]:
		'The authentication link has expired. Please request a new one',
	[AuthErrorType.INVALID_CODE]:
		'Invalid authentication link. Please request a new one',
	[AuthErrorType.NO_CODE_PROVIDED]: 'Invalid authentication request',
	[AuthErrorType.SESSION_EXPIRED]:
		'Your session has expired. Please sign in again',
	[AuthErrorType.RATE_LIMIT_EXCEEDED]:
		'Too many attempts. Please try again later',
	[AuthErrorType.UNAUTHORIZED]: 'Unauthorized access',
	[AuthErrorType.SERVER_ERROR]:
		'An unexpected error occurred. Please try again later',
}
