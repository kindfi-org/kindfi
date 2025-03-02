// Define custom error types and messages
export enum ErrorCode {
	UNKNOWN_ERROR = 'UNKNOWN_ERROR',
	VALIDATION_ERROR = 'VALIDATION_ERROR',
	SERVER_ERROR = 'SERVER_ERROR',
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
	[ErrorCode.UNKNOWN_ERROR]: 'An unknown error occurred',
	[ErrorCode.VALIDATION_ERROR]: 'Validation error',
	[ErrorCode.SERVER_ERROR]: 'Server error',
}

export class InAppError extends Error {
	code: ErrorCode

	constructor(code: ErrorCode, message?: string) {
		super(message || ERROR_MESSAGES[code])
		this.code = code
	}
}

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
