import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { getUserCreatedProjects } from '~/lib/queries/projects/get-user-projects'
import { getAuthenticatedSupabaseServerClient } from '~/lib/supabase/authenticated-server-client'

/**
 * GET /api/profile/projects
 * Returns campaigns created by the signed-in user (includes development-only rows for admins).
 */
export async function GET() {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const client = await getAuthenticatedSupabaseServerClient()
		const projects = await getUserCreatedProjects(client, session.user.id)

		return NextResponse.json(projects)
	} catch (error) {
		logger.error('[Profile Projects] Failed to load user projects:', error)
		return NextResponse.json({ error: 'Failed to load projects' }, { status: 500 })
	}
}
