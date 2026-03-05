import { supabase } from '@packages/lib/supabase'
import type { TablesUpdate } from '@services/supabase'
import { type NextRequest, NextResponse } from 'next/server'
import { updateCommentSchema } from '../validation'
import { validateRequest } from '~/lib/utils/validation'

// PATCH /api/comments/[id]
// Updates an existing comment

export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params
	if (!id) {
		return NextResponse.json({ error: 'Missing id' }, { status: 400 })
	}
	let body: unknown
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ error: 'Invalid Request body' }, { status: 400 })
	}
	const validation = validateRequest(updateCommentSchema, body)
	if (!validation.success) {
		return validation.response
	}
	const bodyData = validation.data

	// Auth check
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser()
	if (authError || !user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	// fetch existing comment to ensure ownership, if user is not the owner, then they wont be able to update comment
	const { data: existing, error: fetchError } = await supabase
		.from('comments')
		.select('*')
		.eq('id', id)
		.single()
	if (fetchError || !existing) {
		return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
	}

	if (existing.author_id !== user.id) {
		return NextResponse.json(
			{
				error:
					'Forbidden: You are not able to update comments that are not yours',
			},
			{ status: 403 },
		)
	}

	// Allow marking resolved only on questions
	const updates: TablesUpdate<'comments'> = {}
	if (typeof bodyData.content === 'string') {
		updates.content = bodyData.content as string
	}
	if (typeof bodyData.is_resolved === 'boolean') {
		if (existing.type !== 'question') {
			return NextResponse.json(
				{ error: 'Only questions can be marked resolved' },
				{ status: 400 },
			)
		}
		const currentMetadata = (existing.metadata as Record<string, unknown>) || {}
		updates.metadata = {
			...currentMetadata,
			status: bodyData.is_resolved ? 'resolved' : 'new',
		}
	}

	if (Object.keys(updates).length === 0) {
		return NextResponse.json(
			{ error: 'No valid fields to update' },
			{ status: 400 },
		)
	}

	const { data, error } = await supabase
		.from('comments')
		.update(updates)
		.eq('id', id)
		.select('*')
		.single()

	if (error || !data) {
		return NextResponse.json(
			{ error: 'Failed to update comment', details: error?.message },
			{ status: 500 },
		)
	}

	return NextResponse.json({ data }, { status: 200 })
}
