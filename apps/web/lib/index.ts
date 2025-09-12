import { Logger } from './logger'

// Create a singleton instance
export const logger = new Logger()

if (process.env.NODE_ENV === 'production') {
	logger.setMinLevel('error')
} else {
	logger.setMinLevel('info')
}
