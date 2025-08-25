'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { supabase } from '@packages/lib/supabase'
import type { TypedSupabaseClient } from '@packages/lib/types'
import type { Tables, TablesUpdate } from '@services/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, BellOff, LogIn, RefreshCw, User as UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '~/components/base/alert'
import { Button } from '~/components/base/button'
import { Card } from '~/components/base/card'
import { Separator } from '~/components/base/separator'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/base/tooltip'
import { AskQuestionForm } from '~/components/shared/qa/ask-question-form'
import { QuestionCard } from '~/components/shared/qa/question-card'
import { fetchChildComments, fetchQuestions } from '~/lib/services/comments'
import type {
	CommentData,
	CommentWithAnswers,
	QAClientProps,
} from '~/lib/types/qa/types'
import {
	buildQuestionThreads,
	getGuestRemainingComments as utilGetGuestRemainingComments,
	getGuestUserId as utilGetGuestUserId,
	incrementGuestCommentCount as utilIncrementGuestCommentCount,
	resetGuestCommentCount as utilResetGuestCommentCount,
} from '~/lib/utils/qa'

// Helper functions moved to utils/qa
const getGuestUserId = utilGetGuestUserId
const getGuestRemainingComments = () => utilGetGuestRemainingComments()
const incrementGuestCommentCount = utilIncrementGuestCommentCount

// Client component that uses the initial data from the server
export default function QAClient({
	projectId,
	currentUser,
	initialQuestions,
	initialComments,
}: QAClientProps) {
	const router = useRouter()
	const queryClient = useQueryClient()

	const [newQuestion, setNewQuestion] = useState<string>('')
	const [expandedQuestionIds, setExpandedQuestionIds] = useState<
		Record<string, boolean>
	>({})
	const [replyingTo, setReplyingTo] = useState<string | null>(null)
	const [replyContent, setReplyContent] = useState<Record<string, string>>({})
	const [processedQuestions, setProcessedQuestions] = useState<
		CommentWithAnswers[]
	>([])
	const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
	const [guestUserId, setGuestUserId] = useState<string | null>(null)
	const [guestRemainingComments, setGuestRemainingComments] = useState(3)
	const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(true)
	const [realtimeActivity, setRealtimeActivity] = useState(false)
	const [realtimeStatus, setRealtimeStatus] = useState<string | null>(null)
	const subscriptionRef = useRef<ReturnType<
		TypedSupabaseClient['channel']
	> | null>(null)

	useEffect(() => {
		if (!currentUser) {
			const userId = getGuestUserId()
			setGuestUserId(userId)
			setGuestRemainingComments(getGuestRemainingComments())
		}
	}, [currentUser])

	const effectiveUser =
		currentUser ||
		(guestUserId
			? {
					id: guestUserId,
					full_name: 'Guest User',
					is_team_member: false,
				}
			: null)

	const { data: questions, refresh: refetchQuestions } = useSupabaseQuery<
		CommentData[]
	>(
		'projectQuestions',
		async (supabase: TypedSupabaseClient) => {
			try {
				const { data, error } = await supabase
					.from('comments')
					.select(
						`
					*,
					author:profiles (id, full_name, image_url, email),
					project_members (role, project_id, profile_id)
				`,
					)
					.eq('project_id', projectId)
					.eq('type', 'question')
					.is('parent_comment_id', null)
					.order('created_at', { ascending: false })

				if (error) throw error

				if (!data || !data.length) {
					console.warn('No questions found for this project')
					return []
				}

				const mapped = await fetchQuestions(supabase, projectId)
				return mapped
			} catch (err) {
				console.error('Error fetching questions:', err)
				return []
			}
		},
		{
			staleTime: 1000 * 60 * 5, // 5 minutes
			additionalKeyValues: [projectId],
			initialData: initialQuestions,
		},
	)

	const { data: commentsData } = useSupabaseQuery<CommentData[]>(
		'projectComments',
		async (supabase: TypedSupabaseClient) => {
			try {
				const data = await fetchChildComments(supabase, projectId)
				if (!data || data.length === 0) {
					console.warn('No comments found for this project')
					return []
				}
				return data
			} catch (err) {
				console.error('Error fetching comments:', err)
				return []
			}
		},
		{
			staleTime: 1000 * 60 * 5,
			additionalKeyValues: [projectId],
			initialData: initialComments,
		},
	)

	useEffect(() => {
		if (!questions || !commentsData) return
		try {
			const threads = buildQuestionThreads(questions, commentsData)
			setProcessedQuestions(threads)
		} catch (err) {
			console.error('Error processing comments:', err)
		}
	}, [questions, commentsData])

	// Auto-expand questions with recent activity
	useEffect(() => {
		if (!processedQuestions || processedQuestions.length === 0) return

		const newExpandedState = { ...expandedQuestionIds }
		let hasChanges = false

		for (const question of processedQuestions) {
			if (
				question.answers &&
				question.answers.length > 0 &&
				!expandedQuestionIds[question.id]
			) {
				const hasRecentActivity = question.answers.some((answer) => {
					const answerDate = new Date(answer.created_at || '1970-01-01')
					const now = new Date()
					const hoursDiff =
						(now.getTime() - answerDate.getTime()) / (1000 * 60 * 60)
					return hoursDiff < 24 // Auto-expand if activity in last 24 hours
				})

				if (hasRecentActivity) {
					newExpandedState[question.id] = true
					hasChanges = true
				}
			}
		}

		if (hasChanges) {
			setExpandedQuestionIds(newExpandedState)
		}
	}, [processedQuestions, expandedQuestionIds])

	// Setup Supabase real-time subscriptions
	useEffect(() => {
		if (isRealtimeEnabled) {
			if (subscriptionRef.current) {
				supabase.removeChannel(subscriptionRef.current)
			}

			const channel = supabase
				.channel('comments-changes')
				.on(
					'postgres_changes',
					{
						event: '*', // Listen for all events
						schema: 'public',
						table: 'comments',
						filter: `project_id=eq.${projectId}`,
					},
					(
						payload: RealtimePostgresChangesPayload<TablesUpdate<'comments'>>,
					) => {
						console.log('Real-time update received:', payload)

						setRealtimeActivity(true)
						setTimeout(() => setRealtimeActivity(false), 3000)

						queryClient.invalidateQueries({
							queryKey: ['supabase', 'projectQuestions', projectId],
						})
						queryClient.invalidateQueries({
							queryKey: ['supabase', 'projectComments', projectId],
						})

						const eventType = payload.eventType
						const record = payload.new as Tables<'comments'> | null
						const metadata = (record?.metadata || {}) as Record<string, unknown>

						if (eventType === 'INSERT') {
							const commentType = record?.type || 'comment'

							if (record?.author_id !== effectiveUser?.id) {
								setRealtimeStatus(`New ${commentType} added to the discussion`)

								setTimeout(() => setRealtimeStatus(null), 5000)
							}
						} else if (
							eventType === 'UPDATE' &&
							metadata.status === 'resolved'
						) {
							setRealtimeStatus('A question has been marked as resolved')

							setTimeout(() => setRealtimeStatus(null), 5000)
						}
					},
				)
				.subscribe((status) => {
					console.log('Subscription status:', status)
					if (status === 'SUBSCRIBED') {
						setRealtimeStatus('Real-time connection established')
						setTimeout(() => setRealtimeStatus(null), 3000)
					}
				})

			subscriptionRef.current = channel

			return () => {
				supabase.removeChannel(channel)
			}
		}

		if (!subscriptionRef.current) {
			return
		}

		supabase.removeChannel(subscriptionRef.current)
		subscriptionRef.current = null
	}, [isRealtimeEnabled, projectId, queryClient, effectiveUser?.id])

	const checkGuestCommentLimit = () => {
		if (currentUser) return true // Logged in users don't have limits

		const remaining = getGuestRemainingComments()
		if (remaining <= 0) {
			setIsLoginDialogOpen(true)
			return false
		}
		return true
	}

	const handleGuestCommentSuccess = () => {
		if (!currentUser) {
			const newCount = incrementGuestCommentCount()
			setGuestRemainingComments(Math.max(0, 3 - newCount))
		}
	}

	const handleGoToLogin = () => {
		router.push('/login')
	}

	const handleContinueAsGuest = () => {
		setIsLoginDialogOpen(false)

		// Reset the guest comment count to allow 3 more comments
		utilResetGuestCommentCount()
		setGuestRemainingComments(3)
	}

	const handleManualRefresh = () => {
		refetchQuestions()
		setRealtimeActivity(true)
		setTimeout(() => setRealtimeActivity(false), 1000)
		setRealtimeStatus('Q&A refreshed')
		setTimeout(() => setRealtimeStatus(null), 3000)
	}

	const toggleRealtime = () => {
		setIsRealtimeEnabled(!isRealtimeEnabled)
		setRealtimeStatus(
			isRealtimeEnabled
				? 'Real-time updates disabled'
				: 'Real-time updates enabled',
		)
		setTimeout(() => setRealtimeStatus(null), 3000)
	}

	// Mutation for submitting a new question
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
		onSuccess: (newQuestion) => {
			handleGuestCommentSuccess()

			queryClient.setQueryData(
				['supabase', 'projectQuestions', projectId],
				(oldData: CommentData[] | undefined) => {
					if (!oldData) return [newQuestion]
					return [newQuestion, ...oldData]
				},
			)

			setNewQuestion('')

			queryClient.invalidateQueries({
				queryKey: ['supabase', 'projectQuestions', projectId],
			})

			setRealtimeStatus('Question submitted successfully')
			setTimeout(() => setRealtimeStatus(null), 3000)
		},
		onError: (error) => {
			console.error('Error submitting question:', error)
			setRealtimeStatus(
				`Error: ${error instanceof Error ? error.message : String(error)}`,
			)
			setTimeout(() => setRealtimeStatus(null), 5000)
		},
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

			setExpandedQuestionIds((prev) => ({
				...prev,
				[questionId]: true,
			}))

			setRealtimeStatus('Answer submitted successfully')
			setTimeout(() => setRealtimeStatus(null), 3000)
		},
		onError: (error) => {
			console.error('Error submitting answer:', error)
			setRealtimeStatus(
				`Error: ${error instanceof Error ? error.message : String(error)}`,
			)
			setTimeout(() => setRealtimeStatus(null), 5000)
		},
	})

	const submitReplyMutation = useMutation({
		mutationFn: async ({
			answerId,
			replyContent,
		}: {
			answerId: string
			replyContent: string
		}) => {
			if (!effectiveUser?.id) throw new Error('User ID is required')
			const res = await fetch('/api/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					content: replyContent,
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

			// Clear reply state
			setReplyContent({})
			setReplyingTo(null)

			// Invalidate to refetch
			queryClient.invalidateQueries({
				queryKey: ['supabase', 'projectComments', projectId],
			})

			setRealtimeStatus('Reply submitted successfully')
			setTimeout(() => setRealtimeStatus(null), 3000)
		},
		onError: (error) => {
			console.error('Error submitting reply:', error)
			setRealtimeStatus(
				`Error: ${error instanceof Error ? error.message : String(error)}`,
			)
			setTimeout(() => setRealtimeStatus(null), 5000)
		},
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

			setRealtimeStatus('Question marked as resolved')
			setTimeout(() => setRealtimeStatus(null), 3000)
		},
		onError: (error) => {
			console.error('Error marking as resolved:', error)
			setRealtimeStatus(
				`Error: ${error instanceof Error ? error.message : String(error)}`,
			)
			setTimeout(() => setRealtimeStatus(null), 5000)
		},
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

	const toggleQuestion = (id: string) => {
		setExpandedQuestionIds((prev) => ({
			...prev,
			[id]: !prev[id],
		}))
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

	return (
		<>
			<h2 className="flex justify-between items-center mb-4 text-2xl font-bold">
				<span>Community Q&A</span>
				<div className="flex gap-2 items-center">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className={`rounded-full w-9 h-9 p-0 ${realtimeActivity ? 'bg-blue-50' : ''}`}
									onClick={handleManualRefresh}
									aria-label="Refresh Q&A"
								>
									<RefreshCw
										className={`h-4 w-4 ${realtimeActivity ? 'text-blue-600 animate-spin' : ''}`}
										aria-hidden="true"
									/>
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Manually refresh Q&A</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className={`rounded-full w-9 h-9 p-0 ${isRealtimeEnabled ? 'bg-blue-50' : ''}`}
									onClick={toggleRealtime}
									aria-label={
										isRealtimeEnabled
											? 'Disable real-time updates'
											: 'Enable real-time updates'
									}
								>
									{isRealtimeEnabled ? (
										<Bell
											className="w-4 h-4 text-blue-600"
											aria-hidden="true"
										/>
									) : (
										<BellOff className="w-4 h-4" aria-hidden="true" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>
									{isRealtimeEnabled
										? 'Disable real-time updates'
										: 'Enable real-time updates'}
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</h2>

			<p className="mb-1 text-gray-500">
				Ask questions about this project and get answers from the community and
				project team members.
				{isRealtimeEnabled && (
					<span className="ml-1 text-blue-600">
						Real-time updates are enabled.
					</span>
				)}
			</p>

			{realtimeStatus && (
				<div
					className={`mb-4 py-2 px-3 text-sm rounded-md ${realtimeActivity ? 'text-blue-700 bg-blue-50' : 'text-gray-700 bg-gray-50'}`}
				>
					<div className="flex gap-2 items-center">
						{realtimeActivity && (
							<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
						)}
						{realtimeStatus}
					</div>
				</div>
			)}

			{!currentUser && guestRemainingComments > 0 && (
				<Alert
					variant="default"
					className="mb-6 text-blue-700 bg-blue-50 border-blue-200"
				>
					<AlertTitle className="flex gap-2 items-center">
						<UserIcon className="w-4 h-4" />
						Guest Mode
					</AlertTitle>
					<AlertDescription>
						You&apos;re currently browsing as a guest. You have{' '}
						{guestRemainingComments} comment
						{guestRemainingComments !== 1 ? 's' : ''} remaining.
						<Button
							variant="link"
							onClick={handleGoToLogin}
							className="p-0 ml-1 h-auto font-medium text-blue-700 underline"
						>
							Log in
						</Button>{' '}
						to participate without limits.
					</AlertDescription>
				</Alert>
			)}

			{!currentUser && guestRemainingComments === 0 && (
				<Alert
					variant="default"
					className="mb-6 text-yellow-700 bg-yellow-50 border-yellow-200"
				>
					<AlertTitle className="flex gap-2 items-center">
						<LogIn className="w-4 h-4" />
						Comment Limit Reached
					</AlertTitle>
					<AlertDescription>
						You&apos;ve reached the guest comment limit.
						<Button
							variant="link"
							onClick={handleGoToLogin}
							className="p-0 ml-1 h-auto font-medium text-yellow-700 underline"
						>
							Log in
						</Button>{' '}
						to continue participating or reset your guest session.
					</AlertDescription>
				</Alert>
			)}

			<div className="space-y-6 community-qa-container">
				<AskQuestionForm
					newQuestion={newQuestion}
					onChange={setNewQuestion}
					onSubmit={handleSubmitQuestion}
					isSubmitting={submitQuestionMutation.isPending}
					isDisabled={!currentUser && guestRemainingComments === 0}
				/>

				<Separator className="my-6" />

				<div className="space-y-6">
					<h3 className="text-xl font-semibold">Recent Questions</h3>

					{processedQuestions && processedQuestions.length > 0 ? (
						<div className="space-y-4">
							{processedQuestions.map((question) => (
								<QuestionCard
									key={question.id}
									question={question}
									effectiveUser={effectiveUser}
									expanded={!!expandedQuestionIds[question.id]}
									onToggle={toggleQuestion}
									onMarkResolved={handleMarkResolved}
									markResolvedPending={markResolvedMutation.isPending}
									replyingTo={replyingTo}
									replyContent={replyContent}
									onStartReplying={startReplyingTo}
									onCancelReply={cancelReply}
									onReplyChange={handleReplyChange}
									onSubmitReply={handleSubmitReply}
									onSubmitAnswer={handleSubmitAnswer}
									submitAnswerPending={submitAnswerMutation.isPending}
									submitReplyPending={submitReplyMutation.isPending}
									isGuestLimitReached={
										!currentUser && guestRemainingComments === 0
									}
								/>
							))}
						</div>
					) : (
						<Card className="p-6 text-center">
							<p className="text-muted-foreground">
								No questions yet. Be the first to ask a question!
							</p>
						</Card>
					)}
				</div>
			</div>
		</>
	)
}
