import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { Tables, TablesInsert } from '@services/supabase'
import { type NextRequest, NextResponse } from 'next/server'
import { createCommentSchema, validateParentComment } from './validation'

export async function GET(req: NextRequest): Promise<NextResponse> {
	try {
		const supabase = await createSupabaseServerClient()
		const { data: authData } = await supabase.auth.getUser()
		if (!authData?.user) {
			return NextResponse.json(
				{
					success: false,
					error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
				},
				{ status: 401 },
			)
		}

		const { searchParams } = req.nextUrl
		const projectId = searchParams.get('project_id')
		const projectUpdateId = searchParams.get('project_update_id')
		const typeParam = searchParams.get('type')
		const type =
			typeParam && ['comment', 'question', 'answer'].includes(typeParam)
				? (typeParam as 'comment' | 'question' | 'answer')
				: null
		
		// Guard against NaN and negative values for pagination
		const limitParam = searchParams.get('limit')
		const rawLimit = limitParam ? Number(limitParam) : NaN
		const limit = Number.isFinite(rawLimit) && rawLimit > 0
			? Math.max(1, Math.min(rawLimit, 100))
			: 50
			
		const offsetParam = searchParams.get('offset')
		const rawOffset = offsetParam ? Number(offsetParam) : NaN
		const offset = Number.isFinite(rawOffset) ? Math.max(0, rawOffset) : 0

		let query = supabase
			.from('comments')
			.select('*', { count: 'planned' })
			.order('created_at', { ascending: false })
		if (projectId) query = query.eq('project_id', projectId)
		if (projectUpdateId) query = query.eq('project_update_id', projectUpdateId)
		if (type) query = query.eq('type', type)

		const { data, error, count } = await query.range(offset, offset + limit - 1)
		if (error) {
			return NextResponse.json(
				{
					success: false,
					error: { code: 'FETCH_FAILED', message: 'Failed to fetch comments' },
				},
				{ status: 500 },
			)
		}

		return NextResponse.json({
			success: true,
			data,
			pagination: { limit, offset, total: count ?? 0 },
		})
	} catch (error) {
		// Keep parity with POST logging
		console.error('Unexpected error in GET /api/comments:', error)
		return NextResponse.json(
			{
				success: false,
				error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
			},
			{ status: 500 },
		)
	}
}

export async function POST(req: NextRequest): Promise<NextResponse> {
	try {
		const supabase = await createSupabaseServerClient()

		// Authenticate user and get session
		const { data: authData, error: authError } = await supabase.auth.getUser()
		if (authError || !authData?.user) {
			return NextResponse.json(
				{
					success: false,
					error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
				},
				{ status: 401 },
			)
		}

		// Parse and validate request body
		const body = await req.json()
		const parsed = createCommentSchema.safeParse(body)

		if (!parsed.success) {
			const { fieldErrors, formErrors } = parsed.error.flatten()
			return NextResponse.json(
				{
					success: false,
					error: {
						code: 'VALIDATION_ERROR',
						message: 'Invalid request data',
						details: { fieldErrors, formErrors },
					},
				},
				{ status: 400 },
			)
		}

		const {
			content,
			parent_comment_id,
			project_id,
			project_update_id,
			type,
			metadata,
		} = parsed.data

		// Validate parent comment relationships if parent_comment_id is provided
		if (parent_comment_id) {
			const parentValidation = await validateParentComment({
				supabase,
				parentCommentId: parent_comment_id,
				commentType: type,
				projectId: project_id,
				projectUpdateId: project_update_id,
			})

			if (!parentValidation.valid) {
				return NextResponse.json(
					{
						success: false,
						error: {
							code: 'VALIDATION_ERROR',
							message: parentValidation.error,
						},
					},
					{ status: 400 },
				)
			}
		} else {
			// If no parent comment, ensure type hierarchy rules
			if (type === 'answer') {
				return NextResponse.json(
					{
						success: false,
						error: {
							code: 'VALIDATION_ERROR',
							message: 'Answers must have a parent question',
						},
					},
					{ status: 400 },
				)
			}
		}

		// Prepare comment data for insertion
		const commentData: TablesInsert<'comments'> = {
			content,
			author_id: authData.user.id,
			parent_comment_id: parent_comment_id || null,
			project_id: project_id || null,
			project_update_id: project_update_id || null,
			type,
			metadata,
		}

		// Insert the comment
		const { data: newComment, error: insertError } = await supabase
			.from('comments')
			.insert(commentData)
			.select(
				`
				*,
				author:profiles (id, full_name, image_url)
			`,
			)
			.single()

		if (insertError) {
			console.error('Error inserting comment:', insertError)
			return NextResponse.json(
				{
					success: false,
					error: {
						code: 'INSERT_FAILED',
						message: 'Failed to create comment',
					},
				},
				{ status: 500 },
			)
		}

		// Return the created comment with author information
		return NextResponse.json(
			{
				success: true,
				data: newComment,
			},
			{ status: 201 },
		)
	} catch (error) {
		console.error('Unexpected error in POST /api/comments:', error)
		return NextResponse.json(
			{
				success: false,
				error: {
					code: 'INTERNAL_ERROR',
					message: 'Internal server error',
				},
			},
			{ status: 500 },
		)
	}
}