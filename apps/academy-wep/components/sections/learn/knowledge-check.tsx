'use client'

import { Check, X } from 'lucide-react'
import { useState } from 'react'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { Label } from '~/components/base/label'
import { RadioGroup, RadioGroupItem } from '~/components/base/radio-group'
import type { QuizQuestion } from '~/lib/types/learn/lesson.types'
import { cn } from '~/lib/utils'

interface KnowledgeCheckProps {
	questions: QuizQuestion[]
	onQuizComplete: () => void
}

export function KnowledgeCheck({
	questions,
	onQuizComplete,
}: KnowledgeCheckProps) {
	const [answers, setAnswers] = useState<Record<number, number | null>>({})
	const [isFailedAttempt, setIsFailedAttempt] = useState(false)

	const handleAnswerChange = (questionId: number, answerIndex: number) => {
		setAnswers((prev) => {
			const updatedAnswers = {
				...prev,
				[questionId]: answerIndex,
			}

			const allAnswered = questions.every(
				(q) =>
					updatedAnswers[q.id] !== undefined && updatedAnswers[q.id] !== null,
			)
			const allCorrect = questions.every(
				(q) => updatedAnswers[q.id] === q.correctAnswer,
			)

			if (allAnswered) {
				if (allCorrect) {
					onQuizComplete()
					setIsFailedAttempt(false)
				} else {
					setIsFailedAttempt(true)
				}
			} else {
				setIsFailedAttempt(false)
			}

			return updatedAnswers
		})
	}

	const isAnswerCorrect = (questionId: number, answerIndex: number) => {
		const question = questions.find((q) => q.id === questionId)
		return question?.correctAnswer === answerIndex
	}

	const isQuestionAnswered = (questionId: number) => {
		return answers[questionId] !== undefined && answers[questionId] !== null
	}

	return (
		<Card className="mt-6 shadow-md">
			<CardHeader>
				<CardTitle className="text-3xl font-extrabold text-foreground">
					Knowledge Check
				</CardTitle>
				<p className="text-muted-foreground">
					Complete this quiz to test your understanding of the Stellar Consensus
					Protocol.
				</p>
			</CardHeader>
			<CardContent className="space-y-10">
				{questions.map((question, index) => (
					<div key={question.id} className="space-y-6">
						<h3 className="text-xl font-semibold">
							Question {index + 1}: {question.question}
						</h3>

						<RadioGroup
							value={answers[question.id]?.toString() || ''}
							onValueChange={(value) =>
								handleAnswerChange(question.id, Number.parseInt(value))
							}
							className="space-y-3"
						>
							{question.options.map((option, optionIndex) => {
								const selected = answers[question.id] === optionIndex
								const correct = isAnswerCorrect(question.id, optionIndex)
								const answered = isQuestionAnswered(question.id)

								return (
									<div
										key={option.id}
										className={cn(
											'flex items-center gap-3 p-4 rounded-lg border transition-colors hover:bg-green-100 hover:border-primary',
											answered &&
												selected &&
												correct &&
												'bg-green-100 border-primary',
											answered &&
												selected &&
												!correct &&
												'bg-red-50 border-red-300',
											!answered && 'hover:bg-muted',
										)}
									>
										<div className="relative">
											<RadioGroupItem
												value={optionIndex.toString()}
												id={option.id}
												className={cn(
													'h-5 w-5 rounded-full border-2',
													answered &&
														selected &&
														correct &&
														'border-primary bg-green-100',
													answered &&
														selected &&
														!correct &&
														'border-destructive bg-red-100',
												)}
											/>

											{answered && selected && (
												<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
													{correct ? (
														<Check className="h-3 w-3 text-white" />
													) : (
														<X className="h-3 w-3 text-red-500" />
													)}
												</div>
											)}
										</div>

										<Label
											htmlFor={option.id}
											className={cn(
												'text-base font-medium cursor-pointer flex-grow',
												selected && correct && 'text-foreground',
												selected && !correct && 'text-destructive',
											)}
										>
											{option.text}
										</Label>
									</div>
								)
							})}
						</RadioGroup>

						{isQuestionAnswered(question.id) &&
							(() => {
								const answer = answers[question.id]
								const correct = isAnswerCorrect(question.id, answer ?? -1)
								return (
									<div
										className={cn(
											'p-4 rounded-lg border mt-4',
											correct
												? 'bg-green-100 border-green-300 text-primary'
												: 'bg-red-100 border-red-300 text-destructive',
										)}
									>
										<span className="text-lg font-semibold">
											{correct ? 'Correct!' : 'Incorrect'}
										</span>
										<p className="text-muted-foreground mt-1">
											{question.explanation}
										</p>
									</div>
								)
							})()}
					</div>
				))}

				<div className="flex justify-center">
					{isFailedAttempt && (
						<div className="text-sm text-destructive mt-2">
							❌ Some answers are incorrect. Please try again.
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	)
}
