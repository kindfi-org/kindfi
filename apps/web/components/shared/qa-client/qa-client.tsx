'use client'

import { useRouter } from 'next/navigation'
import type { QAClientProps } from '~/lib/types/project/project-qa.types'
import { GuestAlerts } from './guest-alerts'
import { useAutoExpandQuestions } from './hooks/use-auto-expand-questions'
import { useGuestUser } from './hooks/use-guest-user'
import { useQAMutations } from './hooks/use-qa-mutations'
import { useQAQueries } from './hooks/use-qa-queries'
import { useQARealtime } from './hooks/use-qa-realtime'
import { QAHeader } from './qa-header'
import { QARealtimeStatus } from './qa-realtime-status'
import { QuestionsSection } from './questions-section'

const QAClient = ({ projectId, currentUser, initialQuestions, initialComments }: QAClientProps) => {
	const router = useRouter()

	const {
		effectiveUser,
		guestRemainingComments,
		checkGuestCommentLimit,
		handleGuestCommentSuccess,
	} = useGuestUser(currentUser)

	const { processedQuestions, setProcessedQuestions, refetchQuestions } = useQAQueries({
		projectId,
		initialQuestions,
		initialComments,
	})

	const { expandedQuestionIds, toggleQuestion, expandQuestion } =
		useAutoExpandQuestions(processedQuestions)

	const {
		isRealtimeEnabled,
		realtimeActivity,
		realtimeStatus,
		setRealtimeStatus,
		handleManualRefresh,
		toggleRealtime,
	} = useQARealtime({
		projectId,
		effectiveUserId: effectiveUser?.id,
	})

	const {
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
	} = useQAMutations({
		projectId,
		effectiveUser,
		checkGuestCommentLimit,
		handleGuestCommentSuccess,
		setProcessedQuestions,
		expandQuestion,
		setRealtimeStatus,
	})

	const handleGoToLogin = () => {
		router.push('/login')
	}

	const isGuestLimitReached = !currentUser && guestRemainingComments === 0

	return (
		<>
			<QAHeader
				realtimeActivity={realtimeActivity}
				isRealtimeEnabled={isRealtimeEnabled}
				onRefresh={() => handleManualRefresh(refetchQuestions)}
				onToggleRealtime={toggleRealtime}
			/>

			<p className="mb-1 text-gray-500">
				Ask questions about this project and get answers from the community and project team
				members.
				{isRealtimeEnabled && (
					<span className="ml-1 text-blue-600">Real-time updates are enabled.</span>
				)}
			</p>

			{realtimeStatus && <QARealtimeStatus status={realtimeStatus} isActive={realtimeActivity} />}

			{!currentUser && (
				<GuestAlerts
					guestRemainingComments={guestRemainingComments}
					onGoToLogin={handleGoToLogin}
				/>
			)}

			<QuestionsSection
				newQuestion={newQuestion}
				onQuestionChange={setNewQuestion}
				onSubmitQuestion={handleSubmitQuestion}
				isSubmittingQuestion={submitQuestionMutation.isPending}
				isQuestionDisabled={isGuestLimitReached}
				processedQuestions={processedQuestions}
				effectiveUser={effectiveUser}
				expandedQuestionIds={expandedQuestionIds}
				onToggleQuestion={toggleQuestion}
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
				isGuestLimitReached={isGuestLimitReached}
			/>
		</>
	)
}

export default QAClient
