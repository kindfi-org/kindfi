import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { checkSlugQuerySchema } from '~/lib/schemas/foundation.schemas'
import { validateRequest } from '~/lib/utils/validation'

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url)
		const queryData = { slug: searchParams.get('slug') ?? '' }
		const validation = validateRequest(checkSlugQuerySchema, queryData)
		if (!validation.success) {
			return validation.response
		}
		const { slug } = validation.data

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
