/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import { createSupabaseServerClient } from '@packages/lib/supabase/server/server-client'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import QAClient from './qa-client'

/**
 * User data for Q&A system.
 */
interface UserData {
	id: string
	display_name?: string
	avatar_url?: string
	is_team_member?: boolean
}

/**
 * Comment or question data for Q&A system.
 */
interface CommentData {
	id: string
	content: string
	created_at: string
	project_id: string
	author_id: string
	type?: string
	parent_comment_id?: string | null
	author?: UserData
}

interface QAProps {
	projectId: string
	currentUser?: UserData | null
}

function ensureString(val: string | null | undefined): string {
	return val ?? ''
}

function fillGuestUser(id: string): UserData {
	return {
		id,
		display_name: 'Guest User',
		is_team_member: false,
	}
}

/**
 * Profile row returned from Supabase.
 */
type ProfileRow = {
	id: string
	display_name?: string
	image_url?: string | null
	is_team_member?: boolean
}

/**
 * Server component for Q&A, fetches initial data and renders QAClient.
 */
export default async function QA({ projectId, currentUser }: QAProps) {
	const supabase = await createSupabaseServerClient()

	const { data: initialQuestions, error: questionsError } = await supabase
		.from('comments')
		.select(
			'id, content, created_at, project_id, author_id, type, parent_comment_id',
		)
		.eq('project_id', projectId)
		.eq('type', 'question')
		.is('parent_comment_id', null)
		.order('created_at', { ascending: false })

	let questionsWithAuthors: CommentData[] = []

	if (initialQuestions && initialQuestions.length > 0) {
		const authorIds = [
			...new Set(initialQuestions.map((item) => item.author_id)),
		]

		const { data: authors } = await supabase
			.from('profiles')
			.select('id, display_name, image_url')
			.in('id', authorIds)

		const authorsMap: { [key: string]: UserData } = authors
			? authors.reduce(
					(acc: { [key: string]: UserData }, author: ProfileRow) => {
						acc[author.id] = {
							id: author.id,
							display_name: author.display_name,
							avatar_url: author.image_url ?? undefined,
							is_team_member: author.is_team_member ?? false,
						}
						return acc
					},
					{} as { [key: string]: UserData },
				)
			: {}

		questionsWithAuthors = initialQuestions
			.filter((q) => q.created_at)
			.map((question) => ({
				id: question.id,
				content: question.content,
				created_at: ensureString(question.created_at),
				project_id: question.project_id ?? '',
				author_id: question.author_id,
				type: question.type,
				parent_comment_id: question.parent_comment_id,
				author:
					authorsMap[question.author_id] ||
					(question.author_id?.includes('-')
						? fillGuestUser(question.author_id)
						: undefined),
			}))
	}

	const { data: commentsData } = await supabase
		.from('comments')
		.select(
			'id, content, created_at, project_id, author_id, type, parent_comment_id',
		)
		.eq('project_id', projectId)
		.not('parent_comment_id', 'is', null)
		.order('created_at', { ascending: true })

	let commentsWithAuthors: CommentData[] = []

	if (commentsData && commentsData.length > 0) {
		const authorIds = [...new Set(commentsData.map((item) => item.author_id))]

		const { data: authors } = await supabase
			.from('profiles')
			.select('id, display_name, image_url')
			.in('id', authorIds)

		const authorsMap: { [key: string]: UserData } = authors
			? authors.reduce(
					(acc: { [key: string]: UserData }, author: ProfileRow) => {
						acc[author.id] = {
							id: author.id,
							display_name: author.display_name,
							avatar_url: author.image_url ?? undefined,
							is_team_member: author.is_team_member ?? false,
						}
						return acc
					},
					{} as { [key: string]: UserData },
				)
			: {}

		commentsWithAuthors = commentsData
			.filter((c) => c.created_at)
			.map((comment) => ({
				id: comment.id,
				content: comment.content,
				created_at: ensureString(comment.created_at),
				project_id: comment.project_id ?? '',
				author_id: comment.author_id,
				type: comment.type,
				parent_comment_id: comment.parent_comment_id,
				author:
					authorsMap[comment.author_id] ||
					(comment.author_id?.includes('-')
						? fillGuestUser(comment.author_id)
						: undefined),
			}))
	}

	if (questionsError) {
		return (
			<div className="p-4 border border-red-300 bg-red-50 rounded-md my-4">
				<h3 className="text-red-700 font-semibold">Error Loading Q&A</h3>
				<p className="text-red-600 text-sm">
					Failed to load questions. Please try again later.
					{questionsError instanceof Error && (
						<span className="block mt-1 text-xs">
							Error details: {questionsError.message}
						</span>
					)}
				</p>
			</div>
		)
	}

	return (
		<Suspense
			fallback={
				<div className="flex justify-center items-center h-64">
					<Loader2
						className="h-8 w-8 animate-spin text-primary"
						aria-hidden="true"
					/>
					<span className="ml-2">Loading questions...</span>
				</div>
			}
		>
			<QAClient
				projectId={projectId}
				currentUser={currentUser}
				initialQuestions={questionsWithAuthors}
				initialComments={commentsWithAuthors}
			/>
		</Suspense>
	)
}
