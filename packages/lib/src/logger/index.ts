/**
 * Shared structured logger for KindFi.
 *
 * Server (Node.js / Edge) – thin wrapper over console that:
 *  - Is a no-op for non-error levels in production
 *  - Formats messages as structured JSON-like objects
 *  - Never leaks sensitive values (keys, tokens, full stack traces) in production
 *
 * Client (browser) – debug / info calls are silenced in production; only
 * error / warn are forwarded so React error boundaries can still surface issues.
 *
 * Usage:
 *   import { logger } from '@packages/lib/logger'
 *   logger.debug('fetching account', { address })
 *   logger.info('account loaded', { contractId })
 *   logger.warn('rate limit approaching', { remaining })
 *   logger.error('transaction failed', error, { address })
 */

type Level = 'debug' | 'info' | 'warn' | 'error'

const isDev =
	typeof process !== 'undefined'
		? process.env.NODE_ENV !== 'production'
		: false

const LEVELS: Record<Level, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
}

const MIN_LEVEL: Level = isDev ? 'debug' : 'warn'

function shouldLog(level: Level): boolean {
	return LEVELS[level] >= LEVELS[MIN_LEVEL]
}

function formatMessage(level: Level, message: string): string {
	const ts = new Date().toISOString()
	return `[${level.toUpperCase()}] ${ts} | ${message}`
}

/**
 * Sanitise an object before logging – strips fields that should never
 * appear in logs (secrets, tokens, keys).
 */
function sanitise(data?: Record<string, unknown>): Record<string, unknown> {
	if (!data) return {}
	const REDACTED = '[REDACTED]'
	const sensitiveKeys =
		/secret|token|key|password|auth|credential|passphrase|seed/i
	return Object.fromEntries(
		Object.entries(data).map(([k, v]) => [
			k,
			sensitiveKeys.test(k) ? REDACTED : v,
		]),
	)
}

export interface KindFiLogger {
	debug(message: string, data?: Record<string, unknown>): void
	info(message: string, data?: Record<string, unknown>): void
	warn(message: string, errorOrData?: unknown, data?: Record<string, unknown>): void
	error(message: string, errorOrData?: unknown, data?: Record<string, unknown>): void
}

function buildLogger(): KindFiLogger {
	return {
		debug(message, data) {
			if (!shouldLog('debug')) return
			// biome-ignore lint/suspicious/noConsole: logger internals intentionally use console
			console.debug(formatMessage('debug', message), sanitise(data))
		},

		info(message, data) {
			if (!shouldLog('info')) return
			// biome-ignore lint/suspicious/noConsole: logger internals intentionally use console
			console.info(formatMessage('info', message), sanitise(data))
		},

		warn(message, errorOrData, data) {
			if (!shouldLog('warn')) return
			const formatted = formatMessage('warn', message)
			if (errorOrData instanceof Error) {
				// In production, omit the stack trace to avoid leaking internal paths
				const errInfo = isDev
					? { message: errorOrData.message, stack: errorOrData.stack }
					: { message: errorOrData.message }
				// biome-ignore lint/suspicious/noConsole: logger internals intentionally use console
				console.warn(formatted, errInfo, sanitise(data))
			} else {
				// biome-ignore lint/suspicious/noConsole: logger internals intentionally use console
				console.warn(formatted, sanitise(errorOrData as Record<string, unknown>))
			}
		},

		error(message, errorOrData, data) {
			if (!shouldLog('error')) return
			const formatted = formatMessage('error', message)
			if (errorOrData instanceof Error) {
				const errInfo = isDev
					? { message: errorOrData.message, stack: errorOrData.stack }
					: { message: errorOrData.message }
				// biome-ignore lint/suspicious/noConsole: logger internals intentionally use console
				console.error(formatted, errInfo, sanitise(data))
			} else {
				// biome-ignore lint/suspicious/noConsole: logger internals intentionally use console
				console.error(formatted, sanitise(errorOrData as Record<string, unknown>))
			}
		},
	}
}

export const logger: KindFiLogger = buildLogger()
