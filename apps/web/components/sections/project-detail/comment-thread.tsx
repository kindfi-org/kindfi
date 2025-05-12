'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import { Button } from '~/components/base/button'
import type { Comment } from '~/lib/types/project/project-detail.types'
import { CommentForm } from './comment-form'
import { LikeButton } from './like-button'

interface CommentThreadProps {
	comments: Comment[]
	parentId?: string
	level?: number
	allowReplies?: boolean
}

export function CommentThread({
	comments,
	parentId = undefined,
	level = 0,
	allowReplies = true,
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

	return (
		<div className="space-y-4">
			{sortedComments.map((comment) => (
				<CommentItem
					key={comment.id}
					comment={comment}
					allComments={comments}
					level={level}
					allowReplies={allowReplies}
				/>
			))}
		</div>
	)
}

interface CommentItemProps {
	comment: Comment
	allComments: Comment[]
	level: number
	allowReplies: boolean
}

function CommentItem({
	comment,
	allComments,
	level,
	allowReplies,
}: CommentItemProps) {
	const [isExpanded, setIsExpanded] = useState(false)
	const [showReplyForm, setShowReplyForm] = useState(false)
	const [replies, setReplies] = useState<Comment[]>(
		allComments.filter((c) => c.parentId === comment.id),
	)

	// Count all replies, including nested ones
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

	const hasReplies = replyCount > 0

	const getCommentTypeClass = (type?: string) => {
		switch (type) {
			case 'question':
				return 'bg-blue-100 text-blue-800'
			case 'answer':
				return 'bg-green-100 text-green-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	const getCommentTypeText = (type?: string) => {
		switch (type) {
			case 'question':
				return 'Question'
			case 'answer':
				return 'Answer'
			default:
				return 'Comment'
		}
	}

	const handleAddReply = (content: string) => {
		const newReply: Comment = {
			id: `temp-${Date.now()}`,
			content,
			author: {
				id: 'current-user',
				name: 'You',
				avatar: '/abstract-geometric-shapes.png',
			},
			date: new Date().toISOString(),
			parentId: comment.id,
			like: 0,
		}

		setReplies((prev) => [newReply, ...prev])
		setShowReplyForm(false)
		setIsExpanded(true)
	}

	const canReply = allowReplies && level < 1

	return (
		<motion.div
			className={`${level > 0 ? 'pl-6 border-l-2 border-gray-200' : ''}`}
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
		>
			<div className="bg-white rounded-lg p-4">
				<div className="flex items-start gap-3 mb-3 flex-wrap min-w-0">
					<Avatar className="h-8 w-8">
						<AvatarImage
							src={comment.author.avatar || '/placeholder.svg'}
							alt={comment.author.name}
						/>
						<AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
					</Avatar>
					<div className="flex-1">
						<div className="flex flex-wrap items-center gap-2">
							<h4 className="font-medium">{comment.author.name}</h4>
							{comment.type && (
								<span
									className={`text-xs px-2 py-0.5 rounded-full ${getCommentTypeClass(comment.type)}`}
									aria-label={getCommentTypeText(comment.type)}
								>
									{getCommentTypeText(comment.type)}
								</span>
							)}
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
							comments={[
								...allComments,
								...replies.filter(
									(reply) => !allComments.some((c) => c.id === reply.id),
								),
							]}
							parentId={comment.id}
							level={level + 1}
							allowReplies={allowReplies && level < 2} // Limit nesting to 3 levels
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	)
}
