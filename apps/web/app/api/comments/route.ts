import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { TablesInsert } from '@services/supabase'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Schema for validating comment creation requests
const createCommentSchema = z
	.object({
		content: z
			.string()
			.min(1, 'Content is required')
			.max(5000, 'Content too long'),
		author_id: z.string().uuid('Invalid author ID'),
		parent_comment_id: z.string().uuid('Invalid parent comment ID').optional(),
		project_id: z.string().uuid('Invalid project ID').optional(),
		project_update_id: z.string().uuid('Invalid project update ID').optional(),
		type: z.enum(['comment', 'question', 'answer']).default('comment'),
		metadata: z.record(z.any()).default({}),
	})
	.refine(
		(data) => data.project_id || data.project_update_id,
		'Either project_id or project_update_id must be provided',
	)
	.refine(
		(data) => !(data.project_id && data.project_update_id),
		'Only one of project_id or project_update_id can be provided',
	)

/**
 * Validates parent comment relationships and type hierarchy
 */
async function validateParentComment(
	supabase: ReturnType<typeof createSupabaseServerClient>,
	parentCommentId: string,
	commentType: string,
	projectId?: string,
	projectUpdateId?: string,
): Promise<{ valid: boolean; error?: string }> {
	// Check if parent comment exists
	const { data: parentComment, error: fetchError } = await supabase
		.from('comments')
		.select('id, type, project_id, project_update_id')
		.eq('id', parentCommentId)
		.single()

	if (fetchError || !parentComment) {
		return { valid: false, error: 'Parent comment not found' }
	}

	// Validate parent belongs to same project/update
	const parentProjectId = parentComment.project_id
	const parentProjectUpdateId = parentComment.project_update_id

	if (projectId && parentProjectId !== projectId) {
		return {
			valid: false,
			error: 'Parent comment belongs to a different project',
		}
	}

	if (projectUpdateId && parentProjectUpdateId !== projectUpdateId) {
		return {
			valid: false,
			error: 'Parent comment belongs to a different project update',
		}
	}

	// Validate type hierarchy rules
	if (commentType === 'answer') {
		// Answers should only be added to questions
		if (parentComment.type !== 'question') {
			return {
				valid: false,
				error: 'Answers can only be added to questions',
			}
		}
	} else if (commentType === 'question') {
		// Questions cannot have parents (they are top-level)
		return {
			valid: false,
			error: 'Questions cannot have parent comments',
		}
	} else if (commentType === 'comment') {
		// Comments can be added to any type, but let's be explicit about allowed parents
		if (!['question', 'comment'].includes(parentComment.type)) {
			return {
				valid: false,
				error: 'Invalid parent comment type for this comment',
			}
		}
	}

	return { valid: true }
}

export async function POST(req: NextRequest) {
	try {
		const supabase = await createSupabaseServerClient()

		// Parse and validate request body
		const body = await req.json()
		const parsed = createCommentSchema.safeParse(body)

		if (!parsed.success) {
			return NextResponse.json(
				{
					error: 'Invalid request data',
					details: parsed.error.flatten().fieldErrors,
				},
				{ status: 400 },
			)
		}

		const {
			content,
			author_id,
			parent_comment_id,
			project_id,
			project_update_id,
			type,
			metadata,
		} = parsed.data

		// Validate parent comment relationships if parent_comment_id is provided
		if (parent_comment_id) {
			const parentValidation = await validateParentComment(
				supabase,
				parent_comment_id,
				type,
				project_id,
				project_update_id,
			)

			if (!parentValidation.valid) {
				return NextResponse.json(
					{ error: parentValidation.error },
					{ status: 400 },
				)
			}
		} else {
			// If no parent comment, ensure type hierarchy rules
			if (type === 'answer') {
				return NextResponse.json(
					{ error: 'Answers must have a parent question' },
					{ status: 400 },
				)
			}
		}

		// Prepare comment data for insertion
		const commentData: TablesInsert<'comments'> = {
			content,
			author_id,
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
				author:profiles (id, full_name, image_url, email),
				project_members (role, project_id, profile_id)
			`,
			)
			.single()

		if (insertError) {
			console.error('Error inserting comment:', insertError)
			return NextResponse.json(
				{ error: 'Failed to create comment' },
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
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
