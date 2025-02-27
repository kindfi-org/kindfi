import { Search } from 'lucide-react'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import type { FAQ } from '~/components/mocks/mock-data'

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
		<section className="w-full flex flex-col justify-center items-center pb-32">
			<Button className="border border-[#E6E6E6] text-black rounded-3xl text-xs md:text-base">
				Help Center
			</Button>
			<div className="flex flex-col justify-center items-center mt-7 gap-4">
				<h1 className="text-black text-4xl font-semibold text-center md:text-5xl xl:text-6xl">
					Got Questions?
				</h1>
				<h1 className="text-black text-4xl font-semibold text-center md:text-5xl xl:text-6xl">
					We Have Answers
				</h1>
				<p className="text-[#727276] text-sm md:text-base">
					Explore our FAQs to learn about KindiFi.
				</p>
				<div className="relative w-full mt-4">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none md:h-5 md:w-5" />
					<Input
						placeholder="Search frequently asked questions..."
						value={inputValue}
						onChange={handleSearch}
						className="pl-8 text-xs md:text-base md:pl-10"
					/>
					{filteredQuestions.length > 0 && (
						<div className="absolute top-full left-0 w-full bg-white border border-gray-300 shadow-lg rounded-lg z-50 max-h-60 overflow-y-auto">
							{filteredQuestions.map((faq) => (
								<button
									type="button"
									key={faq.id}
									className="text-black text-xs p-3 border-b last:border-none cursor-pointer hover:bg-gray-100 md:text-base text-left w-full"
									onClick={() => handleSelectQuestion(faq)}
								>
									{faq.question}
								</button>
							))}
						</div>
					)}
				</div>
			</div>
		</section>
	)
}
