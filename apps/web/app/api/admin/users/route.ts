import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { requireAdminApi } from '~/lib/auth/require-admin-api'
import { getAdminUsers } from '~/lib/queries/admin/get-admin-users'
import { adminUsersQuerySchema, parseAdminListParams } from '~/lib/validators/admin-list-params'

/**
 * Paginated admin user list with role, KYC, provider, wallet, and signup
 * filters. Responses expose only operational fields — never KYC notes,
 * provider payloads, or documents.
 */
export async function GET(request: Request) {
	const auth = await requireAdminApi()
	if (!auth.ok) return auth.response

	const { searchParams } = new URL(request.url)
	const params = parseAdminListParams(adminUsersQuerySchema, searchParams)

	try {
		const result = await getAdminUsers(supabaseServiceRole, params)
		return NextResponse.json(result)
	} catch (error) {
		logger.error(error)
		return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
	}
}
