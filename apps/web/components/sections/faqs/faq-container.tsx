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
		<section className="w-full bg-white flex flex-col justify-center items-center py-32">
			<FaqHeader
				filteredQuestions={filteredQuestions}
				inputValue={inputValue}
				handleSearch={handleSearch}
				handleSelectQuestion={handleSelectQuestion}
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
