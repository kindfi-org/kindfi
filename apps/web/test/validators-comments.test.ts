import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { CreateCommentData } from '../comments'
import {
	CommentType,
	createCommentSchema,
	validateComment,
	validateCommentData,
	validateCommentUpdate,
	validateParentCommentRelationships,
} from '../comments'

// Mock Supabase client
interface MockSingleResult { data: unknown; error: { message: string } | null }
interface MockQuery {
	select: (cols: string) => MockQuery
	eq: (col: string, val: string) => MockQuery
	single: () => Promise<MockSingleResult>
}
interface MockClient {
	from: (_table: string) => MockQuery
}
const mockSupabase: MockClient & Record<string, any> = {
	from: mock(() => mockSupabase),
	select: mock(() => mockSupabase),
	eq: mock(() => mockSupabase),
	single: mock(),
}

describe('Comment Validation', () => {
	beforeEach(() => {
		// Reset all mocks
		type MaybeMock = { mock?: { clear?: () => void } }
		Object.values(mockSupabase).forEach((fn) => {
			const maybe = fn as unknown as MaybeMock
			if (typeof maybe.mock?.clear === 'function') {
				maybe.mock.clear()
			}
		})
	})

	describe('validateCommentData', () => {
		const validCommentData: CreateCommentData = {
			content: 'Test comment content',
			author_id: '123e4567-e89b-12d3-a456-426614174000',
			project_id: '123e4567-e89b-12d3-a456-426614174001',
			type: 'comment',
		}

		test('should validate correct comment data', () => {
			const result = validateCommentData(validCommentData)
			expect(result.isValid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})

		test('should reject empty content', () => {
			const invalidData = { ...validCommentData, content: '' }
			const result = validateCommentData(invalidData)
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain('Content cannot be empty')
		})

		test('should reject content that is too long', () => {
			const invalidData = { ...validCommentData, content: 'a'.repeat(5001) }
			const result = validateCommentData(invalidData)
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain(
				'Content too long (maximum 5000 characters)',
			)
		})

		test('should reject missing author_id', () => {
			const invalidData = { ...validCommentData, author_id: '' }
			const result = validateCommentData(invalidData)
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain('Author ID is required')
		})

		test('should reject invalid UUID format for author_id', () => {
			const invalidData = { ...validCommentData, author_id: 'invalid-uuid' }
			const result = validateCommentData(invalidData)
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain('Invalid author ID format')
		})

		test('should reject both project_id and project_update_id', () => {
			const invalidData = {
				...validCommentData,
				project_update_id: '123e4567-e89b-12d3-a456-426614174002',
			}
			const result = validateCommentData(invalidData)
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain(
				'Comment cannot have both project_id and project_update_id',
			)
		})

		test('should reject neither project_id nor project_update_id', () => {
			const invalidData = {
				content: 'Test comment content',
				author_id: '123e4567-e89b-12d3-a456-426614174000',
				type: 'comment',
			}
			const result = validateCommentData(invalidData)
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain(
				'Comment must have either project_id or project_update_id',
			)
		})

		test('should reject invalid UUID format for project_id', () => {
			const invalidData = { ...validCommentData, project_id: 'invalid-uuid' }
			const result = validateCommentData(invalidData)
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain('Invalid project ID format')
		})

		test('should reject invalid UUID format for project_update_id', () => {
			const invalidData = {
				...validCommentData,
				project_id: undefined,
				project_update_id: 'invalid-uuid',
			}
			const result = validateCommentData(invalidData)
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain('Invalid project update ID format')
		})

		test('should reject invalid UUID format for parent_comment_id', () => {
			const invalidData = {
				...validCommentData,
				parent_comment_id: 'invalid-uuid',
			}
			const result = validateCommentData(invalidData)
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain('Invalid parent comment ID format')
		})

		test('should reject answer without parent comment', () => {
			const invalidData = { ...validCommentData, type: 'answer' }
			const result = validateCommentData(invalidData)
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain('Answers must have a parent comment')
		})

		// Removed: invalid self-reference test (author_id is not the comment id)

		test('should accept valid project_update_id comment', () => {
			const validData = {
				content: 'Test comment content',
				author_id: '123e4567-e89b-12d3-a456-426614174000',
				project_update_id: '123e4567-e89b-12d3-a456-426614174002',
				type: 'comment',
			}
			const result = validateCommentData(validData)
			expect(result.isValid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})

		test('should accept valid answer with parent comment', () => {
			const validData = {
				...validCommentData,
				type: 'answer',
				parent_comment_id: '123e4567-e89b-12d3-a456-426614174002',
			}
			const result = validateCommentData(validData)
			expect(result.isValid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})
	})

	describe('validateParentCommentRelationships', () => {
		const validCommentData: CreateCommentData = {
			content: 'Test comment content',
			author_id: '123e4567-e89b-12d3-a456-426614174000',
			project_id: '123e4567-e89b-12d3-a456-426614174001',
			type: 'comment',
		}

		test('should pass validation when no parent comment', async () => {
			const result = await validateParentCommentRelationships(
				mockSupabase as any,
				validCommentData,
			)
			expect(result.isValid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})

		test('should reject when parent comment does not exist', async () => {
			mockSupabase.single.mockReturnValue(
				Promise.resolve({
					data: null,
					error: { message: 'Not found' },
				}),
			)

			const commentWithParent = {
				...validCommentData,
				parent_comment_id: '123e4567-e89b-12d3-a456-426614174002',
			}

			const result = await validateParentCommentRelationships(
				mockSupabase as any,
				commentWithParent,
			)
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain('Parent comment not found')
		})

		test('should reject when parent comment belongs to different project', async () => {
			mockSupabase.single.mockResolvedValue({
				data: {
					id: '123e4567-e89b-12d3-a456-426614174002',
					project_id: 'different-project-id',
					type: 'comment',
				},
				error: null,
			})

			const commentWithParent = {
				...validCommentData,
				parent_comment_id: '123e4567-e89b-12d3-a456-426614174002',
			}

			const result = await validateParentCommentRelationships(
				mockSupabase as any,
				commentWithParent,
			)
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain(
				'Parent comment must belong to the same project',
			)
		})

		test('should reject when parent comment belongs to different project update', async () => {
			mockSupabase.single.mockResolvedValue({
				data: {
					id: '123e4567-e89b-12d3-a456-426614174002',
					project_update_id: 'different-update-id',
					type: 'comment',
				},
				error: null,
			})

			const commentWithParent = {
				...validCommentData,
				project_id: undefined,
				project_update_id: '123e4567-e89b-12d3-a456-426614174003',
				parent_comment_id: '123e4567-e89b-12d3-a456-426614174002',
			}

			const result = await validateParentCommentRelationships(
				mockSupabase as any,
				commentWithParent,
			)
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain(
				'Parent comment must belong to the same project update',
			)
		})

		test('should reject when trying to add answer to non-question comment', async () => {
			mockSupabase.single.mockResolvedValue({
				data: {
					id: '123e4567-e89b-12d3-a456-426614174002',
					project_id: '123e4567-e89b-12d3-a456-426614174001',
					type: 'comment',
				},
				error: null,
			})

			const answerData = {
				...validCommentData,
				type: 'answer',
				parent_comment_id: '123e4567-e89b-12d3-a456-426614174002',
			}

			const result = await validateParentCommentRelationships(
				mockSupabase as any,
				answerData,
			)
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain('Answers can only be added to questions')
		})

		test('should accept when adding answer to question comment', async () => {
			mockSupabase.single.mockResolvedValue({
				data: {
					id: '123e4567-e89b-12d3-a456-426614174002',
					project_id: '123e4567-e89b-12d3-a456-426614174001',
					type: 'question',
				},
				error: null,
			})

			const answerData = {
				...validCommentData,
				type: 'answer',
				parent_comment_id: '123e4567-e89b-12d3-a456-426614174002',
			}

			const result = await validateParentCommentRelationships(
				mockSupabase as any,
				answerData,
			)
			expect(result.isValid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})

		test('should reject when comment nesting is too deep', async () => {
			// Mock a deep comment chain
			mockSupabase.single
				.mockResolvedValueOnce({
					data: {
						id: '123e4567-e89b-12d3-a456-426614174002',
						project_id: '123e4567-e89b-12d3-a456-426614174001',
						type: 'comment',
						parent_comment_id: 'parent-1',
					},
					error: null,
				})
				.mockResolvedValueOnce({
					data: { parent_comment_id: 'parent-2' },
					error: null,
				})
				.mockResolvedValueOnce({
					data: { parent_comment_id: 'parent-3' },
					error: null,
				})
				.mockResolvedValueOnce({
					data: { parent_comment_id: 'parent-4' },
					error: null,
				})
				.mockResolvedValueOnce({
					data: { parent_comment_id: 'parent-5' },
					error: null,
				})
				.mockResolvedValueOnce({
					data: { parent_comment_id: null },
					error: null,
				})

			const commentWithParent = {
				...validCommentData,
				parent_comment_id: '123e4567-e89b-12d3-a456-426614174002',
			}

			const result = await validateParentCommentRelationships(
				mockSupabase as any,
				commentWithParent,
			)
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain(
				'Comment nesting too deep (maximum 5 levels)',
			)
		})
	})

	describe('validateComment', () => {
		const validCommentData: CreateCommentData = {
			content: 'Test comment content',
			author_id: '123e4567-e89b-12d3-a456-426614174001',
			project_id: '123e4567-e89b-12d3-a456-426614174001',
			type: 'comment',
		}

		test('should pass validation for valid comment without parent', async () => {
			const result = await validateComment(
				mockSupabase as any,
				validCommentData,
			)
			expect(result.isValid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})

		test('should fail validation for invalid comment data', async () => {
			const invalidData = { ...validCommentData, content: '' }
			const result = await validateComment(mockSupabase as any, invalidData)
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain('Content cannot be empty')
		})

		test('should fail validation for invalid parent relationships', async () => {
			mockSupabase.single.mockResolvedValue({
				data: null,
				error: { message: 'Not found' },
			})

			const commentWithParent = {
				...validCommentData,
				parent_comment_id: '123e4567-e89b-12d3-a456-426614174002',
			}

			const result = await validateComment(
				mockSupabase as any,
				commentWithParent,
			)
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain('Parent comment not found')
		})
	})

	describe('validateCommentUpdate', () => {
		test('should pass validation for valid update data', () => {
			const updateData = {
				content: 'Updated comment content',
			}
			const result = validateCommentUpdate(updateData)
			expect(result.isValid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})

		test('should reject empty content in update', () => {
			const updateData = {
				content: '',
			}
			const result = validateCommentUpdate(updateData)
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain('Content cannot be empty')
		})

		test('should reject content that is too long in update', () => {
			const updateData = {
				content: 'a'.repeat(5001),
			}
			const result = validateCommentUpdate(updateData)
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain(
				'Content too long (maximum 5000 characters)',
			)
		})

		test('should reject invalid UUID format for author_id in update', () => {
			const updateData = {
				author_id: 'invalid-uuid',
			}
			const result = validateCommentUpdate(updateData)
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain('Invalid author ID format')
		})

		test('should pass validation when no fields are provided', () => {
			const updateData = {}
			const result = validateCommentUpdate(updateData)
			expect(result.isValid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})
	})

	describe('createCommentSchema', () => {
		test('should validate correct comment data', () => {
			const validData = {
				content: 'Test comment content',
				author_id: '123e4567-e89b-12d3-a456-426614174000',
				project_id: '123e4567-e89b-12d3-a456-426614174001',
				type: 'comment',
			}

			const result = createCommentSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		test('should reject invalid comment data', () => {
			const invalidData = {
				content: '',
				author_id: 'invalid-uuid',
			}

			const result = createCommentSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		test('should set default type to comment', () => {
			const dataWithoutType = {
				content: 'Test comment content',
				author_id: '123e4567-e89b-12d3-a456-426614174000',
				project_id: '123e4567-e89b-12d3-a456-426614174001',
			}

			const result = createCommentSchema.safeParse(dataWithoutType)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.type).toBe('comment')
			}
		})
	})

	describe('CommentType enum', () => {
		test('should have correct comment types', () => {
			expect(CommentType.COMMENT).toBe('comment')
			expect(CommentType.QUESTION).toBe('question')
			expect(CommentType.ANSWER).toBe('answer')
		})
	})
})
