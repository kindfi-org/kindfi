import { supabase } from '@packages/lib/supabase'
import type { Tables } from '@services/supabase'
import { type NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

interface CreateCommentBody {
	content?: string
	project_id?: string
	type?: 'question' | 'answer' | 'comment'
	parent_comment_id?: string | null
}

// POST /api/comments
// Creates a new comment/question/answer

export async function POST(req: NextRequest) {
	try {
		let body: CreateCommentBody | null = null
		try {
			body = (await req.json()) as CreateCommentBody
		} catch {
			return NextResponse.json(
				{ error: 'Invalid Request body' },
				{ status: 400 },
			)
		}

		const { content, project_id, type, parent_comment_id = null } = body || {}

		// validations
		if (!content || typeof content !== 'string') {
			return NextResponse.json(
				{ error: 'Content is required' },
				{ status: 400 },
			)
		}
		if (!project_id) {
			return NextResponse.json(
				{ error: 'project_id is required' },
				{ status: 400 },
			)
		}
		if (!type || !['question', 'answer', 'comment'].includes(type)) {
			return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
		}

		// Auth check
		const {
			data: { user },
		} = await supabase.auth.getUser()

		const authorId = user?.id || uuidv4() // guest id

		const payload: Partial<Tables<'comments'>> = {
			id: uuidv4(),
			content: content.trim(),
			project_id,
			type,
			parent_comment_id,
			author_id: authorId,
			is_resolved: false,
			metadata: type === 'question' ? { is_resolved: false } : null,
		}

		const { data, error } = await supabase
			.from('comments')
			.insert(payload)
			.select('*')
			.single()

		if (error || !data) {
			return NextResponse.json(
				{ error: 'Failed to create comment', details: error?.message },
				{ status: 500 },
			)
		}

		return NextResponse.json({ data }, { status: 201 })
	} catch (err) {
		return NextResponse.json(
			{
				error: 'Unexpected server error',
				details: err instanceof Error ? err.message : String(err),
			},
			{ status: 500 },
		)
	}
}
