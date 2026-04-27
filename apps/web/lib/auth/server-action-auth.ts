import type { Session } from 'next-auth'
import { getServerSession } from 'next-auth'
import type { ZodSchema } from 'zod'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { RateLimiter } from '~/lib/auth/rate-limiter'
import { Logger } from '~/lib/logger'

const logger = new Logger()
const rateLimiter = new RateLimiter()

export type ServerActionErrorCode =
	| 'UNAUTHORIZED'
	| 'FORBIDDEN'
	| 'VALIDATION_ERROR'
	| 'RATE_LIMITED'
	| 'INTERNAL_ERROR'

export type ServerActionFailure = {
	success: false
	error: string
	code: ServerActionErrorCode
	details?: unknown
}

export class ServerActionError extends Error {
	constructor(
		message: string,
		public readonly code: ServerActionErrorCode,
		public readonly details?: unknown,
	) {
		super(message)
		this.name = 'ServerActionError'
	}
}

/**
 * Read the current session without throwing. Returns null when there is no
 * authenticated user — the caller decides how to react.
 */
export async function getAuthenticatedSession(): Promise<Session | null> {
	const session = await getServerSession(nextAuthOption)
	return session?.user?.id ? session : null
}

/**
 * Require an authenticated session inside a server action. Throws
 * ServerActionError('UNAUTHORIZED') if the caller is not signed in.
 */
export async function requireAuthenticatedSession(
	action: string,
): Promise<Session> {
	const session = await getAuthenticatedSession()
	if (!session) {
		logger.warn({ eventType: 'SERVER_ACTION_UNAUTHORIZED', action })
		throw new ServerActionError(
			'Unauthorized: You must be signed in to perform this action.',
			'UNAUTHORIZED',
		)
	}
	return session
}

function getSessionRole(session: Session): string | undefined {
	return session.user?.role ?? session.user?.userData?.role
}

/**
 * Require an admin-level session. Throws FORBIDDEN if the authenticated user
 * is not an admin.
 */
export async function requireAdminSession(action: string): Promise<Session> {
	const session = await requireAuthenticatedSession(action)
	if (getSessionRole(session) !== 'admin') {
		logger.warn({
			eventType: 'SERVER_ACTION_FORBIDDEN',
			action,
			userId: session.user.id,
		})
		throw new ServerActionError(
			'Forbidden: Admin privileges are required for this action.',
			'FORBIDDEN',
		)
	}
	return session
}

/**
 * Parse `input` against a Zod schema. Throws VALIDATION_ERROR on failure with
 * structured details so callers can return them to the client.
 */
export function validateInput<T>(
	schema: ZodSchema<T>,
	input: unknown,
	action: string,
): T {
	const result = schema.safeParse(input)
	if (!result.success) {
		logger.warn({
			eventType: 'SERVER_ACTION_VALIDATION_ERROR',
			action,
			details: result.error.format(),
		})
		throw new ServerActionError(
			'Invalid input.',
			'VALIDATION_ERROR',
			result.error.format(),
		)
	}
	return result.data
}

/**
 * Apply a rate limit keyed by `identifier` for `action`. Throws RATE_LIMITED
 * when the caller has exceeded the configured budget. Fails open if Redis is
 * unavailable so the action remains usable in dev environments.
 */
export async function enforceRateLimit(
	identifier: string,
	action: string,
): Promise<void> {
	try {
		const result = await rateLimiter.increment(identifier, action)
		if (result.isBlocked) {
			logger.warn({
				eventType: 'SERVER_ACTION_RATE_LIMITED',
				action,
				identifier,
			})
			throw new ServerActionError(
				'Too many requests. Please try again later.',
				'RATE_LIMITED',
			)
		}
	} catch (error) {
		if (error instanceof ServerActionError) throw error
		// Rate limiter unavailable — log and continue.
		logger.warn({
			eventType: 'SERVER_ACTION_RATE_LIMIT_UNAVAILABLE',
			action,
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

/**
 * Convert any thrown value (typically inside a server action `catch` block)
 * into a structured failure response that is safe to return to the client.
 */
export function toServerActionFailure(
	error: unknown,
	fallbackMessage = 'An unexpected error occurred.',
): ServerActionFailure {
	if (error instanceof ServerActionError) {
		return {
			success: false,
			error: error.message,
			code: error.code,
			details: error.details,
		}
	}

	logger.error({
		eventType: 'SERVER_ACTION_ERROR',
		error: error instanceof Error ? error.message : String(error),
	})

	return {
		success: false,
		error: fallbackMessage,
		code: 'INTERNAL_ERROR',
	}
}
