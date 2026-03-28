import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { NextResponse } from 'next/server'
import { waitlistSchema } from '~/lib/schemas/waitlist.schemas'
import { validateRequest } from '~/lib/utils/validation'

export async function POST(req: Request) {
	try {

		const supabase = await createSupabaseServerClient()

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

		// Prepare waitlist data to insert
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


		// Insert new waitlist entry and retrieve its ID

		// First, let's try to see if the table exists by doing a simple select
		const { data: testSelect, error: testError } = await supabase
			.from('waitlist_interests')
			.select('*')
			.limit(1)


		// If the select works, the table exists. Let's try the insert
		if (!testError) {

			// Try without array wrapper first
			const { data: insertData1, error: insertError1 } = await supabase
				.from('waitlist_interests')
				.insert(insertData)
				.select()


			if (!insertError1) {
				return NextResponse.json(
					{ success: true, id: insertData1?.[0]?.id },
					{ status: 201 },
				)
			}

			// If that failed, try with array wrapper
			const { data: insertData2, error: insertError2 } = await supabase
				.from('waitlist_interests')
				.insert([insertData])
				.select()


			if (!insertError2) {
				return NextResponse.json(
					{ success: true, id: insertData2?.[0]?.id },
					{ status: 201 },
				)
			}

			// If both failed, return the more detailed error
			const error = insertError2 || insertError1
			console.error('Both insert methods failed:', error)
			return NextResponse.json(
				{
					error: error?.message || 'Insert failed',
					code: error?.code,
					details: error?.details,
					hint: error?.hint,
				},
				{ status: 500 },
			)
			// biome-ignore lint/style/noUselessElse: <explanation>
		} else {
			// Table doesn't exist
			console.error('Table access failed:', testError)
			return NextResponse.json(
				{
					error: `Table access failed: ${testError.message}`,
					code: testError.code,
				},
				{ status: 500 },
			)
		}
	} catch (err) {
		console.error('Caught error in try/catch:', err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
