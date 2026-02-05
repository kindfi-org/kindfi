import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url)
		const slug = searchParams.get('slug')

		if (!slug) {
			return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
		}

		const { data, error } = await supabaseServiceRole
			.from('foundations')
			.select('id')
			.eq('slug', slug)
			.maybeSingle()

		if (error) {
			console.error('Error checking slug:', error)
			return NextResponse.json(
				{ error: 'Failed to check slug' },
				{ status: 500 },
			)
		}

		return NextResponse.json({ data: data || null })
	} catch (err) {
		console.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
