import { AuthErrorHandler } from '~/lib/auth/error-handler'
import { Logger } from '~/lib/logger'

export function useAuthErrorHandler() {
	const logger = new Logger()
	const errorHandler = new AuthErrorHandler(logger)
	return {
		logger,
		errorHandler,
	}
}

