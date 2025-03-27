'use client'

import { useState } from 'react'
import AskQuestionBox from './AskQuestionBox'
import LoadMoreButton from './LoadMoreButton'
import QuestionCard from './QuestionCard'

interface Answer {
	id: number
	author: string
	role: string
	timeAgo: string
	content: string
}

interface Question {
	id: number
	question: string
	author: string
	timeAgo: string
	answers: Answer[]
}

const initialQuestions: Question[] = [
	{
		id: 1,
		question: 'What is the expected lifespan of your mechanical battery?',
		author: 'John D.',
		timeAgo: '5 days ago',
		answers: [
			{
				id: 1,
				author: 'Michael Chen',
				role: 'Founder',
				timeAgo: '4 days ago',
				content:
					'Great question! Our mechanical batteries have an expected lifespan of 30+ years with minimal maintenance. Unlike chemical batteries that degrade with each charge cycle, our technology experiences virtually zero degradation over time, making it a truly sustainable long-term solution.',
			},
		],
	},
	{
		id: 2,
		question:
			'How does your technology compare to other energy storage solutions like hydrogen?',
		author: 'Sarah M.',
		timeAgo: '1 week ago',
		answers: [
			{
				id: 2,
				author: 'Michael Chen',
				role: 'Founder',
				timeAgo: '4 days ago',
				content:
					'Great question! Our mechanical batteries have an expected lifespan of 30+ years with minimal maintenance. Unlike chemical batteries that degrade with each charge cycle, our technology experiences virtually zero degradation over time, making it a truly sustainable long-term solution.',
			},
		],
	},
	{
		id: 3,
		question: "What's your go-to-market strategy?",
		author: 'Robert K.',
		timeAgo: '2 weeks ago',
		answers: [
			{
				id: 3,
				author: 'Michael Chen',
				role: 'Founder',
				timeAgo: '13 days ago',
				content:
					"We're initially targeting commercial and industrial customers who have high energy costs and reliability needs. Our first installations will be with data centers and manufacturing facilities that have already signed LOIs. From there, we'll expand to utilities and grid-scale applications. We're using a direct sales approach for these early customers, with plans to develop channel partnerships as we scale.",
			},
		],
	},
]

export default function QAPage() {
	const [questions, setQuestions] = useState<Question[]>(initialQuestions)

	const loadMoreQuestions = (): void => {
		const moreQuestions: Question[] = [
			{
				id: questions.length + 1,
				question: 'How do you ensure battery sustainability?',
				author: 'Alice T.',
				timeAgo: '3 weeks ago',
				answers: [
					{
						id: questions.length + 1,
						author: 'Michael Chen',
						role: 'Founder',
						timeAgo: '13 days ago',
						content:
							"We're initially targeting commercial and industrial customers who have high energy costs and reliability needs. Our first installations will be with data centers and manufacturing facilities that have already signed LOIs. From there, we'll expand to utilities and grid-scale applications. We're using a direct sales approach for these early customers, with plans to develop channel partnerships as we scale.",
					},
				],
			},
		]
		setQuestions((prev) => [...prev, ...moreQuestions])
	}

	const addNewQuestion = (newQuestion: string): void => {
		setQuestions((prev) => [
			{
				id: prev.length + 1,
				question: newQuestion,
				author: 'You',
				timeAgo: 'Just now',
				answers: [],
			},
			...prev,
		])
	}

	return (
		<div className="max-w-2xl mx-auto p-6">
			<div className="flex justify-between items-center font-bold mb-4">
				<h2 className="text-xl  ">Questions & Answers</h2>
				<p className="border border-gray-300 rounded-full py-1 px-3">
					{questions.length} questions
				</p>
			</div>
			{questions.map((q) => (
				<QuestionCard key={q.id} {...q} />
			))}
			<LoadMoreButton onLoadMore={loadMoreQuestions} />
			<AskQuestionBox onSubmit={addNewQuestion} />
		</div>
	)
}
