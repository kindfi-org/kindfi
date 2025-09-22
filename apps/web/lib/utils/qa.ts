import type { CommentData, CommentWithAnswers } from '../types/project'

const DEFAULT_GUEST_LIMIT = 3
const GUEST_USER_ID_KEY = 'guestUserId'
const GUEST_COMMENT_COUNT_KEY = 'guestCommentCount'

export function getGuestUserId(): string | null {
	if (typeof window === 'undefined') return null

	let guestUserId = window.localStorage.getItem(GUEST_USER_ID_KEY)
	if (!guestUserId) {
		guestUserId = crypto.randomUUID()
		window.localStorage.setItem(GUEST_USER_ID_KEY, guestUserId)
		window.localStorage.setItem(GUEST_COMMENT_COUNT_KEY, '0')
	}
	return guestUserId
}

export function getGuestRemainingComments(
	limit: number = DEFAULT_GUEST_LIMIT,
): number {
	if (typeof window === 'undefined') return limit
	const count = Number.parseInt(
		window.localStorage.getItem(GUEST_COMMENT_COUNT_KEY) || '0',
		10,
	)
	return Math.max(0, limit - count)
}

export function incrementGuestCommentCount(): number {
	if (typeof window === 'undefined') return 0
	const currentCount = Number.parseInt(
		window.localStorage.getItem(GUEST_COMMENT_COUNT_KEY) || '0',
		10,
	)
	const newCount = currentCount + 1
	window.localStorage.setItem(GUEST_COMMENT_COUNT_KEY, newCount.toString())
	return newCount
}

export function resetGuestCommentCount(): void {
	if (typeof window === 'undefined') return
	window.localStorage.setItem(GUEST_COMMENT_COUNT_KEY, '0')
}

export function buildQuestionThreads(
	questions: CommentData[] | undefined,
	comments: CommentData[] | undefined,
): CommentWithAnswers[] {
	if (!questions || !comments) return []
	const answers = comments.filter((c) => c.type === 'answer')
	const replies = comments.filter((c) => c.type === 'comment')

	return questions.map((question) => {
		const questionAnswers = answers
			.filter((answer) => answer.parent_comment_id === question.id)
			.map((answer) => {
				const answerReplies = replies.filter(
					(reply) => reply.parent_comment_id === answer.id,
				)
				const metadata = (question?.metadata || {}) as Record<string, unknown>
				return { ...answer, replies: answerReplies, metadata }
			})

		const metadata = (question?.metadata || {}) as Record<string, unknown>
		return { ...question, answers: questionAnswers, metadata }
	}) as CommentWithAnswers[]
}
