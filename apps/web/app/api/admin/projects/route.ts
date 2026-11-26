import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { requireAdminApi } from '~/lib/auth/require-admin-api'
import { withRateLimit } from '~/lib/middleware/rate-limit'
import {
	getAdminProjectFilterOptions,
	getAdminProjects,
} from '~/lib/queries/admin/get-admin-projects'
import { getAllProjects } from '~/lib/queries/projects/get-all-projects'
import { adminProjectsQuerySchema, parseAdminListParams } from '~/lib/validators/admin-list-params'

/**
 * Admin project list.
 *
 * With query params: paginated `{ items, total, page, pageSize }` response
 * with server-side search, filters, and sorting (the ops dashboard list).
 * Every response includes `filterOptions` (categories/foundations) so
 * bookmarked deep links render populated filter menus.
 *
 * Without query params: the legacy flat-array response consumed by the
 * pre-redesign AdminProjectsList, kept intact so the feature-flag-off path
 * behaves exactly as before.
 */
async function handleProjects(request: NextRequest): Promise<NextResponse> {
	const auth = await requireAdminApi()
	if (!auth.ok) return auth.response

	const { searchParams } = new URL(request.url)

	if ([...searchParams.keys()].length === 0) {
		const projects = await getAllProjects(supabaseServiceRole, [], 'most-recent', 1000, {
			includeAllStatuses: true,
		})
		return NextResponse.json(projects)
	}

	const params = parseAdminListParams(adminProjectsQuerySchema, searchParams)

	try {
		// Filter options ship with every response (they are tiny lookup tables)
		// so bookmarked deep links like ?page=2 render populated filter menus.
		const [result, filterOptions] = await Promise.all([
			getAdminProjects(supabaseServiceRole, params),
			getAdminProjectFilterOptions(supabaseServiceRole),
		])

		return NextResponse.json({ ...result, filterOptions })
	} catch (error) {
		logger.error(error)
		return NextResponse.json({ error: 'Failed to load projects' }, { status: 500 })
	}
}

export const GET = withRateLimit(
	{
		preset: 'lenient',
		identifier: (req) => req.headers.get('x-forwarded-for') ?? 'anonymous',
	},
	handleProjects,
)
