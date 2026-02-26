import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { slug } = await params
		if (!slug) {
			return NextResponse.json(
				{ error: 'Foundation slug is required' },
				{ status: 400 },
			)
		}

		const body = await req.json()
		const title = body.title as string | undefined
		const description = (body.description as string) || null
		const achievedDate = body.achievedDate as string | undefined
		const impactMetric = (body.impactMetric as string) || null

		if (!title?.trim()) {
			return NextResponse.json({ error: 'Title is required' }, { status: 400 })
		}
		if (!achievedDate) {
			return NextResponse.json(
				{ error: 'Achieved date is required' },
				{ status: 400 },
			)
		}

		// Use service role client after manual authorization check
		const supabase = supabaseServiceRole

		const { data: foundation, error: fetchError } = await supabase
			.from('foundations')
			.select('id, founder_id')
			.eq('slug', slug)
			.maybeSingle()

		if (fetchError || !foundation) {
			return NextResponse.json(
				{ error: 'Foundation not found' },
				{ status: 404 },
			)
		}

		if (foundation.founder_id !== session.user.id) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const { error: insertError } = await supabase
			.from('foundation_milestones')
			.insert({
				foundation_id: foundation.id,
				title: title.trim(),
				description,
				achieved_date: achievedDate,
				impact_metric: impactMetric,
				metadata: {},
			})

		if (insertError) {
			console.error('Insert milestone error:', insertError)
			return NextResponse.json(
				{ error: insertError.message ?? 'Failed to add milestone' },
				{ status: 500 },
			)
		}

		return NextResponse.json({ success: true }, { status: 201 })
	} catch (err) {
		console.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
