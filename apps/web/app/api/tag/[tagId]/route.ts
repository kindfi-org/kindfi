import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '~/lib/supabase/config'

export async function GET(
	request: NextRequest,
	response: NextResponse,
	{ params }: { params: { tagId: string } },
) {
	try {
		if (!params || !params.tagId) {
			return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 })
		}

		const { data, error } = await supabase
			.from('project_tags')
			.select('*')
			.eq('id', params.tagId)
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

export async function PUT(
	request: NextRequest,
	Response: NextResponse,
	context: { params: { tagId: string } },
) {
	try {
		const { tagId } = context.params
		if (!tagId) {
			return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 })
		}

		const body = await request.json()

		if (!body.name) {
			return NextResponse.json(
				{ error: 'Tag name is required' },
				{ status: 400 },
			)
		}

		const sanitizedName = body.name.trim()

		if (sanitizedName.length > 50) {
			return NextResponse.json(
				{ error: 'Tag name must be 50 characters or less' },
				{ status: 400 },
			)
		}

		if (!/^[a-zA-Z0-9\s-_]+$/.test(sanitizedName)) {
			return NextResponse.json(
				{ error: 'Tag name contains invalid characters' },
				{ status: 400 },
			)
		}

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

export async function DELETE(
	request: NextRequest,
	response: NextResponse,
	context: { params: { tagId: string } },
) {
	try {
		const { tagId } = context.params
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
