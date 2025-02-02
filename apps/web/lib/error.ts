export class AppError extends Error {
	public statusCode: number
	public details?: T

	constructor(message: string, statusCode: number, details?: any) {
		super(message)
		this.statusCode = statusCode
		this.details = details as T
		this.name = 'AppError'
	}
}

export interface AppErrorResponse<T = unknown> {
	error: string // A brief error message
	details?: T // Optional detailed information about the error
	statusCode?: number // Optional HTTP status code
}
