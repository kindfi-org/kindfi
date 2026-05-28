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
const isDev =
	typeof process !== 'undefined'
		? process.env.NODE_ENV !== 'production'
		: false

const SENSITIVE_KEY_PATTERN =
	/secret|token|key|password|auth|credential|passphrase|seed/i

function sanitise(data?: Record<string, unknown>): Record<string, unknown> {
	if (!data) return {}
	return Object.fromEntries(
		Object.entries(data).map(([k, v]) => [
			k,
			SENSITIVE_KEY_PATTERN.test(k) ? '[REDACTED]' : v,
		]),
	)
}

function fmt(level: string, message: string): string {
	return `[${level.toUpperCase()}] ${new Date().toISOString()} | ${message}`
}

export interface KindFiLogger {
	debug(message: string, data?: Record<string, unknown>): void
	info(message: string, data?: Record<string, unknown>): void
	warn(
		message: string,
		errorOrData?: unknown,
		data?: Record<string, unknown>,
	): void
	error(
		message: string,
		errorOrData?: unknown,
		data?: Record<string, unknown>,
	): void
}

function buildLogger(): KindFiLogger {
	return {
		debug(message, data) {
			if (!isDev) return
			// biome-ignore lint/suspicious/noConsole: logger internals intentionally use console
			console.debug(fmt('debug', message), sanitise(data))
		},

		info(message, data) {
			if (!isDev) return
			// biome-ignore lint/suspicious/noConsole: logger internals intentionally use console
			console.info(fmt('info', message), sanitise(data))
		},

		warn(message, errorOrData, data) {
			const formatted = fmt('warn', message)
			if (errorOrData instanceof Error) {
				const errInfo = isDev
					? { message: errorOrData.message, stack: errorOrData.stack }
					: { message: errorOrData.message }
				// biome-ignore lint/suspicious/noConsole: logger internals intentionally use console
				console.warn(formatted, errInfo, sanitise(data))
			} else {
				// biome-ignore lint/suspicious/noConsole: logger internals intentionally use console
				console.warn(
					formatted,
					sanitise(errorOrData as Record<string, unknown>),
				)
			}
		},

		error(message, errorOrData, data) {
			const formatted = fmt('error', message)
			if (errorOrData instanceof Error) {
				const errInfo = isDev
					? { message: errorOrData.message, stack: errorOrData.stack }
					: { message: errorOrData.message }
				// biome-ignore lint/suspicious/noConsole: logger internals intentionally use console
				console.error(formatted, errInfo, sanitise(data))
			} else {
				// biome-ignore lint/suspicious/noConsole: logger internals intentionally use console
				console.error(
					formatted,
					sanitise(errorOrData as Record<string, unknown>),
				)
			}
		},
	}
}

export const logger: KindFiLogger = buildLogger()

