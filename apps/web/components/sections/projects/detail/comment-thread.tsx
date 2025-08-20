'use client'

import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '~/components/base/button'
import { UserAvatar } from '~/components/base/user-avatar'
import { CommentForm } from '~/components/sections/projects/detail/comment-form'
import { LikeButton } from '~/components/sections/projects/detail/like-button'
import type { Comment } from '~/lib/types/project/project-detail.types'

interface CommentThreadProps {
	comments: Comment[]
	parentId?: string
	level?: number
	allowReplies?: boolean
	onAddReply?: (parentId: string, content: string) => void
}

export function CommentThread({
	comments,
	parentId = undefined,
	level = 0,
	allowReplies = true,
	onAddReply,
}: CommentThreadProps) {
	// Filter comments to only include those that are direct replies to the parentId
	// If parentId is undefined, get top-level comments (those without a parentId)
	const filteredComments = comments.filter(
		(comment) => comment.parentId === parentId,
	)

	// Sort by date (newest first)
	const sortedComments = [...filteredComments].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	)

	if (sortedComments.length === 0) {
		return null
	}

	const canReply = allowReplies && level < 1

	return (
		<div className="space-y-4">
			{sortedComments.map((comment) => (
				<CommentItem
					key={comment.id}
					comment={comment}
					allComments={comments}
					level={level}
					canReply={canReply}
					onAddReply={onAddReply}
				/>
			))}
		</div>
	)
}

interface CommentItemProps {
	comment: Comment
	allComments: Comment[]
	level: number
	canReply: boolean
	onAddReply?: (parentId: string, content: string) => void
}

function CommentItem({
	comment,
	allComments,
	level,
	canReply,
	onAddReply,
}: CommentItemProps) {
	const [isExpanded, setIsExpanded] = useState(false)
	const [showReplyForm, setShowReplyForm] = useState(false)

	const replyCount = useMemo(() => {
		const countAllReplies = (commentId: string): number => {
			const directReplies = allComments.filter((c) => c.parentId === commentId)
			let count = directReplies.length
			for (const reply of directReplies) {
				count += countAllReplies(reply.id)
			}
			return count
		}
		return countAllReplies(comment.id)
	}, [allComments, comment.id])

	const handleAddReply = (content: string) => {
		onAddReply?.(comment.id, content)
		setShowReplyForm(false)
		setIsExpanded(true)
	}

	const hasReplies = replyCount > 0

	return (
		<motion.div
			className={clsx({
				'pl-6 border-l-2 border-gray-200': level > 0,
			})}
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
		>
			<div className="bg-white rounded-lg p-4">
				<div className="flex items-start gap-3 mb-3 flex-wrap min-w-0">
					<UserAvatar
						src={comment.author.avatar || '/images/placeholder.png'}
						alt={comment.author.name}
						name={comment.author.name}
					/>
					<div className="flex-1">
						<div className="flex flex-wrap items-center gap-2">
							<h4 className="font-medium">{comment.author.name}</h4>
						</div>
						<p className="text-xs text-gray-500">
							{new Date(comment.date).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							})}
						</p>
					</div>
				</div>

				<div className="text-sm mb-3 break-words max-w-full">
					{comment.content}
				</div>

				<div className="flex items-center gap-3 flex-wrap">
					<LikeButton initialCount={comment.like || 0} />

					{canReply && (
						<Button
							variant="ghost"
							size="sm"
							className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 h-auto rounded-full"
							onClick={() => setShowReplyForm(!showReplyForm)}
							aria-label={showReplyForm ? 'Cancel reply' : 'Reply'}
						>
							<MessageCircle className="h-3.5 w-3.5" />
							Reply
						</Button>
					)}

					{hasReplies && (
						<Button
							variant="ghost"
							size="sm"
							className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1 ml-auto px-2 py-1 h-auto rounded-full"
							onClick={() => setIsExpanded(!isExpanded)}
							aria-expanded={isExpanded}
							aria-controls={`replies-${comment.id}`}
							aria-label={
								isExpanded
									? `Hide ${replyCount} replies`
									: `View ${replyCount} replies`
							}
						>
							{isExpanded ? (
								<>
									<ChevronUp className="h-3.5 w-3.5" />
									Hide replies ({replyCount})
								</>
							) : (
								<>
									<ChevronDown className="h-3.5 w-3.5" />
									View replies ({replyCount})
								</>
							)}
						</Button>
					)}
				</div>
			</div>

			<AnimatePresence>
				{showReplyForm && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
						className="mt-3"
					>
						<CommentForm
							placeholder="Write a reply..."
							buttonText="Reply"
							onSubmit={handleAddReply}
							onCancel={() => setShowReplyForm(false)}
							isReply={true}
						/>
					</motion.div>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{isExpanded && hasReplies && (
					<motion.div
						id={`replies-${comment.id}`}
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
						className="mt-3"
					>
						<CommentThread
							comments={allComments}
							parentId={comment.id}
							level={level + 1}
							allowReplies={level + 1 < 2}
							onAddReply={onAddReply}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	)
}
