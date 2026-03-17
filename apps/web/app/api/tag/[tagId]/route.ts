import { supabase } from '@packages/lib/supabase'
import { type NextRequest, NextResponse } from 'next/server'
import { updateTagSchema } from '~/lib/schemas/tag.schemas'
import { validateRequest } from '~/lib/utils/validation'

type TagRouteContext = {
	params: Promise<{
		tagId: string
	}>
}

async function resolveTagParams(context: TagRouteContext) {
	const params = await context.params
	return params?.tagId
}

export async function GET(_request: NextRequest, context: TagRouteContext) {
	try {
		const tagId = await resolveTagParams(context)
		if (!tagId) {
			return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 })
		}

		const { data, error } = await supabase
			.from('project_tags')
			.select('*')
			.eq('id', tagId)
			.single()

		if (error || !data) {
			return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
		}

		return NextResponse.json(data)
	} catch (err) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}

export async function PUT(request: NextRequest, context: TagRouteContext) {
	try {
		const tagId = await resolveTagParams(context)
		if (!tagId) {
			return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 })
		}

		const body = await request.json()
		const validation = validateRequest(updateTagSchema, body)
		if (!validation.success) {
			return validation.response
		}
		const sanitizedName = validation.data.name

		const { data, error } = await supabase
			.from('project_tags')
			.update({
				name: sanitizedName,
				updated_at: new Date(),
			})
			.eq('id', tagId)
			.single()

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		return NextResponse.json(data)
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}

export async function DELETE(_request: NextRequest, context: TagRouteContext) {
	try {
		const tagId = await resolveTagParams(context)
		if (!tagId) {
			return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 })
		}

		const { data, error } = await supabase
			.from('project_tags')
			.delete()
			.eq('id', tagId)
			.select()

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		if (!data.length) {
			return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
		}

		return NextResponse.json({ message: 'Tag deleted' }, { status: 200 })
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
