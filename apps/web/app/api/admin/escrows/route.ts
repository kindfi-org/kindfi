import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { requireAdminApi } from '~/lib/auth/require-admin-api'
import { withRateLimit } from '~/lib/middleware/rate-limit'
import { getAdminEscrows } from '~/lib/queries/admin/get-admin-escrows'
import { adminEscrowsQuerySchema, parseAdminListParams } from '~/lib/validators/admin-list-params'

/**
 * Paginated admin escrow list with project association health flags.
 */
async function handleEscrows(request: NextRequest): Promise<NextResponse> {
	const auth = await requireAdminApi()
	if (!auth.ok) return auth.response

	const { searchParams } = new URL(request.url)
	const params = parseAdminListParams(adminEscrowsQuerySchema, searchParams)

	try {
		const result = await getAdminEscrows(supabaseServiceRole, params)
		return NextResponse.json(result)
	} catch (error) {
		logger.error(error)
		return NextResponse.json({ error: 'Failed to load escrows' }, { status: 500 })
	}
}

export const GET = withRateLimit(
	{
		preset: 'lenient',
		identifier: (req) => req.headers.get('x-forwarded-for') ?? 'anonymous',
	},
	handleEscrows,
)
