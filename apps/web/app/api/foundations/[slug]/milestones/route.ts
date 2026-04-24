import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import {
	foundationMilestoneCreateSchema,
	foundationSlugParamSchema,
} from '~/lib/schemas/foundation.schemas'
import { validateRequest } from '~/lib/utils/validation'

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	try {
		// Get session and params in parallel
		const [session, { slug }] = await Promise.all([
			getServerSession(nextAuthOption),
			params,
		])

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const slugValidation = validateRequest(foundationSlugParamSchema, { slug })
		if (!slugValidation.success) return slugValidation.response
		const { slug: validatedSlug } = slugValidation.data

		const body = await req.json()
		const validation = validateRequest(foundationMilestoneCreateSchema, body)
		if (!validation.success) return validation.response
		const { title, description, achievedDate, impactMetric } = validation.data

		// Use service role client after manual authorization check
		const supabase = supabaseServiceRole

		const { data: foundation, error: fetchError } = await supabase
			.from('foundations')
			.select('id, founder_id')
			.eq('slug', validatedSlug)
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
				title,
				description: description ?? null,
				achieved_date: achievedDate,
				impact_metric: impactMetric ?? null,
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
