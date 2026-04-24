import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { Logger } from '~/lib/logger'

const logger = new Logger()

// ────────────────────────────────────────────────────────────────────────────
// Shared types
// ────────────────────────────────────────────────────────────────────────────

export interface Pagination {
	limit: number
	offset: number
	total: number
}

export interface ApiSuccessResponse<T> {
	success: true
	data: T
	pagination?: Pagination
}

export interface ApiErrorBody {
	success: false
	error: {
		code: string
		message: string
		details?: unknown
	}
}

/**
 * Minimal authenticated user shape compatible with both Supabase and NextAuth.
 * Route handlers can cast to the provider-specific type when additional fields
 * are needed.
 */
export interface AuthUser {
	id: string
	email?: string | null
}

// ────────────────────────────────────────────────────────────────────────────
// requireSession
// ────────────────────────────────────────────────────────────────────────────

type SessionSuccess = { user: AuthUser; error: null }
type SessionFailure = { user: null; error: NextResponse<ApiErrorBody> }
export type SessionResult = SessionSuccess | SessionFailure

/**
 * Validates the current user session and returns either the authenticated user
 * or a pre-built 401 `NextResponse` ready to be returned from the route.
 *
 * Defaults to Supabase auth. Pass `provider: 'nextauth'` for NextAuth sessions.
 *
 * @example
 * export async function POST(req: Request) {
 *   const { user, error } = await requireSession()
 *   if (error) return error
 *   // user.id is guaranteed here
 * }
 */
export async function requireSession(options?: {
	provider?: 'supabase' | 'nextauth'
}): Promise<SessionResult> {
	if (options?.provider === 'nextauth') {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return {
				user: null,
				error: error('Unauthorized', { status: 401, code: 'UNAUTHORIZED' }),
			}
		}
		return {
			user: { id: session.user.id, email: session.user.email },
			error: null,
		}
	}

	const supabase = await createSupabaseServerClient()
	const { data: authData } = await supabase.auth.getUser()
	if (!authData?.user) {
		return {
			user: null,
			error: error('Unauthorized', { status: 401, code: 'UNAUTHORIZED' }),
		}
	}
	return { user: authData.user, error: null }
}

// ────────────────────────────────────────────────────────────────────────────
// respond
// ────────────────────────────────────────────────────────────────────────────

/**
 * Creates a standardized success response.
 *
 * @example
 * return respond(newComment, { status: 201 })
 * return respond(comments, { pagination: { limit: 50, offset: 0, total: 150 } })
 */
export function respond<T>(
	data: T,
	options?: { status?: number; pagination?: Pagination },
): NextResponse<ApiSuccessResponse<T>> {
	const body: ApiSuccessResponse<T> = { success: true, data }
	if (options?.pagination) body.pagination = options.pagination
	return NextResponse.json(body, { status: options?.status ?? 200 })
}

// ────────────────────────────────────────────────────────────────────────────
// error
// ────────────────────────────────────────────────────────────────────────────

/**
 * Creates a standardized error response with optional structured logging.
 *
 * - `log: true` — logs the message using the shared logger
 * - `log: someError` — logs the message along with error details / stack
 *
 * @example
 * return error('Invalid payload', { status: 400, code: 'VALIDATION_ERROR' })
 * return error('Insert failed', { status: 500, code: 'INSERT_FAILED', log: dbError })
 */
export function error(
	message: string,
	options?: {
		status?: number
		code?: string
		details?: unknown
		log?: boolean | Error | unknown
	},
): NextResponse<ApiErrorBody> {
	if (options?.log) {
		const logData: Record<string, unknown> = {
			eventType: options.code ?? 'API_ERROR',
			message,
		}
		if (options.details !== undefined) logData.details = options.details
		if (options.log instanceof Error) {
			logData.errorMessage = options.log.message
			logData.stack = options.log.stack
		} else if (typeof options.log !== 'boolean') {
			logData.errorDetail = options.log
		}
		logger.error(logData as Parameters<Logger['error']>[0])
	}

	return NextResponse.json(
		{
			success: false as const,
			error: {
				code: options?.code ?? 'INTERNAL_ERROR',
				message,
				...(options?.details !== undefined && { details: options.details }),
			},
		},
		{ status: options?.status ?? 500 },
	)
}
