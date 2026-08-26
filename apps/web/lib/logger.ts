/**
 * KindFi Web App — structured logger.
 *
 * Keeps the existing ILogger / Logger class for audit-logger compatibility,
 * and adds a `logger` singleton that matches the @packages/lib/logger API
 * so that all api-route / hook code can use a consistent interface.
 *
 * Production behaviour:
 *   - debug / info are no-ops (silenced)
 *   - warn / error are forwarded to console (necessary for server log ingestion)
 *   - Sensitive field names are redacted before logging
 */

import type { ILogger, LoggerData } from './types/logger.types'

// ---------------------------------------------------------------------------
// ILogger-compatible class (used by audit-logger.ts etc.)
// ---------------------------------------------------------------------------
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
		const logMethod = console[level] as (message: string, ...optionalParams: unknown[]) => void
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
		} catch (_error) {
			logMethod(prefix, data.eventType, '\n', 'Error: Unable to stringify log data')
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

// ---------------------------------------------------------------------------
// Lightweight `logger` singleton — used by api routes, hooks, services
// ---------------------------------------------------------------------------
const isDev = typeof process !== 'undefined' ? process.env.NODE_ENV !== 'production' : false

const SENSITIVE_KEY_PATTERN = /secret|token|key|password|auth|credential|passphrase|seed/i

function sanitise(data?: Record<string, unknown>): Record<string, unknown> {
	if (!data) return {}
	return Object.fromEntries(
		Object.entries(data).map(([k, v]) => [k, SENSITIVE_KEY_PATTERN.test(k) ? '[REDACTED]' : v]),
	)
}

function fmt(level: string, message: string): string {
	return `[${level.toUpperCase()}] ${new Date().toISOString()} | ${message}`
}

function sanitiseData(data?: unknown): unknown {
	if (!data || typeof data !== 'object' || Array.isArray(data)) {
		return data
	}

	return sanitise(data as Record<string, unknown>)
}

export interface KindFiLogger {
	debug(message: string, data?: Record<string, unknown>): void
	info(message: string, data?: Record<string, unknown>): void
	warn(message: string, errorOrData?: unknown, data?: unknown): void
	warn(errorOrData: unknown): void
	error(message: string, errorOrData?: unknown, data?: unknown): void
	error(errorOrData: unknown): void
}

function buildLogger(): KindFiLogger {
	return {
		debug(message, data) {
			if (!isDev) return
			console.debug(fmt('debug', message), sanitise(data))
		},

		info(message, data) {
			if (!isDev) return
			console.info(fmt('info', message), sanitise(data))
		},

		warn(messageOrError: string | unknown, errorOrData?: unknown, data?: unknown) {
			if (typeof messageOrError !== 'string') {
				this.warn('Warning', messageOrError)
				return
			}

			const formatted = fmt('warn', messageOrError)
			if (errorOrData instanceof Error) {
				const errInfo = isDev
					? { message: errorOrData.message, stack: errorOrData.stack }
					: { message: errorOrData.message }
				console.warn(formatted, errInfo, sanitiseData(data))
				return
			}

			if (data !== undefined) {
				console.warn(formatted, errorOrData, sanitiseData(data))
				return
			}

			if (errorOrData !== undefined) {
				console.warn(formatted, sanitiseData(errorOrData))
				return
			}

			console.warn(formatted)
		},

		error(messageOrError: string | unknown, errorOrData?: unknown, data?: unknown) {
			if (typeof messageOrError !== 'string') {
				this.error('Error', messageOrError)
				return
			}

			const formatted = fmt('error', messageOrError)
			if (errorOrData instanceof Error) {
				const errInfo = isDev
					? { message: errorOrData.message, stack: errorOrData.stack }
					: { message: errorOrData.message }
				console.error(formatted, errInfo, sanitiseData(data))
				return
			}

			if (data !== undefined) {
				console.error(formatted, errorOrData, sanitiseData(data))
				return
			}

			if (errorOrData !== undefined) {
				console.error(formatted, sanitiseData(errorOrData))
				return
			}

			console.error(formatted)
		},
	}
}

export const logger: KindFiLogger = buildLogger()
