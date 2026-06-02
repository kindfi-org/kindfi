import { useSupabaseQuery } from '@packages/lib/hooks'
import type { TypedSupabaseClient } from '@packages/lib/types'
import { useEffect, useState } from 'react'
import { logger } from '@/lib/logger'
import { fetchChildComments, fetchQuestions } from '~/lib/services/comments'
import type { CommentData, CommentWithAnswers } from '~/lib/types/project/project-qa.types'
import { buildQuestionThreads } from '~/lib/utils/qa'

interface UseQAQueriesOptions {
	projectId: string
	initialQuestions: CommentData[]
	initialComments: CommentData[]
}

export const useQAQueries = ({
	projectId,
	initialQuestions,
	initialComments,
}: UseQAQueriesOptions) => {
	const [processedQuestions, setProcessedQuestions] = useState<CommentWithAnswers[]>([])

	const { data: questions, refresh: refetchQuestions } = useSupabaseQuery<CommentData[]>(
		'projectQuestions',
		async (supabase: TypedSupabaseClient) => {
			try {
				const { data, error } = await supabase
					.from('comments')
					.select(
						`
					*,
					author:profiles (id, full_name, image_url, email),
					project_members (role, project_id, profile_id)
				`,
					)
					.eq('project_id', projectId)
					.eq('type', 'question')
					.is('parent_comment_id', null)
					.order('created_at', { ascending: false })

				if (error) throw error

				if (!data || !data.length) {
					logger.warn('No questions found for this project')
					return []
				}

				const mapped = await fetchQuestions(supabase, projectId)
				return mapped
			} catch (err) {
				logger.error('Error fetching questions:', err)
				return []
			}
		},
		{
			staleTime: 1000 * 60 * 5,
			additionalKeyValues: [projectId],
			initialData: initialQuestions,
		},
	)

	const { data: commentsData } = useSupabaseQuery<CommentData[]>(
		'projectComments',
		async (supabase: TypedSupabaseClient) => {
			try {
				const data = await fetchChildComments(supabase, projectId)
				if (!data || data.length === 0) {
					logger.warn('No comments found for this project')
					return []
				}
				return data
			} catch (err) {
				logger.error('Error fetching comments:', err)
				return []
			}
		},
		{
			staleTime: 1000 * 60 * 5,
			additionalKeyValues: [projectId],
			initialData: initialComments,
		},
	)

	useEffect(() => {
		if (!questions || !commentsData) return
		try {
			const threads = buildQuestionThreads(questions, commentsData)
			setProcessedQuestions(threads)
		} catch (err) {
			logger.error('Error processing comments:', err)
		}
	}, [questions, commentsData])

	return {
		questions,
		commentsData,
		processedQuestions,
		setProcessedQuestions,
		refetchQuestions,
	}
}
