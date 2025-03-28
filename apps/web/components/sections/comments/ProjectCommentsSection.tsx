'use client'

import { useState } from 'react'
import { AskQuestionBox } from './AskQuestionBox'
import { CommentsList } from './CommentsList'
import { LoadMoreButton } from './LoadMoreButton'

export interface Comment {
	id: number
	user: string
	text: string
	date: string
	replies?: Comment[]
	likes: number
}

const initialComments: Comment[] = [
	{
		id: 1,
		user: 'James Hughes',
		text: 'I like the way those things spin.',
		date: '2 days ago',
		likes: 3,
		replies: [],
	},
	{
		id: 2,
		user: 'David Keiser',
		text: 'Storage for renewables is our biggest challenge.',
		date: '2 days ago',
		likes: 12,
		replies: [
			{
				id: 3,
				user: 'Michael Chen',
				text: 'Exactly! Tech helps solve it.',
				date: '1 days ago',
				likes: 5,
			},
		],
	},
	{
		id: 4,
		user: 'Laura Martínez',
		text: 'Exciting innovation!',
		date: '2 day ago',
		likes: 7,
		replies: [],
	},
	{
		id: 5,
		user: 'Jordan Madrigal',
		text: 'wow',
		date: '5 day ago',
		likes: 7,
		replies: [],
	},
]

export const ProjectCommentsSection = () => {
	const [comments, setComments] = useState<Comment[]>(initialComments)
	const [likedComments, setLikedComments] = useState<number[]>([])
	const [replyToId, setReplyToId] = useState<number | null>(null)
	const [visibleCount, setVisibleCount] = useState<number>(3)
	const [text, setText] = useState<string>('')

	const visibleComments = comments.slice(0, visibleCount)

	const getTotalCommentCount = () =>
		comments.reduce(
			(total, comment) => total + 1 + (comment.replies?.length || 0),
			0,
		)

	const handleSubmit = (submittedText: string) => {
		const newComment: Comment = {
			id: Date.now(),
			user: 'Kamado',
			text: submittedText,
			date: 'Just now',
			likes: 0,
			replies: [],
		}

		if (replyToId === null) {
			setComments((prev) => [newComment, ...prev])
		} else {
			const addReplyRecursively = (items: Comment[]): Comment[] =>
				items.map((item) => {
					if (item.id === replyToId) {
						return { ...item, replies: [...(item.replies || []), newComment] }
					}

					if (item.replies && item.replies.length > 0) {
						return {
							...item,
							replies: addReplyRecursively(item.replies),
						}
					}

					return item
				})

			setComments((prev) => addReplyRecursively(prev))
			setReplyToId(null)
		}

		setText('')
		setVisibleCount((prev) => Math.max(prev, comments.length + 1))
	}

	const handleLikeToggle = (id: number) => {
		const hasLiked = likedComments.includes(id)

		const updatedComments = comments.map((comment) => {
			if (comment.id === id) {
				return { ...comment, likes: comment.likes + (hasLiked ? -1 : 1) }
			}

			const updatedReplies = comment.replies?.map((reply) =>
				reply.id === id
					? { ...reply, likes: reply.likes + (hasLiked ? -1 : 1) }
					: reply,
			)

			return { ...comment, replies: updatedReplies || comment.replies }
		})

		setComments(updatedComments)
		setLikedComments((prev) =>
			hasLiked ? prev.filter((likedId) => likedId !== id) : [...prev, id],
		)
	}

	const handleReply = (id: number) => {
		setReplyToId((prev) => (prev === id ? null : id))
	}

	const handleLoadMore = () => {
		setVisibleCount((prev) => prev + 3)
	}

	const handleShowLess = () => {
		setVisibleCount(3)
	}

	return (
		<div className="relative pb-32 max-w-3xl mx-auto px-4 sm:px-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-bold text-foreground">Comments</h2>
				<span className="text-sm font-medium border border-border rounded-full px-3 py-1 text-foreground">
					{getTotalCommentCount()} comments
				</span>
			</div>

			{replyToId === null && (
				<div className="mb-6 border border-gray-200 rounded-xl p-4 bg-white">
					<textarea
						placeholder="Ask a question or leave a comment..."
						value={text}
						onChange={(e) => setText(e.target.value)}
						className="w-full border rounded-md px-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
					/>
					<div className="flex justify-end mt-2">
						<button
							type="button"
							onClick={() => handleSubmit(text)}
							className="text-sm font-medium text-white bg-primary px-4 py-1.5 rounded-md hover:bg-primary/90"
						>
							Submit
						</button>
					</div>
				</div>
			)}

			<CommentsList
				comments={visibleComments}
				likedComments={likedComments}
				onLikeToggle={handleLikeToggle}
				onReply={handleReply}
				replyToId={replyToId}
				onSubmitReply={handleSubmit}
			/>

			<div className="flex justify-center gap-4 mt-6">
				{visibleCount < comments.length && (
					<LoadMoreButton onClick={handleLoadMore} label="Load More Comments" />
				)}
				{visibleCount > 3 && (
					<LoadMoreButton onClick={handleShowLess} label="Show Less" />
				)}
			</div>
		</div>
	)
}
