import * as Sentry from '@sentry/nextjs'
import { logger } from '.'
import type { ILogger, LoggerData } from './types/logger.types'
import getErrorMessageLog from './utils/error.utils'


//Central logger with sentry integration
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
			const { eventType, details, ...rest } = data

			const logData = {
				eventType,
				timestamp,
				error: rest?.error || getErrorMessageLog(details),
				...rest,
			}

			const jsonData = JSON.stringify(logData, null, 2)
			logMethod(prefix, eventType, '\n', jsonData)
			if (level === 'error' && process.env.NODE_ENV === 'production') {
				Sentry.captureException(
					details instanceof Error ? details : new Error(eventType),
					{
						extra: {
							...rest,
							timestamp,
						},
						tags: {
							source: 'Logger',
						},
					},
				)
			}
		} catch (error) {
			const safeMessage = getErrorMessageLog(error)

			logger.error({
				eventType: 'Error stringifying log data',
				error: safeMessage,
				details: error,
			})

			logMethod(
				prefix,
				data.eventType,
				'\n',
				'Error: Unable to stringify log data',
			)

			if (process.env.NODE_ENV === 'production') {
				Sentry.captureException(error, {
					extra: {
						originalEventType: data.eventType,
					},
					tags: {
						source: 'LoggerError',
					},
				})
			}
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
