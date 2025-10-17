'use client'

import { useFaqs } from '~/hooks/use-faqs'
import { FaqHeader } from './faq-header'
import { FaqSupport } from './faq-support'
import { FaqTabs } from './faq-tabs'

export function FaqContainer() {
	const {
		inputValue,
		filteredQuestions,
		activeTab,
		selectedQuestion,
		handleSearch,
		handleSelectQuestion,
		handleActiveFaq,
		handleSelectedQuestion,
	} = useFaqs()

	return (
		<section className="w-full flex flex-col justify-center items-center bg-gradient-to-b from-white to-gray-50 py-24 md:py-32">
			<FaqHeader
			/>
			<FaqTabs
				activeTab={activeTab}
				selectedQuestion={selectedQuestion}
				handleActiveFaq={handleActiveFaq}
				handleSelectedQuestion={handleSelectedQuestion}
			/>
			<FaqSupport />
		</section>
	)
}
