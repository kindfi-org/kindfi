'use client'

import { Card } from '~/components/base/card'
import { Separator } from '~/components/base/separator'
import { AskQuestionForm } from '~/components/shared/qa/ask-question-form'
import { QuestionCard } from '~/components/shared/qa/question-card'
import type {
	CommentWithAnswers,
	UserData,
} from '~/lib/types/project/project-qa.types'

interface QuestionsSectionProps {
	newQuestion: string
	onQuestionChange: (value: string) => void
	onSubmitQuestion: () => void
	isSubmittingQuestion: boolean
	isQuestionDisabled: boolean
	processedQuestions: CommentWithAnswers[]
	effectiveUser: UserData
	expandedQuestionIds: Record<string, boolean>
	onToggleQuestion: (id: string) => void
	onMarkResolved: (questionId: string) => void
	markResolvedPending: boolean
	replyingTo: string | null
	replyContent: Record<string, string>
	onStartReplying: (answerId: string) => void
	onCancelReply: () => void
	onReplyChange: (id: string, content: string) => void
	onSubmitReply: (answerId: string) => void
	onSubmitAnswer: (questionId: string) => void
	submitAnswerPending: boolean
	submitReplyPending: boolean
	isGuestLimitReached: boolean
}

export const QuestionsSection = ({
	newQuestion,
	onQuestionChange,
	onSubmitQuestion,
	isSubmittingQuestion,
	isQuestionDisabled,
	processedQuestions,
	effectiveUser,
	expandedQuestionIds,
	onToggleQuestion,
	onMarkResolved,
	markResolvedPending,
	replyingTo,
	replyContent,
	onStartReplying,
	onCancelReply,
	onReplyChange,
	onSubmitReply,
	onSubmitAnswer,
	submitAnswerPending,
	submitReplyPending,
	isGuestLimitReached,
}: QuestionsSectionProps) => {
	return (
		<div className="space-y-6 community-qa-container">
			<AskQuestionForm
				newQuestion={newQuestion}
				onChange={onQuestionChange}
				onSubmit={onSubmitQuestion}
				isSubmitting={isSubmittingQuestion}
				isDisabled={isQuestionDisabled}
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
								onToggle={onToggleQuestion}
								onMarkResolved={onMarkResolved}
								markResolvedPending={markResolvedPending}
								replyingTo={replyingTo}
								replyContent={replyContent}
								onStartReplying={onStartReplying}
								onCancelReply={onCancelReply}
								onReplyChange={onReplyChange}
								onSubmitReply={onSubmitReply}
								onSubmitAnswer={onSubmitAnswer}
								submitAnswerPending={submitAnswerPending}
								submitReplyPending={submitReplyPending}
								isGuestLimitReached={isGuestLimitReached}
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
	)
}
