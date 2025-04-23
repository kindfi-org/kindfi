'use client'

import { Search } from 'lucide-react'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '~/components/base/accordion'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import type { FAQ } from '~/lib/mock-data/project/project-card-variants.mock'

interface Props {
	inputValue: string
	handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void
	filteredQuestions: FAQ[]
	handleSelectQuestion: (faq: FAQ) => void
}

export function FaqHeader({
	filteredQuestions,
	inputValue,
	handleSearch,
	handleSelectQuestion,
}: Props) {
	return (
		<section className="w-full flex flex-col justify-center items-center pb-32 px-4 sm:px-6">
			<Button className="border border-[#E6E6E6] text-black rounded-3xl text-xs md:text-base">
				Help Center
			</Button>

			<div className="flex flex-col justify-center items-center mt-7 gap-4">
				<h1 className="gradient-text text-4xl font-semibold text-center md:text-5xl xl:text-6xl">
					Got Questions?
				</h1>
				<h2 className="text-black text-4xl font-semibold text-center md:text-5xl xl:text-6xl">
					We Have Answers
				</h2>
				<p className="gradient-text text-base md:text-lg text-center">
					Explore our FAQs to learn about KindFi.
				</p>

				<div className="relative w-full mt-4 max-w-2xl">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none md:h-5 md:w-5" />
					<Input
						placeholder="Search frequently asked questions..."
						value={inputValue}
						onChange={handleSearch}
						className="pl-8 text-xs md:text-base md:pl-10"
						aria-label="Search FAQs"
					/>
				</div>

				{filteredQuestions.length > 0 && (
					<div className="w-full max-w-2xl mt-6">
						<Accordion type="single" collapsible>
							{filteredQuestions.map((faq) => (
								<AccordionItem key={faq.id} value={faq.id}>
									<AccordionTrigger className="text-left text-sm md:text-base">
										{faq.question}
									</AccordionTrigger>
									<AccordionContent className="text-muted-foreground text-sm md:text-base">
										{faq.answer}
										<Button
											variant="link"
											className="mt-2 px-0 text-xs underline"
											onClick={() => handleSelectQuestion(faq)}
										>
											View in full context
										</Button>
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</div>
				)}
			</div>
		</section>
	)
}
