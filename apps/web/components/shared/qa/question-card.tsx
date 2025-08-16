'use client'

import {
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Loader2,
	MessageCircle,
	Reply,
} from 'lucide-react'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '~/components/base/card'
import { Textarea } from '~/components/base/textarea'
import type { CommentWithAnswers, UserData } from '~/lib/types/qa/types'
import { UserInfo } from './user-info'

export interface QuestionCardProps {
	question: CommentWithAnswers
	effectiveUser?: UserData | null
	expanded: boolean
	onToggle: (id: string) => void
	onMarkResolved: (id: string) => void
	markResolvedPending?: boolean
	replyingTo?: string | null
	replyContent: Record<string, string>
	onStartReplying: (answerId: string) => void
	onCancelReply: () => void
	onReplyChange: (id: string, value: string) => void
	onSubmitReply: (answerId: string) => void
	onSubmitAnswer: (questionId: string) => void
	submitAnswerPending?: boolean
	submitReplyPending?: boolean
	isGuestLimitReached?: boolean
}

export function QuestionCard({
	question,
	effectiveUser,
	expanded,
	onToggle,
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
}: QuestionCardProps) {
	return (
		<Card className="question-card overflow-hidden">
			<CardHeader className="pb-3">
				<div className="flex justify-between items-start">
					<UserInfo
						authorData={question.author}
						createdAt={question.created_at as string}
						size="sm"
					/>
					<div className="flex items-center gap-2">
						{(question.metadata?.is_resolved as boolean) && (
							<Badge variant="secondary" className="bg-green-50 text-green-700">
								<CheckCircle className="mr-1 h-3 w-3" aria-hidden="true" />
								Resolved \t \t
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
						onClick={() => onToggle(question.id)}
						aria-label={expanded ? 'Collapse answers' : 'Expand answers'}
					>
						<MessageCircle className="h-4 w-4" aria-hidden="true" />
						{question.answers?.length || 0}{' '}
						{question.answers?.length === 1 ? 'Answer' : 'Answers'}
						{expanded ? (
							<ChevronUp className="h-4 w-4 ml-1" aria-hidden="true" />
						) : (
							<ChevronDown className="h-4 w-4 ml-1" aria-hidden="true" />
						)}
					</Button>

					{!question.metadata?.is_resolved && effectiveUser && (
						<Button
							variant="outline"
							size="sm"
							className="rounded-full"
							onClick={() => onMarkResolved(question.id)}
							disabled={!!markResolvedPending}
							aria-label="Mark question as resolved"
						>
							{markResolvedPending ? (
								<>
									<Loader2
										className="h-3 w-3 animate-spin mr-1"
										aria-hidden="true"
									/>
									Mark Resolved
								</>
							) : (
								<>
									<CheckCircle className="mr-1 h-3 w-3" aria-hidden="true" />
									Mark Resolved
								</>
							)}
						</Button>
					)}
				</div>

				{expanded && (
					<div className="w-full border-t pt-3 mt-2">
						{question.answers && question.answers.length > 0 ? (
							<div className="answer-list space-y-4 mb-6">
								{question.answers.map((answer) => (
									<div key={answer.id} className="mb-6">
										<div
											className={`answer-item pl-4 border-l-2 ${answer.author_id ? 'border-blue-300 bg-blue-50/30' : 'border-blue-100'} py-2 rounded-r-sm`}
										>
											<div className="flex items-start gap-2">
												<div className="flex-1">
													<UserInfo
														authorData={answer.author}
														createdAt={answer.created_at as string}
														size="sm"
													/>
													<p className="mt-2 whitespace-pre-line">
														{answer.content}
													</p>
													{replyingTo !== answer.id && effectiveUser && (
														<Button
															variant="outline"
															size="sm"
															className="mt-2 flex items-center gap-1"
															onClick={() => onStartReplying(answer.id)}
															aria-label="Reply to this answer"
															disabled={!!isGuestLimitReached}
														>
															<Reply className="h-3 w-3" aria-hidden="true" />
															Reply
														</Button>
													)}
												</div>
											</div>
										</div>

										{answer.replies && answer.replies.length > 0 && (
											<div className="ml-8 mt-2">
												{answer.replies.map((reply) => (
													<div
														key={reply.id}
														className="pl-4 border-l-2 border-gray-100 py-2 mb-2 rounded-r-sm"
													>
														<div className="flex-1">
															<UserInfo
																authorData={reply.author}
																createdAt={reply.created_at as string}
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
															onReplyChange(answer.id, e.target.value)
														}
														placeholder="Write a reply..."
														className="min-h-16 text-sm w-full bg-gray-50"
													/>
													<div className="flex justify-end gap-2 mt-2">
														<Button
															size="sm"
															variant="outline"
															className="text-xs"
															onClick={onCancelReply}
															aria-label="Cancel reply"
														>
															Cancel
														</Button>
														<Button
															size="sm"
															className="bg-blue-500 hover:bg-blue-600 text-white text-xs"
															onClick={() => onSubmitReply(answer.id)}
															disabled={
																!replyContent[answer.id]?.trim() ||
																!!submitReplyPending
															}
															aria-label="Post your reply"
														>
															{submitReplyPending ? (
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
								<h4 className="text-base font-medium mb-2">Add Your Answer</h4>
								<Textarea
									value={replyContent[question.id] || ''}
									onChange={(e) => onReplyChange(question.id, e.target.value)}
									placeholder="Write your answer here..."
									className="min-h-20 text-sm w-full bg-white mb-2"
								/>
								<div className="flex justify-end mt-2">
									<Button
										size="sm"
										className="bg-blue-500 hover:bg-blue-600 text-white"
										onClick={() => onSubmitAnswer(question.id)}
										disabled={
											!replyContent[question.id]?.trim() ||
											!!submitAnswerPending ||
											!!isGuestLimitReached
										}
										aria-label="Submit your answer"
									>
										{submitAnswerPending ? (
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
	)
}

export default QuestionCard
