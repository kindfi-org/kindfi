import { supabase } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'

/**
 * GET /api/projects
 *
 * Returns a minimal list of all projects for use in selectors/dropdowns.
 * Public read — project titles and slugs are not sensitive.
 */
export async function GET() {
	try {
		const { data, error } = await supabase
			.from('projects')
			.select(
				'id, title, slug, image_url, description, category:category_id(name)',
			)
			.order('title', { ascending: true })

		if (error) throw error

		return NextResponse.json({ success: true, data: data ?? [] })
	} catch (error) {
		console.error('Error fetching projects list:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch projects' },
			{ status: 500 },
		)
	}
}
