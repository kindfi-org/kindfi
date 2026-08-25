import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { requireAdminApi } from '~/lib/auth/require-admin-api'
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
 * Page 1 additionally includes `filterOptions` (categories/foundations).
 *
 * Without query params: the legacy flat-array response consumed by the
 * pre-redesign AdminProjectsList, kept intact so the feature-flag-off path
 * behaves exactly as before.
 */
export async function GET(request: Request) {
	const auth = await requireAdminApi()
	if (!auth.ok) return auth.response

	const { searchParams } = new URL(request.url)

	if ([...searchParams.keys()].length === 0) {
		const projects = await getAllProjects(supabaseServiceRole, [], 'most-recent', 1000)
		return NextResponse.json(projects)
	}

	const params = parseAdminListParams(adminProjectsQuerySchema, searchParams)

	try {
		const [result, filterOptions] = await Promise.all([
			getAdminProjects(supabaseServiceRole, params),
			params.page === 1 ? getAdminProjectFilterOptions(supabaseServiceRole) : Promise.resolve(null),
		])

		return NextResponse.json(filterOptions ? { ...result, filterOptions } : result)
	} catch (error) {
		logger.error(error)
		return NextResponse.json({ error: 'Failed to load projects' }, { status: 500 })
	}
}
