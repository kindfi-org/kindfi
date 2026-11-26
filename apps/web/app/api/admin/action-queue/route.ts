import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { requireAdminApi } from '~/lib/auth/require-admin-api'
import { withRateLimit } from '~/lib/middleware/rate-limit'
import { getActionQueuePayload } from '~/lib/queries/admin/get-action-queue-payload'
import { getDashboardStats } from '~/lib/queries/admin/get-dashboard-stats'
import {
	adminActionQueueQuerySchema,
	parseAdminListParams,
} from '~/lib/validators/admin-list-params'

/**
 * Action-center read model: pending-work queues plus dashboard counts.
 * `?countsOnly=true` returns just the stats (used for navigation badges).
 * Queues and stats degrade independently so one failed metric does not
 * break the dashboard.
 */
async function handleActionQueue(request: NextRequest): Promise<NextResponse> {
	const auth = await requireAdminApi()
	if (!auth.ok) return auth.response

	const { searchParams } = new URL(request.url)
	const params = parseAdminListParams(adminActionQueueQuerySchema, searchParams)

	if (params.countsOnly === 'true') {
		const result = await getDashboardStats(supabaseServiceRole).then(
			(stats) => ({ stats, statsError: false }),
			() => ({ stats: null, statsError: true }),
		)
		return NextResponse.json(result)
	}

	const payload = await getActionQueuePayload(supabaseServiceRole)
	return NextResponse.json(payload)
}

export const GET = withRateLimit(
	{
		preset: 'lenient',
		identifier: (req) => req.headers.get('x-forwarded-for') ?? 'anonymous',
	},
	handleActionQueue,
)
