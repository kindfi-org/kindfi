'use client'

import { ThumbsUp } from 'lucide-react'
import { Avatar, AvatarFallback } from '~/components/base/avatar'
import { AskQuestionBox } from './AskQuestionBox'

export interface Comment {
	id: number
	user: string
	text: string
	date: string
	replies?: Comment[]
	likes: number
}

interface CommentsListProps {
	comments: Comment[]
	likedComments: number[]
	onLikeToggle: (id: number) => void
	onReply: (id: number) => void
	replyToId: number | null
	onSubmitReply: (text: string) => void
}

export const CommentsList = ({
	comments,
	likedComments,
	onLikeToggle,
	onReply,
	replyToId,
	onSubmitReply,
}: CommentsListProps) => {
	return (
		<div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
			{comments.map((comment, index) => {
				const isLiked = likedComments.includes(comment.id)
				const showReplyBox = replyToId === comment.id

				return (
					<div key={comment.id}>
						<div className="flex items-start gap-3">
							<Avatar>
								<AvatarFallback>{comment.user[0]}</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<div className="flex gap-2 items-center">
									<p className="font-semibold text-sm text-black">
										{comment.user}
									</p>
									<span className="text-xs text-muted-foreground">
										{comment.date}
									</span>
								</div>
								<p className="text-sm text-gray-800 mt-1">{comment.text}</p>
								<div className="flex gap-4 items-center mt-2">
									<button
										type="button"
										onClick={() => onLikeToggle(comment.id)}
										className={`flex items-center gap-1 text-sm hover:opacity-70 ${isLiked ? 'text-primary' : 'text-black'}`}
									>
										<ThumbsUp className="h-4 w-4" />
										{comment.likes}
									</button>
									<button
										type="button"
										onClick={() => onReply(comment.id)}
										className={`text-sm hover:underline ${
											showReplyBox ? 'text-primary font-semibold' : 'text-black'
										}`}
									>
										{showReplyBox ? 'Cancel reply' : 'Reply'}
									</button>
								</div>

								{showReplyBox && (
									<div className="mt-2 pl-4 border-l-2 border-primary bg-muted/40 rounded-md py-3">
										<AskQuestionBox
											onSubmit={onSubmitReply}
											placeholder={`Replying to ${comment.user}...`}
										/>
									</div>
								)}
							</div>
						</div>

						{comment.replies?.length ? (
							<div className="mt-4 space-y-4 pl-10 border-l-2 border-muted">
								{comment.replies.map((reply) => {
									const isReplyLiked = likedComments.includes(reply.id)
									const isReplyingToReply = replyToId === reply.id

									return (
										<div
											key={reply.id}
											className="flex items-start gap-3 bg-muted/40 p-3 rounded-xl"
										>
											<Avatar className="h-6 w-6 mt-1">
												<AvatarFallback>{reply.user[0]}</AvatarFallback>
											</Avatar>
											<div className="flex-1">
												<div className="flex gap-2 items-center">
													<p className="font-semibold text-sm text-black">
														{reply.user}
													</p>
													<span className="text-xs text-muted-foreground">
														{reply.date}
													</span>
												</div>
												<p className="text-sm text-gray-800 mt-1">
													{reply.text}
												</p>
												<div className="flex gap-4 items-center mt-2">
													<button
														type="button"
														onClick={() => onLikeToggle(reply.id)}
														className={`flex items-center gap-1 text-sm hover:opacity-70 ${
															isReplyLiked ? 'text-primary' : 'text-black'
														}`}
													>
														<ThumbsUp className="h-4 w-4" />
														{reply.likes}
													</button>
													<button
														type="button"
														onClick={() => onReply(reply.id)}
														className={`text-sm hover:underline ${
															isReplyingToReply
																? 'text-primary font-semibold'
																: 'text-black'
														}`}
													>
														{isReplyingToReply ? 'Cancel reply' : 'Reply'}
													</button>
												</div>

												{isReplyingToReply && (
													<div className="mt-2 pl-4 border-l-2 border-primary bg-white rounded-md py-3">
														<AskQuestionBox
															onSubmit={onSubmitReply}
															placeholder={`Replying to ${reply.user}...`}
														/>
													</div>
												)}
											</div>
										</div>
									)
								})}
							</div>
						) : null}

						{index !== comments.length - 1 && (
							<hr className="my-6 border-gray-200" />
						)}
					</div>
				)
			})}
		</div>
	)
}
