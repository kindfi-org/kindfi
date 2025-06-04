type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'none'

let currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'
const levelOrder: Record<LogLevel, number> = {
	error: 0,
	warn: 1,
	info: 2,
	debug: 3,
	none: 4,
}

function shouldLog(level: LogLevel) {
	return levelOrder[level] <= levelOrder[currentLevel]
}

export const logger = {
	setLevel: (level: LogLevel) => {
		currentLevel = level
	},
	error: (message: string, error?: unknown) => {
		if (shouldLog('error')) console.error(message, error)
	},
	info: (message: string, data?: unknown) => {
		if (shouldLog('info')) console.info(message, data)
	},
	warn: (message: string, data?: unknown) => {
		if (shouldLog('warn')) console.warn(message, data)
	},
	debug: (message: string, data?: unknown) => {
		if (shouldLog('debug')) console.debug(message, data)
	},
}
