import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'

export type AuthorizeUserOverrideSuccess = {
	success: true
	userId: string
	overridden: boolean
}

export type AuthorizeUserOverrideFailure = {
	success: false
	response: NextResponse
}

export type AuthorizeUserOverrideResult =
	| AuthorizeUserOverrideSuccess
	| AuthorizeUserOverrideFailure

interface AuthorizeUserOverrideParams {
	session: Session
	requestedUserId?: string | null
	resource: string
}

/**
 * Resolves which userId an authenticated request may operate on.
 *
 * Defaults to the session user. A different `requestedUserId` is only honored
 * when the session user has the `admin` role; otherwise a 403 response is
 * returned so callers can short-circuit. This prevents privilege escalation
 * via attacker-controlled body fields.
 */
export function authorizeUserOverride({
	session,
	requestedUserId,
	resource,
}: AuthorizeUserOverrideParams): AuthorizeUserOverrideResult {
	const sessionUserId = session.user?.id
	if (!sessionUserId) {
		return {
			success: false,
			response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
		}
	}

	if (!requestedUserId || requestedUserId === sessionUserId) {
		return { success: true, userId: sessionUserId, overridden: false }
	}

	if (session.user?.role !== 'admin') {
		return {
			success: false,
			response: NextResponse.json(
				{
					error: `Forbidden: Only administrators can ${resource} for other users.`,
				},
				{ status: 403 },
			),
		}
	}

	return { success: true, userId: requestedUserId, overridden: true }
}
