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
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Only one of project_id or project_update_id can be provided',
				path: ['project_update_id'],
			})
		}
	})

export interface SupabaseLike {
	from: (_table: 'comments') => {
		select: (_cols: string) => {
			returns: <T>() => {
				eq: (_col: 'id', _val: string) => {
					single: () => Promise<{ data: ParentCommentRow | null; error: { message: string } | null }>
				}
			}
		}
	}
}

export interface ParentValidationInput {
	supabase: SupabaseLike
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
 * Validates that a provided parent_comment_id:
 * - Exists in the comments table
 * - Belongs to the same project or project update as the new comment
 * - Satisfies type hierarchy rules (answer → question; question cannot have a parent; comment → question|comment)
 *
 * @param supabase Supabase client (minimal SupabaseLike surface)
 * @param parentCommentId UUID of the parent comment to validate
 * @param commentType Type of the new comment: 'comment' | 'question' | 'answer'
 * @param projectId Optional project scope the new comment belongs to
 * @param projectUpdateId Optional project update scope the new comment belongs to
 * @returns {Promise<{ valid: boolean; error?: string }>} Validation result with optional error message on failure
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
