import type { Tables } from '@services/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type Dispatch, type SetStateAction, useState } from 'react'
import { logger } from '@/lib/logger'
import type {
	CommentData,
	CommentWithAnswers,
	UserData,
} from '~/lib/types/project/project-qa.types'

interface UseQAMutationsOptions {
	projectId: string
	effectiveUser: UserData
	checkGuestCommentLimit: () => boolean
	handleGuestCommentSuccess: () => void
	setProcessedQuestions: Dispatch<SetStateAction<CommentWithAnswers[]>>
	expandQuestion: (questionId: string) => void
	setRealtimeStatus: (status: string | null) => void
}

export const useQAMutations = ({
	projectId,
	effectiveUser,
	checkGuestCommentLimit,
	handleGuestCommentSuccess,
	setProcessedQuestions,
	expandQuestion,
	setRealtimeStatus,
}: UseQAMutationsOptions) => {
	const queryClient = useQueryClient()
	const [newQuestion, setNewQuestion] = useState<string>('')
	const [replyingTo, setReplyingTo] = useState<string | null>(null)
	const [replyContent, setReplyContent] = useState<Record<string, string>>({})

	const showStatus = (message: string, duration = 3000) => {
		setRealtimeStatus(message)
		setTimeout(() => setRealtimeStatus(null), duration)
	}

	const showError = (error: unknown) => {
		logger.error('Q&A mutation error:', error)
		showStatus(
			`Error: ${error instanceof Error ? error.message : String(error)}`,
			5000,
		)
	}

	const submitQuestionMutation = useMutation({
		mutationFn: async (questionContent: string) => {
			if (!effectiveUser?.id) throw new Error('User ID is required')
			const res = await fetch('/api/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					content: questionContent,
					project_id: projectId,
					type: 'question',
					parent_comment_id: null,
				}),
			})
			const json = await res.json()
			if (!res.ok) throw new Error(json.error || 'Failed to submit question')
			return json.data as Tables<'comments'>
		},
		onSuccess: (createdQuestion) => {
			handleGuestCommentSuccess()

			queryClient.setQueryData(
				['supabase', 'projectQuestions', projectId],
				(oldData: CommentData[] | undefined) => {
					if (!oldData) return [createdQuestion]
					return [createdQuestion, ...oldData]
				},
			)

			setNewQuestion('')

			queryClient.invalidateQueries({
				queryKey: ['supabase', 'projectQuestions', projectId],
			})

			showStatus('Question submitted successfully')
		},
		onError: showError,
	})

	const submitAnswerMutation = useMutation({
		mutationFn: async ({
			questionId,
			answerContent,
		}: {
			questionId: string
			answerContent: string
		}) => {
			if (!effectiveUser?.id) throw new Error('User ID is required')
			const res = await fetch('/api/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					content: answerContent,
					project_id: projectId,
					type: 'answer',
					parent_comment_id: questionId,
				}),
			})
			const json = await res.json()
			if (!res.ok) throw new Error(json.error || 'Failed to submit answer')
			return { data: json.data as Tables<'comments'>, questionId }
		},
		onSuccess: ({ questionId }) => {
			handleGuestCommentSuccess()

			setReplyContent((prev) => {
				const updated = { ...prev }
				delete updated[questionId]
				return updated
			})

			queryClient.invalidateQueries({
				queryKey: ['supabase', 'projectComments', projectId],
			})

			expandQuestion(questionId)
			showStatus('Answer submitted successfully')
		},
		onError: showError,
	})

	const submitReplyMutation = useMutation({
		mutationFn: async ({
			answerId,
			replyContent: content,
		}: {
			answerId: string
			replyContent: string
		}) => {
			if (!effectiveUser?.id) throw new Error('User ID is required')
			const res = await fetch('/api/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					content,
					project_id: projectId,
					type: 'comment',
					parent_comment_id: answerId,
				}),
			})
			const json = await res.json()
			if (!res.ok) throw new Error(json.error || 'Failed to submit')
			return json.data as Tables<'comments'>
		},
		onSuccess: () => {
			handleGuestCommentSuccess()
			setReplyContent({})
			setReplyingTo(null)

			queryClient.invalidateQueries({
				queryKey: ['supabase', 'projectComments', projectId],
			})

			showStatus('Reply submitted successfully')
		},
		onError: showError,
	})

	const markResolvedMutation = useMutation({
		mutationFn: async (questionId: string) => {
			if (!effectiveUser?.id) throw new Error('User ID is required')
			const res = await fetch(`/api/comments/${questionId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ is_resolved: true }),
			})
			const json = await res.json()
			if (!res.ok) throw new Error(json.error || 'Failed to mark resolved')
			return json.data as Tables<'comments'>
		},
		onSuccess: (updatedQuestion) => {
			queryClient.setQueryData(
				['supabase', 'projectQuestions', projectId],
				(oldData: CommentData[] | undefined) => {
					if (!oldData) return []
					return oldData.map((q) =>
						q.id === updatedQuestion.id
							? {
									...q,
									metadata: { ...q.metadata, status: 'resolved' },
								}
							: q,
					)
				},
			)

			setProcessedQuestions((prev) =>
				prev.map((q) =>
					q.id === updatedQuestion.id
						? {
								...q,
								metadata: { ...q.metadata, status: 'resolved' },
							}
						: q,
				),
			)

			showStatus('Question marked as resolved')
		},
		onError: showError,
	})

	const handleSubmitQuestion = () => {
		if (!newQuestion.trim() || !effectiveUser) return
		if (!checkGuestCommentLimit()) return
		submitQuestionMutation.mutate(newQuestion)
	}

	const handleSubmitAnswer = (questionId: string) => {
		if (!replyContent[questionId]?.trim() || !effectiveUser) return
		if (!checkGuestCommentLimit()) return
		submitAnswerMutation.mutate({
			questionId,
			answerContent: replyContent[questionId],
		})
	}

	const handleSubmitReply = (answerId: string) => {
		if (!replyContent[answerId]?.trim() || !effectiveUser) return
		if (!checkGuestCommentLimit()) return
		submitReplyMutation.mutate({
			answerId,
			replyContent: replyContent[answerId],
		})
	}

	const handleMarkResolved = (questionId: string) => {
		if (!effectiveUser) return
		markResolvedMutation.mutate(questionId)
	}

	const handleReplyChange = (id: string, content: string) => {
		setReplyContent((prev) => ({ ...prev, [id]: content }))
	}

	const startReplyingTo = (answerId: string) => {
		setReplyingTo(answerId)
		if (!replyContent[answerId]) {
			setReplyContent((prev) => ({ ...prev, [answerId]: '' }))
		}
	}

	const cancelReply = () => {
		if (replyingTo) {
			setReplyContent((prev) => {
				const updated = { ...prev }
				delete updated[replyingTo]
				return updated
			})
		}
		setReplyingTo(null)
	}

	return {
		newQuestion,
		setNewQuestion,
		replyingTo,
		replyContent,
		submitQuestionMutation,
		submitAnswerMutation,
		submitReplyMutation,
		markResolvedMutation,
		handleSubmitQuestion,
		handleSubmitAnswer,
		handleSubmitReply,
		handleMarkResolved,
		handleReplyChange,
		startReplyingTo,
		cancelReply,
	}
}
