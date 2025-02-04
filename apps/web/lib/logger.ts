import type { ILogger, LoggerData } from './types/logger.types'

type LogLevel = LoggerData['LogLevel']
type LogData = LoggerData['LogData']

export class Logger implements ILogger {
	private minLevel: LogLevel = 'info'

	setMinLevel(level: LogLevel) {
		this.minLevel = level
	}

	private shouldLog(level: LogLevel): boolean {
		const levels: LogLevel[] = ['error', 'warn', 'info']
		return levels.indexOf(level) <= levels.indexOf(this.minLevel)
	}

	private log(level: LogLevel, data: LogData) {
		if (!this.shouldLog(level)) return

		const timestamp = new Date().toISOString()
		const logMethod = console[level] as (
			message: string,
			...optionalParams: unknown[]
		) => void
		const prefix = `[${level.toUpperCase()}] ${timestamp}:`

		try {
			const { eventType, ...rest } = data
			const logData = {
				eventType,
				timestamp,
				...rest,
			}
			const jsonData = JSON.stringify(logData, null, 2)
			logMethod(prefix, eventType, '\n', jsonData)
		} catch (error) {
			console.error(`Error stringifying log data: ${error}`)
			logMethod(
				prefix,
				data.eventType,
				'\n',
				'Error: Unable to stringify log data',
			)
		}
	}

	error(data: LogData) {
		this.log('error', data)
	}

	warn(data: LogData) {
		this.log('warn', data)
	}

	info(data: LogData) {
		this.log('info', data)
	}
}
