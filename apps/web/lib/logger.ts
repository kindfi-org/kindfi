type LogLevel = 'info' | 'warn' | 'error'

interface LogMessage {
	level: LogLevel
	message: string
	timestamp: string
	data?: Record<string, unknown>
}

type LogData = Record<string, unknown>

export const logger = {
	info: (message: string, data?: LogData) => {
		console.info(
			JSON.stringify({
				level: 'info',
				message,
				timestamp: new Date().toISOString(),
				data,
			} as LogMessage),
		)
	},
	warn: (message: string, data?: LogData) => {
		console.warn(
			JSON.stringify({
				level: 'warn',
				message,
				timestamp: new Date().toISOString(),
				data,
			} as LogMessage),
		)
	},
	error: (message: string, data?: LogData) => {
		console.error(
			JSON.stringify({
				level: 'error',
				message,
				timestamp: new Date().toISOString(),
				data,
			} as LogMessage),
		)
	},
}
