import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { NextResponse } from 'next/server'
import { waitlistSchema } from '~/lib/schemas/waitlist.schemas'

export async function POST(req: Request) {
	try {
		const supabase = await createSupabaseServerClient()
		const body = await req.json()
		const parsed = waitlistSchema.safeParse(body)
		if (!parsed.success) {
			return NextResponse.json(
				{
					error:
						parsed.error.flatten().formErrors.join(', ') || 'Invalid payload',
				},
				{ status: 400 },
			)
		}

		const {
			name,
			email,
			role,
			projectName,
			projectDescription,
			categoryId,
			location,
			source,
			consent,
		} = parsed.data

		const { data, error } = await supabase
			.from('waitlist_interests')
			.insert({
				name,
				email: email || null,
				role,
				project_name: projectName || null,
				project_description: projectDescription || null,
				category_id: categoryId || null,
				location: location || null,
				source: source || null,
				consent,
			})
			.select('id')
			.single()

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		return NextResponse.json({ id: data.id })
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error'
		return NextResponse.json({ error: msg }, { status: 500 })
	}
}
