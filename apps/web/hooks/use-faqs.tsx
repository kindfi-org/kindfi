import { useState } from 'react'
import { type FAQ, faqData } from '~/components/mocks/mock-data'

export function useFaqs() {
	const [inputValue, setInputValue] = useState('')
	const [filteredQuestions, setFilteredQuestions] = useState<FAQ[]>([])
	const [activeTab, setActiveTab] = useState<string>('platform')
	const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)

	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value)
	}

	const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		const query = event.target.value.toLowerCase()
		handleInput(event)
		if (query.trim() === '') {
			setFilteredQuestions([])
			return
		}

		const results = Object.values(faqData)
			.flat()
			.filter(({ question }) => question.toLowerCase().includes(query))

		setFilteredQuestions(results)
	}

	const handleScroll = () => {
		const section = document.getElementById('questions')
		if (section) {
			section.scrollIntoView({ behavior: 'smooth' })
		}
	}

	const handleActiveFaq = (faq: string) => {
		setActiveTab(faq)
	}

	const handleSelectedQuestion = (question: string | null) => {
		setSelectedQuestion(question)
	}

	const handleSelectQuestion = (faq: FAQ) => {
		setActiveTab(faq.category)
		handleSelectedQuestion(faq.id)
		setFilteredQuestions([])
		handleScroll()
	}

	return {
		inputValue,
		filteredQuestions,
		activeTab,
		selectedQuestion,

		handleInput,
		handleSearch,
		handleSelectQuestion,
		handleActiveFaq,
		handleSelectedQuestion,
	}
}
