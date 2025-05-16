'use client'

import { motion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/base/button'
import { CommentForm } from '~/components/sections/projects/detail/comment-form'
import { CommentThread } from '~/components/sections/projects/detail/comment-thread'
import type { Comment } from '~/lib/types/project/project-detail.types'

interface CommunityTabProps {
	comments: Comment[]
}

export function CommunityTab({ comments }: CommunityTabProps) {
	const [showQuestionForm, setShowQuestionForm] = useState(false)
	const [commentsState, setCommentsState] = useState<Comment[]>(comments)

	const handleSubmitNewQuestion = (content: string) => {
		const newQuestion: Comment = {
			id: `temp-${Date.now()}`,
			content,
			author: {
				id: 'current-user',
				name: 'You',
				avatar: '/abstract-geometric-shapes.png',
			},
			date: new Date().toISOString(),
			type: 'question',
			like: 0,
		}

		// TODO: Persist question to backend

		setCommentsState((prev) => [newQuestion, ...prev])
		setShowQuestionForm(false)
	}

	const handleAddReply = (parentId: string, content: string) => {
		const reply: Comment = {
			id: `temp-${Date.now()}`,
			content,
			author: {
				id: 'current-user',
				name: 'You',
				avatar: '/abstract-geometric-shapes.png',
			},
			type: 'answer',
			date: new Date().toISOString(),
			parentId,
			like: 0,
		}

		// TODO: Persist answer to backend

		setCommentsState((prev) => [...prev, reply])
	}

	// Get all top-level comments from the current state
	const currentTopLevelComments = commentsState.filter(
		(comment) => !comment.parentId,
	)
	const sortedCurrentComments = [...currentTopLevelComments].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	)

	return (
		<motion.div
			className="bg-white rounded-xl shadow-sm p-6"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
		>
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center flex-wrap gap-4 mb-6 min-w-0">
				<h2 className="text-2xl font-bold break-words">Community Discussion</h2>
				<Button
					onClick={() => setShowQuestionForm(!showQuestionForm)}
					className="flex items-center gap-2 gradient-btn text-white"
					aria-expanded={showQuestionForm}
				>
					<HelpCircle className="h-4 w-4" aria-hidden="true" />
					Ask a Question
				</Button>
			</div>

			{showQuestionForm && (
				<motion.div
					className="mb-8"
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.2 }}
				>
					<h3 className="font-medium mb-3">Your Question</h3>
					<CommentForm
						placeholder="What would you like to know about this project?"
						buttonText="Post Question"
						onSubmit={handleSubmitNewQuestion}
						onCancel={() => setShowQuestionForm(false)}
					/>
				</motion.div>
			)}

			{sortedCurrentComments.length === 0 ? (
				<div className="text-center py-12 text-gray-500" aria-live="polite">
					No comments yet. Be the first to ask a question!
				</div>
			) : (
				<CommentThread
					comments={commentsState}
					allowReplies={true}
					onAddReply={handleAddReply}
				/>
			)}
		</motion.div>
	)
}
