import { supabase } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { isPlatformAdmin } from '~/lib/queries/projects/development-only-access'

/**
 * GET /api/projects
 *
 * Returns a minimal list of projects for selectors/dropdowns.
 * Development-only projects are excluded unless the caller is a platform admin.
 */
export async function GET() {
	try {
		const session = await getServerSession(nextAuthOption)
		const includeDevelopmentOnly =
			session?.user?.id != null && (await isPlatformAdmin(session.user.id))

		let query = supabase
			.from('projects')
			.select(
				'id, title, slug, image_url, description, development_only, category:category_id(name)',
			)
			.order('title', { ascending: true })

		if (!includeDevelopmentOnly) {
			query = query.eq('development_only', false)
		}

		const { data, error } = await query

		if (error) throw error

		return NextResponse.json({ success: true, data: data ?? [] })
	} catch (error) {
		logger.error('Error fetching projects list:', error)
		return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
	}
}
