'use server'

import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { NextResponse } from 'next/server'
import { updateSlugSchema } from '~/lib/schemas/profile.schemas'
import { validateRequest } from '~/lib/utils/validation'

export async function POST(request: Request) {
	try {
		const supabase = await createSupabaseServerClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()
		if (!user)
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

		const body = await request.json()
		const validation = validateRequest(updateSlugSchema, body)
		if (!validation.success) {
			return validation.response
		}
		const { slug } = validation.data

		// Ensure uniqueness
		const { data: existing } = await supabase
			.from('profiles')
			.select('id')
			.eq('slug', slug)
			.maybeSingle()

		if (existing && existing.id !== user.id) {
			return NextResponse.json(
				{ error: 'Handle already taken' },
				{ status: 409 },
			)
		}

		const { error } = await supabase
			.from('profiles')
			.update({ slug })
			.eq('id', user.id)

		if (error)
			return NextResponse.json({ error: error.message }, { status: 500 })

		return NextResponse.json({ success: true, slug })
	} catch (e) {
		return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
	}
}
