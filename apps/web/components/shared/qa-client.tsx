// ! SPLIT THIS COMPONENT... ⚠️
'use client'

import { useSupabaseQuery } from '@packages/lib/hooks/use-supabase-query.hook'
import { createSupabaseBrowserClient } from '@packages/lib/supabase/client/browser-client'
import type { TypedSupabaseClient } from '@packages/lib/types/supabase-client.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { supabase } from '@packages/lib/supabase'
import type { Tables, TablesUpdate } from '@services/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import {
	Bell,
	BellOff,
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Loader2,
	LogIn,
	MessageCircle,
	RefreshCw,
	Reply,
	User as UserIcon,
} from 'lucide-react'
import { useAsync, useAsyncFn } from 'react-use'
import { Alert, AlertDescription, AlertTitle } from '~/components/base/alert'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
// Import shadcn UI components
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '~/components/base/dialog'
import { Separator } from '~/components/base/separator'
import { Textarea } from '~/components/base/textarea'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/base/tooltip'
import type {
	CommentData,
	CommentWithAnswers,
	QAClientProps,
	UserData,
} from '~/lib/types/qa/types'

// Helper functions for guest users
const getGuestUserId = () => {
	if (typeof window === 'undefined') return null

	let guestUserId = localStorage.getItem('guestUserId')
	if (!guestUserId) {
		guestUserId = uuidv4()
		localStorage.setItem('guestUserId', guestUserId)
		localStorage.setItem('guestCommentCount', '0')
	}
	return guestUserId
}

const getGuestRemainingComments = () => {
	if (typeof window === 'undefined') return 3

	const count = Number.parseInt(
		localStorage.getItem('guestCommentCount') || '0',
		10,
	)
	return Math.max(0, 3 - count)
}

const incrementGuestCommentCount = () => {
	if (typeof window === 'undefined') return 0

	const currentCount = Number.parseInt(
		localStorage.getItem('guestCommentCount') || '0',
		10,
	)
	const newCount = currentCount + 1
	localStorage.setItem('guestCommentCount', newCount.toString())
	return newCount
}

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

	const {
		data: questions,
		isLoading: questionsLoading,
		error: questionsError,
		refresh: refetchQuestions,
	} = useSupabaseQuery<CommentData[]>(
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

				return data.map((item) => ({
					...item,
					created_at: item.created_at || new Date().toISOString(),
					author: item.author_id?.includes('-')
						? {
								id: item.author_id,
								full_name: 'Guest User',
								is_team_member: false,
							}
						: undefined,
				})) as CommentData[]
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

	const {
		data: commentsData,
		isLoading: commentsLoading,
		error: commentsError,
	} = useSupabaseQuery<CommentData[]>(
		'projectComments',
		async (supabase: TypedSupabaseClient) => {
			try {
				// Get comments without the join
				const { data, error } = await supabase
					.from('comments')
					.select('*')
					.eq('project_id', projectId)
					.not('parent_comment_id', 'is', null) // Only get comments with a parent
					.order('created_at', { ascending: true })

				if (error) throw error
				if (!data || data.length === 0) {
					console.warn('No comments found for this project')
					return []
				}

				// Get unique author IDs
				const authorIds = [...new Set(data.map((item) => item.author_id))]

				const { data: authors, error: authorsError } = await supabase
					.from('profiles')
					.select('*')
					.in('id', authorIds)

				if (authorsError) {
					console.error('Error fetching authors:', authorsError)
					return data.map((item) => ({
						...item,
						created_at: item.created_at || new Date().toISOString(),
						author: null,
					})) as unknown as CommentData[]
				}

				if (authors) {
					const authorsMap = authors.reduce(
						(acc: Record<string, UserData>, author: UserData) => {
							acc[author.id] = author
							return acc
						},
						{} as Record<string, UserData>,
					)

					return data.map((comment) => ({
						...comment,
						created_at: comment.created_at || new Date().toISOString(),
						author:
							authorsMap[comment.author_id] ||
							(comment.author_id?.includes('-')
								? {
										id: comment.author_id,
										full_name: 'Guest User',
										is_team_member: false,
									}
								: null),
					})) as CommentData[]
				}

				return data.map((item) => ({
					...item,
					created_at: item.created_at || new Date().toISOString(),
				})) as CommentData[]
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
			const answers = commentsData.filter(
				(comment) => comment.type === 'answer',
			)
			const replies = commentsData.filter(
				(comment) => comment.type === 'comment',
			)

			// Build the threaded structure
			const questionsWithAnswers = questions.map((question) => {
				const questionAnswers = answers
					.filter((answer) => answer.parent_comment_id === question.id)
					.map((answer) => {
						const answerReplies = replies.filter(
							(reply) => reply.parent_comment_id === answer.id,
						)
						const metadata = (question?.metadata || {}) as Record<
							string,
							unknown
						>

						return {
							...answer,
							replies: answerReplies,
							metadata,
						}
					})

				const metadata = (question?.metadata || {}) as Record<string, unknown>
				return {
					...question,
					answers: questionAnswers,
					metadata,
				}
			})

			setProcessedQuestions(questionsWithAnswers)
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
						} else if (eventType === 'UPDATE' && metadata.is_resolved) {
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
		if (typeof window !== 'undefined') {
			localStorage.setItem('guestCommentCount', '0')
			setGuestRemainingComments(3)
		}
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
			if (!effectiveUser?.id) {
				throw new Error('User ID is required')
			}

			const commentId = uuidv4()

			const { data, error } = await supabase
				.from('comments')
				.insert({
					id: commentId,
					content: questionContent,
					project_id: projectId,
					author_id: effectiveUser.id,
					type: 'question',
					is_resolved: false,
					parent_comment_id: null,
				})
				.select()
				.single()

			if (error) throw error
			return data
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
			if (!effectiveUser?.id) {
				throw new Error('User ID is required')
			}

			const commentId = uuidv4()

			const { data, error } = await supabase
				.from('comments')
				.insert({
					id: commentId,
					content: answerContent,
					project_id: projectId,
					author_id: effectiveUser.id,
					type: 'answer',
					parent_comment_id: questionId,
					is_resolved: false,
				})
				.select()
				.single()

			if (error) throw error
			return { data, questionId }
		},
		onSuccess: ({ data: newAnswer, questionId }) => {
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
			if (!effectiveUser?.id) {
				throw new Error('User ID is required')
			}

			const commentId = uuidv4()

			const { data, error } = await supabase
				.from('comments')
				.insert({
					id: commentId,
					content: replyContent,
					project_id: projectId,
					author_id: effectiveUser.id,
					type: 'comment',
					parent_comment_id: answerId,
					is_resolved: false,
				})
				.select()
				.single()

			if (error) throw error
			return data
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
			if (!effectiveUser?.id) {
				throw new Error('User ID is required')
			}

			const { data, error } = await supabase
				.from('comments')
				.update({ is_resolved: true } as TablesUpdate<'comments'>)
				.eq('id', questionId)
				.select()
				.single()

			if (error) throw error
			return data
		},
		onSuccess: (updatedQuestion) => {
			queryClient.setQueryData(
				['supabase', 'projectQuestions', projectId],
				(oldData: CommentData[] | undefined) => {
					if (!oldData) return []
					return oldData.map((q) =>
						q.id === updatedQuestion.id ? { ...q, is_resolved: true } : q,
					)
				},
			)

			setProcessedQuestions((prev) =>
				prev.map((q) =>
					q.id === updatedQuestion.id ? { ...q, is_resolved: true } : q,
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
			<h2 className="text-2xl font-bold mb-4 flex items-center justify-between">
				<span>Community Q&A</span>
				<div className="flex items-center gap-2 ">
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
										className={`h-4 w-4 ${realtimeActivity ? 'animate-spin text-blue-600' : ''}`}
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
											className="h-4 w-4 text-blue-600"
											aria-hidden="true"
										/>
									) : (
										<BellOff className="h-4 w-4" aria-hidden="true" />
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

			<p className="text-gray-500 mb-1">
				Ask questions about this project and get answers from the community and
				project team members.
				{isRealtimeEnabled && (
					<span className="text-blue-600 ml-1">
						Real-time updates are enabled.
					</span>
				)}
			</p>

			{realtimeStatus && (
				<div
					className={`mb-4 py-2 px-3 text-sm rounded-md ${realtimeActivity ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'}`}
				>
					<div className="flex items-center gap-2">
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
					className="mb-6 bg-blue-50 text-blue-700 border-blue-200"
				>
					<AlertTitle className="flex items-center gap-2">
						<UserIcon className="h-4 w-4" />
						Guest Mode
					</AlertTitle>
					<AlertDescription>
						You're currently browsing as a guest. You have{' '}
						{guestRemainingComments} comment
						{guestRemainingComments !== 1 ? 's' : ''} remaining.
						<Button
							variant="link"
							onClick={handleGoToLogin}
							className="p-0 h-auto text-blue-700 font-medium underline ml-1"
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
					className="mb-6 bg-yellow-50 text-yellow-700 border-yellow-200"
				>
					<AlertTitle className="flex items-center gap-2">
						<LogIn className="h-4 w-4" />
						Comment Limit Reached
					</AlertTitle>
					<AlertDescription>
						You've reached the guest comment limit.
						<Button
							variant="link"
							onClick={handleGoToLogin}
							className="p-0 h-auto text-yellow-700 font-medium underline ml-1"
						>
							Log in
						</Button>{' '}
						to continue participating or reset your guest session.
					</AlertDescription>
				</Alert>
			)}

			<div className="community-qa-container space-y-6">
				<Card className="border-0 shadow-sm">
					<CardHeader className="pb-3">
						<CardTitle className="text-lg">Ask a Question</CardTitle>
						<CardDescription>
							Your question will be visible to the project team and community
							members.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Textarea
							value={newQuestion}
							onChange={(e) => setNewQuestion(e.target.value)}
							placeholder="What would you like to know about this project?"
							className="min-h-24 focus:border-primary"
						/>
					</CardContent>
					<CardFooter className="flex justify-end gap-2">
						<Button
							onClick={handleSubmitQuestion}
							disabled={
								!newQuestion.trim() ||
								submitQuestionMutation.isPending ||
								(!currentUser && guestRemainingComments === 0)
							}
							className="bg-blue-500 hover:bg-blue-600 text-white rounded-full"
							aria-label="Submit your question"
						>
							{submitQuestionMutation.isPending ? (
								<>
									<Loader2
										className="mr-2 h-4 w-4 animate-spin"
										aria-hidden="true"
									/>
									Submitting...
								</>
							) : (
								'Submit Question'
							)}
						</Button>
					</CardFooter>
				</Card>

				<Separator className="my-6" />

				<div className="space-y-6">
					<h3 className="text-xl font-semibold">Recent Questions</h3>

					{processedQuestions && processedQuestions.length > 0 ? (
						<div className="space-y-4">
							{processedQuestions.map((question) => (
								<Card
									key={question.id}
									className="question-card overflow-hidden"
								>
									<CardHeader className="pb-3">
										<div className="flex justify-between items-start">
											<RenderUserInfo
												authorData={question.author}
												createdAt={question.created_at as string}
												size="sm"
											/>
											<div className="flex items-center gap-2">
												{(question.metadata?.is_resolved as boolean) && (
													<Badge
														variant="secondary"
														className="bg-green-50 text-green-700"
													>
														<CheckCircle
															className="mr-1 h-3 w-3"
															aria-hidden="true"
														/>
														Resolved
													</Badge>
												)}
											</div>
										</div>
									</CardHeader>
									<CardContent className="pb-3">
										<p className="whitespace-pre-line">{question.content}</p>
									</CardContent>
									<CardFooter className="flex flex-col items-start pt-0">
										<div className="w-full flex justify-between items-center mb-3">
											<Button
												variant="outline"
												size="sm"
												className="flex items-center gap-1 text-sm rounded-full"
												onClick={() => toggleQuestion(question.id)}
												aria-label={
													expandedQuestionIds[question.id]
														? 'Collapse answers'
														: 'Expand answers'
												}
											>
												<MessageCircle className="h-4 w-4" aria-hidden="true" />
												{question.answers?.length || 0}{' '}
												{question.answers?.length === 1 ? 'Answer' : 'Answers'}
												{expandedQuestionIds[question.id] ? (
													<ChevronUp
														className="h-4 w-4 ml-1"
														aria-hidden="true"
													/>
												) : (
													<ChevronDown
														className="h-4 w-4 ml-1"
														aria-hidden="true"
													/>
												)}
											</Button>

											{!question.metadata?.is_resolved && effectiveUser && (
												<Button
													variant="outline"
													size="sm"
													className="rounded-full"
													onClick={() => handleMarkResolved(question.id)}
													disabled={markResolvedMutation.isPending}
													aria-label="Mark question as resolved"
												>
													{markResolvedMutation.isPending ? (
														<>
															<Loader2
																className="h-3 w-3 animate-spin mr-1"
																aria-hidden="true"
															/>
															Mark Resolved
														</>
													) : (
														<>
															<CheckCircle
																className="mr-1 h-3 w-3"
																aria-hidden="true"
															/>
															Mark Resolved
														</>
													)}
												</Button>
											)}
										</div>

										{expandedQuestionIds[question.id] && (
											<div className="w-full border-t pt-3 mt-2">
												{question.answers && question.answers.length > 0 ? (
													<div className="answer-list space-y-4 mb-6">
														{question.answers.map((answer) => (
															<div key={answer.id} className="mb-6">
																<div
																	// TODO: condition won't work. Create relationship of user role within project. Using author_id for now.
																	className={`answer-item pl-4 border-l-2 ${answer.author_id ? 'border-blue-300 bg-blue-50/30' : 'border-blue-100'} py-2 rounded-r-sm`}
																>
																	<div className="flex items-start gap-2">
																		<div className="flex-1">
																			<RenderUserInfo
																				authorData={answer.author}
																				createdAt={answer.created_at as string}
																				size="sm"
																			/>
																			<p className="mt-2 whitespace-pre-line">
																				{answer.content}
																			</p>
																			{replyingTo !== answer.id &&
																				effectiveUser && (
																					<Button
																						variant="outline"
																						size="sm"
																						className="mt-2 flex items-center gap-1"
																						onClick={() =>
																							startReplyingTo(answer.id)
																						}
																						aria-label="Reply to this answer"
																						disabled={
																							!currentUser &&
																							guestRemainingComments === 0
																						}
																					>
																						<Reply
																							className="h-3 w-3"
																							aria-hidden="true"
																						/>
																						Reply
																					</Button>
																				)}
																		</div>
																	</div>
																</div>

																{answer.replies &&
																	answer.replies.length > 0 && (
																		<div className="ml-8 mt-2">
																			{answer.replies.map((reply) => (
																				<div
																					key={reply.id}
																					className="pl-4 border-l-2 border-gray-100 py-2 mb-2 rounded-r-sm"
																				>
																					<div className="flex-1">
																						<RenderUserInfo
																							authorData={reply.author}
																							createdAt={
																								reply.created_at as string
																							}
																							size="sm"
																						/>
																						<p className="mt-2 whitespace-pre-line text-sm">
																							{reply.content}
																						</p>
																					</div>
																				</div>
																			))}
																		</div>
																	)}

																{replyingTo === answer.id && effectiveUser && (
																	<div className="reply-form ml-8 mt-2 mb-4">
																		<div className="pl-4 border-l-2 border-gray-100 py-2">
																			<Textarea
																				value={replyContent[answer.id] || ''}
																				onChange={(e) =>
																					handleReplyChange(
																						answer.id,
																						e.target.value,
																					)
																				}
																				placeholder="Write a reply..."
																				className="min-h-16 text-sm w-full bg-gray-50"
																			/>
																			<div className="flex justify-end gap-2 mt-2">
																				<Button
																					size="sm"
																					variant="outline"
																					className="text-xs"
																					onClick={cancelReply}
																					aria-label="Cancel reply"
																				>
																					Cancel
																				</Button>
																				<Button
																					size="sm"
																					className="bg-blue-500 hover:bg-blue-600 text-white text-xs"
																					onClick={() =>
																						handleSubmitReply(answer.id)
																					}
																					disabled={
																						!replyContent[answer.id]?.trim() ||
																						submitReplyMutation.isPending
																					}
																					aria-label="Post your reply"
																				>
																					{submitReplyMutation.isPending ? (
																						<>
																							<Loader2
																								className="mr-1 h-3 w-3 animate-spin"
																								aria-hidden="true"
																							/>
																							Submitting...
																						</>
																					) : (
																						'Post Reply'
																					)}
																				</Button>
																			</div>
																		</div>
																	</div>
																)}
															</div>
														))}
													</div>
												) : (
													<p className="text-muted-foreground text-sm mb-4">
														No answers yet. Be the first to answer!
													</p>
												)}

												{effectiveUser && (
													<div className="answer-form w-full border p-4 rounded-md bg-gray-50">
														<h4 className="text-base font-medium mb-2">
															Add Your Answer
														</h4>
														<Textarea
															value={replyContent[question.id] || ''}
															onChange={(e) =>
																handleReplyChange(question.id, e.target.value)
															}
															placeholder="Write your answer here..."
															className="min-h-20 text-sm w-full bg-white mb-2"
														/>
														<div className="flex justify-end mt-2">
															<Button
																size="sm"
																className="bg-blue-500 hover:bg-blue-600 text-white"
																onClick={() => handleSubmitAnswer(question.id)}
																disabled={
																	!replyContent[question.id]?.trim() ||
																	submitAnswerMutation.isPending ||
																	(!currentUser && guestRemainingComments === 0)
																}
																aria-label="Submit your answer"
															>
																{submitAnswerMutation.isPending ? (
																	<>
																		<Loader2
																			className="mr-1 h-3 w-3 animate-spin"
																			aria-hidden="true"
																		/>
																		Submitting...
																	</>
																) : (
																	'Submit Answer'
																)}
															</Button>
														</div>
													</div>
												)}
											</div>
										)}
									</CardFooter>
								</Card>
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

			<Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Comment Limit Reached</DialogTitle>
						<DialogDescription>
							You've used all 3 comments available in guest mode. Would you like
							to log in or continue as a guest with a fresh session?
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-center my-4">
						<div className="bg-blue-50 p-4 rounded-lg text-center w-full">
							<p className="text-blue-700 font-medium mb-2">
								Create an account to:
							</p>
							<ul className="text-blue-600 text-sm text-left list-disc pl-4 mb-2">
								<li>Participate without limits</li>
								<li>Track your contributions</li>
								<li>Get notifications on replies</li>
								<li>Build your community profile</li>
							</ul>
						</div>
					</div>
					<DialogFooter className="flex sm:justify-between">
						<Button
							type="button"
							variant="outline"
							onClick={handleContinueAsGuest}
							className="flex items-center gap-1 sm:mt-0 mt-2 w-full sm:w-auto"
						>
							<UserIcon className="h-4 w-4" />
							Continue as Guest
						</Button>
						<Button
							type="button"
							onClick={handleGoToLogin}
							className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1 w-full sm:w-auto"
						>
							<LogIn className="h-4 w-4" />
							Log In / Sign Up
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}

function RenderUserInfo({
	authorData,
	createdAt,
	size = 'md',
}: {
	size: 'sm' | 'md'
	createdAt: string
	authorData?: UserData
}) {
	if (!authorData) {
		return null
	}

	const avatarSize = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'
	const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
	const nameSize = size === 'sm' ? 'text-sm' : 'text-base'
	const timeSize = size === 'sm' ? 'text-xs' : 'text-sm'

	return (
		<div className="flex items-center gap-2">
			<Avatar className={avatarSize}>
				{authorData?.image_url ? (
					<AvatarImage src={authorData?.image_url} alt="User avatar" />
				) : (
					<AvatarFallback>
						<UserIcon className={iconSize} aria-hidden="true" />
					</AvatarFallback>
				)}
			</Avatar>
			<div>
				<div className="flex items-center">
					<p className={`font-medium ${nameSize}`}>
						{authorData?.display_name ||
							`User ${authorData?.id?.substring(0, 6)}`}
					</p>
					{/* TODO: Add user role relationship to project. For now using role */}
					{authorData?.role && (
						<Badge
							variant="outline"
							className="ml-2 text-xs py-0 h-5 bg-blue-50 text-blue-700 border-blue-200"
						>
							{authorData?.role}
						</Badge>
					)}
				</div>
				<p className={`text-muted-foreground ${timeSize}`}>
					{formatDistanceToNow(new Date(createdAt), {
						addSuffix: true,
					})}
				</p>
			</div>
		</div>
	)
}
