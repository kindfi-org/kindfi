'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import { Button } from '~/components/base/button'
import { CommentForm } from '~/components/sections/project-detail/comment-form'
import { CommentThread } from '~/components/sections/project-detail/comment-thread'
import type { Comment, Update } from '~/lib/types/project/project-detail.types'

interface UpdatesTabProps {
	updates: Update[]
}

export function UpdatesTab({ updates }: UpdatesTabProps) {
	const sortedUpdates = [...updates].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	)
	const [expandedUpdates, setExpandedUpdates] = useState<
		Record<string, boolean>
	>({})
	const [showCommentForms, setShowCommentForms] = useState<
		Record<string, boolean>
	>({})
	const [updatesState, setUpdatesState] = useState(sortedUpdates)

	const toggleComments = (updateId: string) => {
		setExpandedUpdates((prev) => ({
			...prev,
			[updateId]: !prev[updateId],
		}))
	}

	const toggleCommentForm = (updateId: string) => {
		setShowCommentForms((prev) => ({
			...prev,
			[updateId]: !prev[updateId],
		}))
	}

	const addComment = (updateId: string, content: string) => {
		const newComment: Comment = {
			id: `temp-${Date.now()}`,
			content,
			author: {
				id: 'current-user',
				name: 'You',
				avatar: '/abstract-geometric-shapes.png',
			},
			type: 'comment',
			date: new Date().toISOString(),
			like: 0,
		}

		setUpdatesState((prevUpdates) =>
			prevUpdates.map((update) => {
				if (update.id === updateId) {
					return {
						...update,
						comments: [newComment, ...update.comments],
					}
				}
				return update
			}),
		)

		// TODO: Persist comment to backend

		// Show comments after adding a new one
		setExpandedUpdates((prev) => ({
			...prev,
			[updateId]: true,
		}))

		// Hide the comment form
		setShowCommentForms((prev) => ({
			...prev,
			[updateId]: false,
		}))
	}

	const addReply = (updateId: string, reply: Comment) => {
		setUpdatesState((prevUpdates) =>
			prevUpdates.map((update) => {
				if (update.id === updateId) {
					return {
						...update,
						comments: [reply, ...update.comments],
					}
				}
				return update
			}),
		)
	}

	return (
		<motion.div
			className="bg-white rounded-xl shadow-sm p-6"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
		>
			<h2 className="text-2xl font-bold mb-6">Project Updates</h2>

			{updatesState.length === 0 ? (
				<div className="text-center py-12 text-gray-500">No updates yet</div>
			) : (
				<div className="space-y-8">
					{updatesState.map((update, index) => (
						<motion.div
							key={update.id}
							className="border border-gray-200 rounded-lg overflow-hidden"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: index * 0.1 }}
						>
							<div className="p-6">
								<h3 className="text-xl font-bold mb-4 break-words">
									{update.title}
								</h3>

								<div className="flex items-center gap-3 mb-4 min-w-0">
									<Avatar className="h-8 w-8">
										<AvatarImage
											src={update.author.avatar || '/placeholder.svg'}
											alt={update.author.name}
										/>
										<AvatarFallback>
											{update.author.name.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium text-sm break-words">
											{update.author.name}
										</p>
										<p className="text-xs text-gray-500">
											{new Date(update.date).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'long',
												day: 'numeric',
											})}
										</p>
									</div>
								</div>

								<div className="prose prose-sm sm:prose max-w-none break-words">
									<p>{update.content}</p>
								</div>

								<div className="flex flex-wrap items-center gap-3 mt-6">
									<Button
										variant="ghost"
										size="sm"
										className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
										onClick={() => toggleCommentForm(update.id)}
										aria-label={
											showCommentForms[update.id]
												? 'Cancel comment'
												: 'Add comment'
										}
									>
										<MessageCircle className="h-4 w-4" />
										{showCommentForms[update.id] ? 'Cancel' : 'Comment'}
									</Button>

									{update.comments.length > 0 && (
										<Button
											variant="ghost"
											size="sm"
											className="text-green-600 hover:text-green-700 flex items-center gap-1 ml-auto"
											onClick={() => toggleComments(update.id)}
											aria-expanded={expandedUpdates[update.id]}
											aria-controls={`comments-${update.id}`}
											aria-label={
												expandedUpdates[update.id]
													? `Hide ${update.comments.length} comments`
													: `View ${update.comments.length} comments`
											}
										>
											{expandedUpdates[update.id] ? (
												<>
													<ChevronUp className="h-4 w-4" />
													Hide comments ({update.comments.length})
												</>
											) : (
												<>
													<ChevronDown className="h-4 w-4" />
													View comments ({update.comments.length})
												</>
											)}
										</Button>
									)}
								</div>
							</div>

							<AnimatePresence>
								{showCommentForms[update.id] && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: 'auto' }}
										exit={{ opacity: 0, height: 0 }}
										transition={{ duration: 0.2 }}
										className="px-6 pb-6"
									>
										<CommentForm
											placeholder="Write a comment..."
											buttonText="Post Comment"
											onSubmit={(content) => addComment(update.id, content)}
											onCancel={() => toggleCommentForm(update.id)}
										/>
									</motion.div>
								)}
							</AnimatePresence>

							<AnimatePresence>
								{expandedUpdates[update.id] && update.comments.length > 0 && (
									<motion.div
										id={`comments-${update.id}`}
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: 'auto' }}
										exit={{ opacity: 0, height: 0 }}
										transition={{ duration: 0.2 }}
										className="bg-gray-50 p-6 border-t border-gray-200"
									>
										<h4 className="font-medium mb-4">
											Comments ({update.comments.length})
										</h4>
										<CommentThread
											comments={update.comments}
											onAddReply={(reply) => addReply(update.id, reply)}
										/>
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>
					))}
				</div>
			)}
		</motion.div>
	)
}
