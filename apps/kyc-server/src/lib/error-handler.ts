import { ERROR_MESSAGES, InAppError } from '@packages/lib/stellar'

/**
 * Helper function to handle errors consistently
 */
export const handleError = (error: unknown) => {
	if (error instanceof InAppError) {
		return Response.json({ error: ERROR_MESSAGES[error.code] }, { status: 500 })
	}

	return Response.json(
		{ error: (error as Error).message || 'An unexpected error occurred' },
		{ status: 500 },
	)
}
