type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'none'

const allowedLevels: LogLevel[] = ['error', 'warn', 'info', 'debug', 'none']
const envLevel = process.env.LOG_LEVEL as LogLevel
let currentLevel: LogLevel = allowedLevels.includes(envLevel)
	? envLevel
	: 'info'
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

function getTimestamp() {
	return new Date().toISOString()
}

export const logger = {
	setLevel: (level: LogLevel) => {
		if (allowedLevels.includes(level)) {
			currentLevel = level
		} else {
			currentLevel = 'info'
		}
	},
	error: (message: string, error?: unknown) => {
		if (shouldLog('error')) console.error(`[${getTimestamp()}]`, message, error)
	},
	info: (message: string, data?: unknown) => {
		if (shouldLog('info')) console.info(`[${getTimestamp()}]`, message, data)
	},
	warn: (message: string, data?: unknown) => {
		if (shouldLog('warn')) console.warn(`[${getTimestamp()}]`, message, data)
	},
	debug: (message: string, data?: unknown) => {
		if (shouldLog('debug')) console.debug(`[${getTimestamp()}]`, message, data)
	},
}
