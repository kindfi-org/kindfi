import { z } from 'zod'
import type { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { Tables } from '@services/supabase'

// Schema for validating comment creation requests
export const createCommentSchema = z
	.object({
		content: z
			.string()
			.trim()
			.min(1, 'Content is required')
			.max(5000, 'Content too long'),
		parent_comment_id: z.string().uuid('Invalid parent comment ID').optional(),
		project_id: z.string().uuid('Invalid project ID').optional(),
		project_update_id: z.string().uuid('Invalid project update ID').optional(),
		type: z.enum(['comment', 'question', 'answer']).default('comment'),
		metadata: z.record(z.unknown()).default({}),
	})
	.superRefine((data, ctx) => {
		if (!data.project_id && !data.project_update_id) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Either project_id or project_update_id must be provided',
				path: ['project_id'],
			})
		}
		if (data.project_id && data.project_update_id) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Only one of project_id or project_update_id can be provided',
				path: ['project_id'],
			})
		}
	})

export interface ParentValidationInput {
	supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
	parentCommentId: string
	commentType: z.infer<typeof createCommentSchema>['type']
	projectId?: string
	projectUpdateId?: string
}

type ParentCommentRow = Pick<
	Tables<'comments'>,
	'id' | 'type' | 'project_id' | 'project_update_id'
>

/**
 * Validates parent comment relationships and type hierarchy
 */
export async function validateParentComment({
	supabase,
	parentCommentId,
	commentType,
	projectId,
	projectUpdateId,
}: ParentValidationInput): Promise<{ valid: boolean; error?: string }> {
	// Check if parent comment exists
	const { data: parentComment, error: fetchError } = await supabase
		.from('comments')
		.select('id, type, project_id, project_update_id')
		.returns<ParentCommentRow>()
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
