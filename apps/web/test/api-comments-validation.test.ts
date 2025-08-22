import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { z } from 'zod'

// Create the same validation schema that's used in the route
const createCommentSchema = z
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
	.refine(
		(data) => data.project_id || data.project_update_id,
		'Either project_id or project_update_id must be provided',
	)
	.refine(
		(data) => !(data.project_id && data.project_update_id),
		'Only one of project_id or project_update_id can be provided',
	)

// Mock Supabase client for validation testing
const mockSupabase: {
	from: (table: string) => MockQuery
	select: (cols: string) => MockQuery
	eq: (col: string, val: string) => MockQuery
	single: () => Promise<MockSingleResult>
} = {
	from: mock(() => mockSupabase),
	select: mock(() => mockSupabase),
	eq: mock(() => mockSupabase),
	single: mock(() => Promise.resolve({ data: null, error: null })),
}

/**
 * Validates parent comment relationships and type hierarchy
 * This is the same validation logic from the route
 */
interface MockSingleResult { data: unknown; error: { message: string } | null }
interface MockQuery {
	select: (cols: string) => MockQuery
	eq: (col: string, val: string) => MockQuery
	single: () => Promise<MockSingleResult>
}
interface MockClient {
	from: (_table: string) => MockQuery
}

async function validateParentComment(
	supabase: MockClient,
	parentCommentId: string,
	commentType: 'comment' | 'question' | 'answer',
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

describe('Comments API Validation Logic', () => {
	beforeEach(() => {
		// Reset all mocks
		Object.values(mockSupabase).forEach((fn) => {
			// bun:test mock has a `mock` property with `clear`
			if (typeof (fn as any)?.mock?.clear === 'function') {
				;(fn as any).mock.clear()
			}
		})
	})

	const validCommentData = {
		content: 'This is a test comment',
		project_id: '123e4567-e89b-12d3-a456-426614174001',
		type: 'comment' as const,
	}

	describe('Schema Validation', () => {
		test('should accept valid comment data', () => {
			const result = createCommentSchema.safeParse(validCommentData)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.content).toBe(validCommentData.content)
				expect(result.data.project_id).toBe(validCommentData.project_id)
				expect(result.data.type).toBe(validCommentData.type)
			}
		})

		test('should reject empty content', () => {
			const invalidData = { ...validCommentData, content: '' }
			const result = createCommentSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(
					result.error.issues.some(
						(issue) => issue.message === 'Content is required',
					),
				).toBe(true)
			}
		})

		test('should reject content that is too long', () => {
			const invalidData = {
				...validCommentData,
				content: 'a'.repeat(5001),
			}
			const result = createCommentSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(
					result.error.issues.some(
						(issue) => issue.message === 'Content too long',
					),
				).toBe(true)
			}
		})

		test('should reject content with only whitespace', () => {
			const invalidData = { ...validCommentData, content: '   ' }
			const result = createCommentSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(
					result.error.issues.some(
						(issue) => issue.message === 'Content is required',
					),
				).toBe(true)
			}
		})

		test('should reject when both project_id and project_update_id are provided', () => {
			const invalidData = {
				...validCommentData,
				project_update_id: '123e4567-e89b-12d3-a456-426614174002',
			}
			const result = createCommentSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(
					result.error.issues.some(
						(issue) =>
							issue.message ===
							'Only one of project_id or project_update_id can be provided',
					),
				).toBe(true)
			}
		})

		test('should reject when neither project_id nor project_update_id are provided', () => {
			const invalidData = {
				content: validCommentData.content,
				type: validCommentData.type,
			}
			const result = createCommentSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(
					result.error.issues.some(
						(issue) =>
							issue.message ===
							'Either project_id or project_update_id must be provided',
					),
				).toBe(true)
			}
		})

		test('should accept valid question type', () => {
			const questionData = { ...validCommentData, type: 'question' as const }
			const result = createCommentSchema.safeParse(questionData)
			expect(result.success).toBe(true)
		})

		test('should accept valid answer type', () => {
			const answerData = { ...validCommentData, type: 'answer' as const }
			const result = createCommentSchema.safeParse(answerData)
			expect(result.success).toBe(true)
		})

		test('should reject invalid comment type', () => {
			const invalidData = { ...validCommentData, type: 'invalid-type' }
			const result = createCommentSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		test('should set default comment type when not provided', () => {
			const dataWithoutType = {
				content: validCommentData.content,
				project_id: validCommentData.project_id,
			}
			const result = createCommentSchema.safeParse(dataWithoutType)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.type).toBe('comment')
			}
		})

		test('should set default metadata when not provided', () => {
			const result = createCommentSchema.safeParse(validCommentData)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.metadata).toEqual({})
			}
		})
	})

	describe('Parent Comment Validation', () => {
		test('should reject when parent comment does not exist', async () => {
			// Mock parent comment not found
			mockSupabase.single.mockReturnValue(
				Promise.resolve({
					data: null,
					error: { message: 'Not found' },
				}),
			)

			const result = await validateParentComment(
				mockSupabase,
				'123e4567-e89b-12d3-a456-426614174999',
				'answer',
				'123e4567-e89b-12d3-a456-426614174001',
			)

			expect(result.valid).toBe(false)
			expect(result.error).toBe('Parent comment not found')
		})

		test('should reject when parent comment belongs to different project', async () => {
			// Mock parent comment from different project
			mockSupabase.single.mockReturnValue(
				Promise.resolve({
					data: {
						id: '123e4567-e89b-12d3-a456-426614174999',
						type: 'question',
						project_id: '123e4567-e89b-12d3-a456-426614174002', // Different project
						project_update_id: null,
					},
					error: null,
				}),
			)

			const result = await validateParentComment(
				mockSupabase,
				'123e4567-e89b-12d3-a456-426614174999',
				'answer',
				'123e4567-e89b-12d3-a456-426614174001', // Different from parent
			)

			expect(result.valid).toBe(false)
			expect(result.error).toBe('Parent comment belongs to a different project')
		})

		test('should reject when parent comment belongs to different project update', async () => {
			// Mock parent comment from different project update
			mockSupabase.single.mockReturnValue(
				Promise.resolve({
					data: {
						id: '123e4567-e89b-12d3-a456-426614174999',
						type: 'question',
						project_id: null,
						project_update_id: '123e4567-e89b-12d3-a456-426614174002', // Different update
					},
					error: null,
				}),
			)

			const result = await validateParentComment(
				mockSupabase,
				'123e4567-e89b-12d3-a456-426614174999',
				'answer',
				undefined,
				'123e4567-e89b-12d3-a456-426614174001', // Different from parent
			)

			expect(result.valid).toBe(false)
			expect(result.error).toBe(
				'Parent comment belongs to a different project update',
			)
		})

		test('should accept when parent comment belongs to same project', async () => {
			// Mock valid parent comment
			mockSupabase.single.mockReturnValue(
				Promise.resolve({
					data: {
						id: '123e4567-e89b-12d3-a456-426614174999',
						type: 'question',
						project_id: '123e4567-e89b-12d3-a456-426614174001',
						project_update_id: null,
					},
					error: null,
				}),
			)

			const result = await validateParentComment(
				mockSupabase,
				'123e4567-e89b-12d3-a456-426614174999',
				'answer',
				'123e4567-e89b-12d3-a456-426614174001',
			)

			expect(result.valid).toBe(true)
			expect(result.error).toBeUndefined()
		})

		test('should accept when parent comment belongs to same project update', async () => {
			// Mock valid parent comment
			mockSupabase.single.mockReturnValue(
				Promise.resolve({
					data: {
						id: '123e4567-e89b-12d3-a456-426614174999',
						type: 'question',
						project_id: null,
						project_update_id: '123e4567-e89b-12d3-a456-426614174001',
					},
					error: null,
				}),
			)

			const result = await validateParentComment(
				mockSupabase,
				'123e4567-e89b-12d3-a456-426614174999',
				'answer',
				undefined,
				'123e4567-e89b-12d3-a456-426614174001',
			)

			expect(result.valid).toBe(true)
			expect(result.error).toBeUndefined()
		})
	})

	describe('Type Hierarchy Validation', () => {
		test('should accept answer with question parent', async () => {
			// Mock valid question parent
			mockSupabase.single.mockReturnValue(
				Promise.resolve({
					data: {
						id: '123e4567-e89b-12d3-a456-426614174999',
						type: 'question',
						project_id: '123e4567-e89b-12d3-a456-426614174001',
						project_update_id: null,
					},
					error: null,
				}),
			)

			const result = await validateParentComment(
				mockSupabase,
				'123e4567-e89b-12d3-a456-426614174999',
				'answer',
				'123e4567-e89b-12d3-a456-426614174001',
			)

			expect(result.valid).toBe(true)
			expect(result.error).toBeUndefined()
		})

		test('should reject answer with non-question parent', async () => {
			// Mock parent comment that is not a question
			mockSupabase.single.mockReturnValue(
				Promise.resolve({
					data: {
						id: '123e4567-e89b-12d3-a456-426614174999',
						type: 'comment', // Not a question
						project_id: '123e4567-e89b-12d3-a456-426614174001',
						project_update_id: null,
					},
					error: null,
				}),
			)

			const result = await validateParentComment(
				mockSupabase,
				'123e4567-e89b-12d3-a456-426614174999',
				'answer',
				'123e4567-e89b-12d3-a456-426614174001',
			)

			expect(result.valid).toBe(false)
			expect(result.error).toBe('Answers can only be added to questions')
		})

		test('should reject question with parent comment', async () => {
			// Mock valid parent comment
			mockSupabase.single.mockReturnValue(
				Promise.resolve({
					data: {
						id: '123e4567-e89b-12d3-a456-426614174999',
						type: 'comment',
						project_id: '123e4567-e89b-12d3-a456-426614174001',
						project_update_id: null,
					},
					error: null,
				}),
			)

			const result = await validateParentComment(
				mockSupabase,
				'123e4567-e89b-12d3-a456-426614174999',
				'question',
				'123e4567-e89b-12d3-a456-426614174001',
			)

			expect(result.valid).toBe(false)
			expect(result.error).toBe('Questions cannot have parent comments')
		})

		test('should accept comment with question parent', async () => {
			// Mock valid question parent
			mockSupabase.single.mockReturnValue(
				Promise.resolve({
					data: {
						id: '123e4567-e89b-12d3-a456-426614174999',
						type: 'question',
						project_id: '123e4567-e89b-12d3-a456-426614174001',
						project_update_id: null,
					},
					error: null,
				}),
			)

			const result = await validateParentComment(
				mockSupabase,
				'123e4567-e89b-12d3-a456-426614174999',
				'comment',
				'123e4567-e89b-12d3-a456-426614174001',
			)

			expect(result.valid).toBe(true)
			expect(result.error).toBeUndefined()
		})

		test('should accept comment with comment parent', async () => {
			// Mock valid comment parent
			mockSupabase.single.mockReturnValue(
				Promise.resolve({
					data: {
						id: '123e4567-e89b-12d3-a456-426614174999',
						type: 'comment',
						project_id: '123e4567-e89b-12d3-a456-426614174001',
						project_update_id: null,
					},
					error: null,
				}),
			)

			const result = await validateParentComment(
				mockSupabase,
				'123e4567-e89b-12d3-a456-426614174999',
				'comment',
				'123e4567-e89b-12d3-a456-426614174001',
			)

			expect(result.valid).toBe(true)
			expect(result.error).toBeUndefined()
		})

		test('should reject comment with answer parent', async () => {
			// Mock parent comment that is an answer
			mockSupabase.single.mockReturnValue(
				Promise.resolve({
					data: {
						id: '123e4567-e89b-12d3-a456-426614174999',
						type: 'answer', // Answers shouldn't be parents
						project_id: '123e4567-e89b-12d3-a456-426614174001',
						project_update_id: null,
					},
					error: null,
				}),
			)

			const result = await validateParentComment(
				mockSupabase,
				'123e4567-e89b-12d3-a456-426614174999',
				'comment',
				'123e4567-e89b-12d3-a456-426614174001',
			)

			expect(result.valid).toBe(false)
			expect(result.error).toBe('Invalid parent comment type for this comment')
		})
	})

	describe('Edge Cases', () => {
		test('should handle database errors in parent validation', async () => {
			// Mock database error
			mockSupabase.single.mockReturnValue(
				Promise.resolve({
					data: null,
					error: { message: 'Database connection error' },
				}),
			)

			const result = await validateParentComment(
				mockSupabase,
				'123e4567-e89b-12d3-a456-426614174999',
				'answer',
				'123e4567-e89b-12d3-a456-426614174001',
			)

			expect(result.valid).toBe(false)
			expect(result.error).toBe('Parent comment not found')
		})

		test('should validate with project_update_id instead of project_id', async () => {
			const validUpdateCommentData = {
				content: 'This is a test comment for update',
				author_id: '123e4567-e89b-12d3-a456-426614174000',
				project_update_id: '123e4567-e89b-12d3-a456-426614174001',
				type: 'comment' as const,
			}

			const result = createCommentSchema.safeParse(validUpdateCommentData)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.project_update_id).toBe(
					validUpdateCommentData.project_update_id,
				)
				expect(result.data.project_id).toBeUndefined()
			}
		})

		test('should handle optional parent_comment_id in schema', () => {
			const dataWithoutParent = {
				content: 'This is a test comment',
				author_id: '123e4567-e89b-12d3-a456-426614174000',
				project_id: '123e4567-e89b-12d3-a456-426614174001',
				type: 'question' as const,
			}

			const result = createCommentSchema.safeParse(dataWithoutParent)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.parent_comment_id).toBeUndefined()
			}
		})

		test('should handle custom metadata in schema', () => {
			const dataWithMetadata = {
				...validCommentData,
				metadata: { is_official: true, priority: 'high' },
			}

			const result = createCommentSchema.safeParse(dataWithMetadata)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.metadata).toEqual({
					is_official: true,
					priority: 'high',
				})
			}
		})
	})
})
