import { useEffect, useState } from 'react'
import type { CommentWithAnswers } from '~/lib/types/project/project-qa.types'

export const useAutoExpandQuestions = (
	processedQuestions: CommentWithAnswers[],
) => {
	const [expandedQuestionIds, setExpandedQuestionIds] = useState<
		Record<string, boolean>
	>({})

	useEffect(() => {
		if (!processedQuestions || processedQuestions.length === 0) return

		const newExpandedState = { ...expandedQuestionIds }
		let hasChanges = false

		for (const question of processedQuestions) {
			if (
				question.answers &&
				question.answers.length > 0 &&
				!expandedQuestionIds[question.id]
			) {
				const hasRecentActivity = question.answers.some((answer) => {
					const answerDate = new Date(answer.created_at || '1970-01-01')
					const now = new Date()
					const hoursDiff =
						(now.getTime() - answerDate.getTime()) / (1000 * 60 * 60)
					return hoursDiff < 24
				})

				if (hasRecentActivity) {
					newExpandedState[question.id] = true
					hasChanges = true
				}
			}
		}

		if (hasChanges) {
			setExpandedQuestionIds(newExpandedState)
		}
	}, [processedQuestions, expandedQuestionIds])

	const toggleQuestion = (id: string) => {
		setExpandedQuestionIds((prev) => ({
			...prev,
			[id]: !prev[id],
		}))
	}

	const expandQuestion = (questionId: string) => {
		setExpandedQuestionIds((prev) => ({
			...prev,
			[questionId]: true,
		}))
	}

	return {
		expandedQuestionIds,
		setExpandedQuestionIds,
		toggleQuestion,
		expandQuestion,
	}
}
