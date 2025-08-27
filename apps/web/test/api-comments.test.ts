import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { NextRequest } from 'next/server'
import { GET, POST } from '../app/api/comments/route'

// Mock the Supabase client
mock.module('@packages/lib/supabase-server', () => ({
	createSupabaseServerClient: mock(() => mockSupabase),
}))

const mockSupabase = {
	from: mock(() => mockSupabase),
	select: mock(() => mockSupabase),
	insert: mock(() => mockSupabase),
	eq: mock(() => mockSupabase),
	returns: mock(() => mockSupabase),
	single: mock(),
	order: mock(() => mockSupabase),
	range: mock(() => mockSupabase),
	auth: {
		getUser: mock(async () => ({
			data: { user: { id: '123e4567-e89b-12d3-a456-426614174000' } },
			error: null,
		})),
	},
}

describe('/api/comments', () => {
	beforeEach(() => {
		// Reset all mocks (including nested auth.getUser)
		type MaybeMock = { mock?: { clear?: () => void } }
		Object.values(mockSupabase).forEach((fn) => {
			const maybe = fn as unknown as MaybeMock
			if (typeof maybe.mock?.clear === 'function') {
				maybe.mock.clear()
			}
		})
		if (typeof mockSupabase.auth?.getUser?.mock?.clear === 'function') {
			mockSupabase.auth.getUser.mock.clear()
		}

		// Reset specific mocks to default values
		mockSupabase.range.mockResolvedValue({
			data: [],
			error: null,
			count: 0,
		})
	})

	describe('POST /api/comments', () => {
		const validCommentData = {
			content: 'Test comment content',
			project_id: '123e4567-e89b-12d3-a456-426614174001',
			type: 'comment' as const,
		}

		test('should create a comment successfully without parent', async () => {
			const mockComment = { id: 'comment-1', ...validCommentData }
			mockSupabase.single.mockResolvedValue({ data: mockComment, error: null })

			const req = new NextRequest('http://localhost/api/comments', {
				method: 'POST',
				body: JSON.stringify(validCommentData),
			})

			const response = await POST(req)
			const result = await response.json()

			expect(response.status).toBe(201)
			expect(result.success).toBe(true)
			expect(result.data).toBeDefined()
		})

		test('should create an answer to a question successfully', async () => {
			const answerData = {
				...validCommentData,
				type: 'answer' as const,
				parent_comment_id: '123e4567-e89b-12d3-a456-426614174002',
			}

			// Mock parent comment (question)
			mockSupabase.single
				.mockResolvedValueOnce({
					data: {
						id: '123e4567-e89b-12d3-a456-426614174002',
						project_id: '123e4567-e89b-12d3-a456-426614174001',
						type: 'question',
					},
					error: null,
				})
				.mockResolvedValueOnce({
					data: { id: 'answer-1', ...answerData },
					error: null,
				})

			const req = new NextRequest('http://localhost/api/comments', {
				method: 'POST',
				body: JSON.stringify(answerData),
			})

			const response = await POST(req)
			const result = await response.json()

			expect(response.status).toBe(201)
			expect(result.success).toBe(true)
		})

		test('should return 400 when parent comment does not exist', async () => {
			const commentWithParent = {
				...validCommentData,
				parent_comment_id: '123e4567-e89b-12d3-a456-426614174002',
			}

			// Mock parent comment not found
			mockSupabase.single.mockResolvedValue({
				data: null,
				error: { message: 'Not found' },
			})

			const req = new NextRequest('http://localhost/api/comments', {
				method: 'POST',
				body: JSON.stringify(commentWithParent),
			})

			const response = await POST(req)
			const result = await response.json()

			expect(response.status).toBe(400)
			expect(result.success).toBe(false)
			expect(result.error.message).toBe('Parent comment not found')
		})

		test('should return 400 when parent comment belongs to different project', async () => {
			const commentWithParent = {
				...validCommentData,
				parent_comment_id: '123e4567-e89b-12d3-a456-426614174002',
			}

			// Mock parent comment from different project
			mockSupabase.single.mockResolvedValue({
				data: {
					id: '123e4567-e89b-12d3-a456-426614174002',
					project_id: '123e4567-e89b-12d3-a456-426614174003', // Different project
					type: 'comment',
				},
				error: null,
			})

			const req = new NextRequest('http://localhost/api/comments', {
				method: 'POST',
				body: JSON.stringify(commentWithParent),
			})

			const response = await POST(req)
			const result = await response.json()

			expect(response.status).toBe(400)
			expect(result.success).toBe(false)
			expect(result.error.message).toBe(
				'Parent comment belongs to a different project',
			)
		})

		test('should return 400 when trying to add answer to non-question comment', async () => {
			const answerData = {
				...validCommentData,
				type: 'answer' as const,
				parent_comment_id: '123e4567-e89b-12d3-a456-426614174002',
			}

			// Mock parent comment that is not a question
			mockSupabase.single.mockResolvedValue({
				data: {
					id: '123e4567-e89b-12d3-a456-426614174002',
					project_id: '123e4567-e89b-12d3-a456-426614174001',
					type: 'comment',
				},
				error: null,
			})

			const req = new NextRequest('http://localhost/api/comments', {
				method: 'POST',
				body: JSON.stringify(answerData),
			})

			const response = await POST(req)
			const result = await response.json()

			expect(response.status).toBe(400)
			expect(result.success).toBe(false)
			expect(result.error.message).toBe(
				'Answers can only be added to questions',
			)
		})

		test('should return 400 when comment has both project_id and project_update_id', async () => {
			const invalidCommentData = {
				...validCommentData,
				project_update_id: '123e4567-e89b-12d3-a456-426614174003',
			}

			const req = new NextRequest('http://localhost/api/comments', {
				method: 'POST',
				body: JSON.stringify(invalidCommentData),
			})

			const response = await POST(req)
			const result = await response.json()

			expect(response.status).toBe(400)
			expect(result.success).toBe(false)
			expect(result.error.message).toBe('Invalid request data')
		})

		test('should return 400 when comment has neither project_id nor project_update_id', async () => {
			const invalidCommentData = {
				content: 'Test comment content',
				type: 'comment' as const,
			}

			const req = new NextRequest('http://localhost/api/comments', {
				method: 'POST',
				body: JSON.stringify(invalidCommentData),
			})

			const response = await POST(req)
			const result = await response.json()

			expect(response.status).toBe(400)
			expect(result.success).toBe(false)
			expect(result.error.message).toBe('Invalid request data')
		})

		test('should return 400 for invalid request data (empty content)', async () => {
			const invalidData = {
				...validCommentData,
				content: '', // Empty content
			}

			const req = new NextRequest('http://localhost/api/comments', {
				method: 'POST',
				body: JSON.stringify(invalidData),
			})

			const response = await POST(req)
			const result = await response.json()

			expect(response.status).toBe(400)
			expect(result.success).toBe(false)
			expect(result.error.message).toBe('Invalid request data')
		})

		test('should return 500 when database insertion fails', async () => {
			// Mock database error
			mockSupabase.single.mockResolvedValue({
				data: null,
				error: { message: 'Database error' },
			})

			const req = new NextRequest('http://localhost/api/comments', {
				method: 'POST',
				body: JSON.stringify(validCommentData),
			})

			const response = await POST(req)
			const result = await response.json()

			expect(response.status).toBe(500)
			expect(result.success).toBe(false)
			expect(result.error.message).toBe('Failed to create comment')
		})

		test('should handle project update comments correctly', async () => {
			const projectUpdateComment = {
				content: 'Project update comment',
				project_update_id: '123e4567-e89b-12d3-a456-426614174003',
				type: 'comment' as const,
			}

			mockSupabase.single.mockResolvedValue({
				data: { id: 'comment-1', ...projectUpdateComment },
				error: null,
			})

			const req = new NextRequest('http://localhost/api/comments', {
				method: 'POST',
				body: JSON.stringify(projectUpdateComment),
			})

			const response = await POST(req)
			const result = await response.json()

			expect(response.status).toBe(201)
			expect(result.success).toBe(true)
		})

		test('should return 400 when parent belongs to different project update', async () => {
			const data = {
				content: 'Answer on wrong update',
				project_update_id: '123e4567-e89b-12d3-a456-426614174001',
				type: 'answer' as const,
				parent_comment_id: '123e4567-e89b-12d3-a456-426614174002',
			}
			// First single(): parent fetch → different update
			mockSupabase.single.mockResolvedValueOnce({
				data: {
					id: data.parent_comment_id,
					type: 'question',
					project_id: null,
					project_update_id: '123e4567-e89b-12d3-a456-426614174999', // mismatch
				},
				error: null,
			})
			const req = new NextRequest('http://localhost/api/comments', {
				method: 'POST',
				body: JSON.stringify(data),
			})
			const res = await POST(req)
			const json = await res.json()
			expect(res.status).toBe(400)
			expect(json.success).toBe(false)
			expect(json.error.message).toBe(
				'Parent comment belongs to a different project update',
			)
		})

		test('should return 401 when user is not authenticated', async () => {
			// Mock unauthenticated user
			mockSupabase.auth.getUser.mockResolvedValueOnce({
				data: { user: null },
				error: null,
			})

			const req = new NextRequest('http://localhost/api/comments', {
				method: 'POST',
				body: JSON.stringify(validCommentData),
			})

			const response = await POST(req)
			const result = await response.json()

			expect(response.status).toBe(401)
			expect(result.success).toBe(false)
			expect(result.error.message).toBe('Unauthorized')
		})

		test('should return 400 when answer has no parent', async () => {
			const data = {
				content: 'Answer w/o parent',
				project_id: '123e4567-e89b-12d3-a456-426614174001',
				type: 'answer' as const,
			}
			const req = new NextRequest('http://localhost/api/comments', {
				method: 'POST',
				body: JSON.stringify(data),
			})
			const res = await POST(req)
			const json = await res.json()
			expect(res.status).toBe(400)
			expect(json.success).toBe(false)
			expect(json.error.message).toBe('Answers must have a parent question')
		})
	})

	describe('GET /api/comments', () => {
		test('should retrieve comments with default pagination', async () => {
			const mockComments = [
				{ id: 'comment-1', content: 'Test comment 1' },
				{ id: 'comment-2', content: 'Test comment 2' },
			]

			// Clear any previous mocks and set up fresh
			mockSupabase.range.mockClear()
			mockSupabase.range.mockResolvedValue({
				data: mockComments,
				error: null,
				count: 2,
			})

			const req = new NextRequest('http://localhost/api/comments')
			const response = await GET(req)
			const result = await response.json()

			expect(response.status).toBe(200)
			expect(result.success).toBe(true)
			expect(result.data).toEqual(mockComments)
			expect(result.pagination).toEqual({
				limit: 50,
				offset: 0,
				total: 2,
			})
		})

		test('should filter comments by project_id', async () => {
			const mockComments = [{ id: 'comment-1', content: 'Project comment' }]

			mockSupabase.range.mockResolvedValue({
				data: mockComments,
				error: null,
				count: 1,
			})

			const req = new NextRequest(
				'http://localhost/api/comments?project_id=123',
			)
			const response = await GET(req)
			const result = await response.json()

			expect(response.status).toBe(200)
			expect(result.success).toBe(true)
			expect(result.data).toEqual(mockComments)
		})

		test('should filter comments by type', async () => {
			const mockQuestions = [
				{ id: 'question-1', content: 'Test question', type: 'question' },
			]

			mockSupabase.range.mockResolvedValue({
				data: mockQuestions,
				error: null,
				count: 1,
			})

			const req = new NextRequest('http://localhost/api/comments?type=question')
			const response = await GET(req)
			const result = await response.json()

			expect(response.status).toBe(200)
			expect(result.success).toBe(true)
			expect(result.data).toEqual(mockQuestions)
		})

		test('should handle database errors gracefully', async () => {
			mockSupabase.range.mockResolvedValue({
				data: null,
				error: { message: 'Database error' },
			})

			const req = new NextRequest('http://localhost/api/comments')
			const response = await GET(req)
			const result = await response.json()

			expect(response.status).toBe(500)
			expect(result.success).toBe(false)
			expect(result.error.message).toBe('Failed to fetch comments')
		})

		test('should apply custom pagination parameters', async () => {
			const mockComments = [{ id: 'comment-1', content: 'Test comment' }]

			mockSupabase.range.mockResolvedValue({
				data: mockComments,
				error: null,
				count: 1,
			})

			const req = new NextRequest(
				'http://localhost/api/comments?limit=10&offset=20',
			)
			const response = await GET(req)
			const result = await response.json()

			expect(response.status).toBe(200)
			expect(result.pagination).toEqual({
				limit: 10,
				offset: 20,
				total: 1,
			})
		})

		test('GET should return 401 when user is not authenticated', async () => {
			mockSupabase.auth.getUser.mockResolvedValueOnce({
				data: { user: null },
				error: null,
			})
			const req = new NextRequest('http://localhost/api/comments')
			const res = await GET(req)
			const json = await res.json()
			expect(res.status).toBe(401)
			expect(json.success).toBe(false)
			expect(json.error.message).toBe('Unauthorized')
		})

		test('GET should handle invalid limit parameter gracefully', async () => {
			const mockComments = [{ id: 'comment-1', content: 'Test comment' }]

			mockSupabase.range.mockResolvedValue({
				data: mockComments,
				error: null,
				count: 1,
			})

			const req = new NextRequest('http://localhost/api/comments?limit=abc')
			const response = await GET(req)
			const result = await response.json()

			expect(response.status).toBe(200)
			expect(result.pagination).toEqual({
				limit: 50, // Should default to 50 for invalid input
				offset: 0,
				total: 1,
			})
		})

		test('GET should handle negative offset parameter gracefully', async () => {
			const mockComments = [{ id: 'comment-1', content: 'Test comment' }]

			// Clear any previous mocks and set up fresh
			mockSupabase.range.mockClear()
			mockSupabase.range.mockResolvedValue({
				data: mockComments,
				error: null,
				count: 1,
			})

			const req = new NextRequest('http://localhost/api/comments?offset=-10')
			const response = await GET(req)
			const result = await response.json()

			expect(response.status).toBe(200)
			expect(result.pagination).toEqual({
				limit: 50,
				offset: 0, // Should clamp to 0 for negative input
				total: 1,
			})
		})
	})
})
