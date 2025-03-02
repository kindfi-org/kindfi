import { ERROR_MESSAGES, InAppError } from '../libs/passkey/errors'

/**
 * Helper function to handle errors consistently
 */
export const handleError = (error: unknown) => {
	console.error('Error:', error)

	if (error instanceof InAppError) {
		return Response.json({ error: ERROR_MESSAGES[error.code] }, { status: 500 })
	}

	return Response.json(
		{ error: 'An unexpected error occurred' },
		{ status: 500 },
	)
}
