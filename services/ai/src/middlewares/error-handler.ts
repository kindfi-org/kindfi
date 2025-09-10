/**
 * Middleware function to handle errors in the application.
 *
 * @param {Error} err - The error object.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {Function} [next] - The next middleware function in the stack (optional).
 *
 * @returns {void}
 */
export function errorHandler(
	err: Error,
	_req: Request,
	res: Response,
	_next?: Function,
): void {
	console.error('Error details:', {
		message: err.message,
		stack: err.stack,
		name: err.name,
		cause: err.cause,
	})

	// Handle specific Buffer serialization errors
	if (err.message.includes('Buffer') || err.message.includes('serializ')) {
		res.status(400).json({
			message: 'Data serialization error - check Buffer handling',
			error: err.message,
			hint: 'Ensure Buffers are properly converted to/from base64 strings for JSON transport',
		})
		return
	}

	res.status(500).json({
		message: 'An error occurred',
		error: err.message,
	})
}
