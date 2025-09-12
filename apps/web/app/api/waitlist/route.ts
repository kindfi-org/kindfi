import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { NextResponse } from 'next/server'
import { waitlistSchema } from '~/lib/schemas/waitlist.schemas'

export async function POST(req: Request) {
	try {
		console.log('Starting waitlist POST request')

		const supabase = await createSupabaseServerClient()
		console.log('Supabase client created')

		const body = await req.json()
		console.log('Request body:', body)

		// Validate the request body using the schema
		const parsed = waitlistSchema.safeParse(body)
		if (!parsed.success) {
			console.log('Validation failed:', parsed.error)
			return NextResponse.json(
				{
					error:
						parsed.error.flatten().formErrors.join(', ') || 'Invalid payload',
				},
				{ status: 400 },
			)
		}

		console.log('Validation passed:', parsed.data)

		const {
			name,
			email,
			role,
			projectName,
			projectDescription,
			location,
			source,
			consent,
		} = parsed.data

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

		console.log('Insert data prepared:', insertData)

		// Insert new waitlist entry and retrieve its ID
		console.log('About to insert into waitlist_interests')

		// First, let's try to see if the table exists by doing a simple select
		const { data: testSelect, error: testError } = await supabase
			.from('waitlist_interests')
			.select('*')
			.limit(1)

		console.log('Test select result:', { data: testSelect, error: testError })

		// If the select works, the table exists. Let's try the insert
		if (!testError) {
			console.log('Table exists, attempting insert...')

			// Try without array wrapper first
			const { data: insertData1, error: insertError1 } = await supabase
				.from('waitlist_interests')
				.insert(insertData)
				.select()

			console.log(
				'Insert without array - data:',
				insertData1,
				'error:',
				insertError1,
			)

			if (!insertError1) {
				console.log('Success without array!')
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

			console.log(
				'Insert with array - data:',
				insertData2,
				'error:',
				insertError2,
			)

			if (!insertError2) {
				console.log('Success with array!')
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
