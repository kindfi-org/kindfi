import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { Tables } from '@services/supabase'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import type { UserData } from '~/lib/types/qa'
import type { CommentData, QAProps } from '~/lib/types/qa/types'
import QAClient from './qa-client'

export default async function QA({ projectId, currentUser }: QAProps) {
	const supabase = await createSupabaseServerClient()

	const { data: initialQuestions, error: questionsError } = await supabase
		.from('comments')
		.select(
			'id, content, created_at, project_id, author_id, type, parent_comment_id, metadata',
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
			.select('*')
			.in('id', authorIds)

		const authorsMap = authors
			? authors.reduce(
					(
						acc: Record<string, Tables<'profiles'>>,
						author: Tables<'profiles'>,
					) => {
						acc[author.id] = author
						return acc
					},
					{} as Record<string, Tables<'profiles'>>,
				)
			: {}

		questionsWithAuthors = initialQuestions.map((question) => ({
			...question,
			author:
				authorsMap[question.author_id] ||
				(question.author_id?.includes('-')
					? {
							id: question.author_id,
							full_name: 'Guest User',
							is_team_member: false,
						}
					: undefined),
		})) as CommentData[]
	}

	const { data: commentsData } = await supabase
		.from('comments')
		.select('*')
		.eq('project_id', projectId)
		.not('parent_comment_id', 'is', null)
		.order('created_at', { ascending: true })

	let commentsWithAuthors: CommentData[] = []

	if (commentsData && commentsData.length > 0) {
		const authorIds = [...new Set(commentsData.map((item) => item.author_id))]

		const { data: authors } = await supabase
			.from('profiles')
			.select('*')
			.in('id', authorIds)

		const authorsMap = authors
			? authors.reduce(
					(acc: Record<string, UserData>, author: Tables<'profiles'>) => {
						acc[author.id] = author
						return acc
					},
					{} as Record<string, UserData>,
				)
			: {}

		commentsWithAuthors = commentsData.map((comment) => ({
			...comment,
			author:
				authorsMap[comment.author_id] ||
				(comment.author_id?.includes('-')
					? {
							id: comment.author_id,
							full_name: 'Guest User',
							is_team_member: false,
						}
					: undefined),
		})) as CommentData[]
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
				initialQuestions={questionsWithAuthors || []}
				initialComments={commentsWithAuthors || []}
			/>
		</Suspense>
	)
}
