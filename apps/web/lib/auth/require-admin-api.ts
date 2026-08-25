import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { isPlatformAdmin } from '~/lib/queries/projects/development-only-access'

export type RequireAdminApiResult =
	| { ok: true; userId: string }
	| { ok: false; response: NextResponse }

/**
 * Server-side platform-admin guard for admin API route handlers.
 *
 * Every `/api/admin/*` route must call this independently — the `/admin`
 * layout guard only protects page navigation, never API access.
 *
 * @example
 * const auth = await requireAdminApi()
 * if (!auth.ok) return auth.response
 * // auth.userId is the verified platform admin
 */
export async function requireAdminApi(): Promise<RequireAdminApiResult> {
	const session = await getServerSession(nextAuthOption)

	if (!session?.user?.id) {
		return {
			ok: false,
			response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
		}
	}

	if (!(await isPlatformAdmin(session.user.id))) {
		return {
			ok: false,
			response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
		}
	}

	return { ok: true, userId: session.user.id }
}
