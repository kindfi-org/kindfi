'use client'

import { Bell, BellOff, LogIn, RefreshCw, User as UserIcon } from 'lucide-react'
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
import { useQaClient } from '~/hooks/qa/use-qa-client'
import type { QAClientProps } from '~/lib/types/project/project-qa.types'

export default function QAClient(props: QAClientProps) {
	const {
		currentUser,
		newQuestion,
		setNewQuestion,
		expandedQuestionIds,
		replyingTo,
		replyContent,
		processedQuestions,
		guestRemainingComments,
		isRealtimeEnabled,
		realtimeActivity,
		realtimeStatus,
		effectiveUser,
		handleGoToLogin,
		handleManualRefresh,
		toggleRealtime,
		submitQuestionMutation,
		submitAnswerMutation,
		submitReplyMutation,
		markResolvedMutation,
		handleSubmitQuestion,
		handleSubmitAnswer,
		handleSubmitReply,
		handleMarkResolved,
		toggleQuestion,
		handleReplyChange,
		startReplyingTo,
		cancelReply,
	} = useQaClient(props)

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
