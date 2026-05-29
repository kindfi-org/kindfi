import { supabase } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { waitlistSchema } from '~/lib/schemas/waitlist.schemas'
import { validateRequest } from '~/lib/utils/validation'
import { logger } from '@/lib/logger'

/**
 * POST /api/waitlist
 *
 * Public waitlist signup. Uses the service role client because:
 * - This app authenticates via NextAuth, not Supabase Auth
 * - Logged-in users hit authenticated RLS policies that block insert().select()
 * - Server-side validation is the access gate for this endpoint
 */
export async function POST(req: Request) {
	try {
		const body = await req.json()

		const validation = validateRequest(waitlistSchema, body)
		if (!validation.success) {
			return validation.response
		}

		const {
			name,
			email,
			role,
			projectName,
			projectDescription,
			location,
			source,
			consent,
		} = validation.data

		const insertData = {
			name,
			email: email || null,
			role,
			project_name: projectName || null,
			project_description: projectDescription || null,
			location: location || null,
			source: source || null,
			consent,
		}

		const { data, error } = await supabase
			.from('waitlist_interests')
			.insert(insertData)
			.select('id')
			.single()

		if (error) {
			logger.error('Waitlist insert failed:', error)
			return NextResponse.json(
				{
					error: error.message || 'Insert failed',
					code: error.code,
					details: error.details,
					hint: error.hint,
				},
				{ status: 500 },
			)
		}

		return NextResponse.json({ success: true, id: data.id }, { status: 201 })
	} catch (err) {
		logger.error('Waitlist submit error:', err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
