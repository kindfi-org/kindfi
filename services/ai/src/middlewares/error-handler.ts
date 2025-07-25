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
export function errorHandler(err, _req, res, _next?) {
	console.error(err.stack)
	res.status(500).json({
		message: 'An error occurred',
		error: err.message,
	})
}
