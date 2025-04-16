import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '~/components/base/accordion'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/base/tabs'
import {
	categoryTitles,
	faqData,
} from '~/lib/mock-data/project/project-card-variants.mock'

interface Props {
	activeTab: string
	selectedQuestion: string | null
	handleActiveFaq: (faq: string) => void
	handleSelectedQuestion: (question: string | null) => void
}

export function FaqTabs({
	handleActiveFaq,
	handleSelectedQuestion,
	activeTab,
	selectedQuestion,
}: Props) {
	return (
		<section
			className="w-full bg-white flex flex-col justify-center items-center p-7 md:p-20 lg:p-32"
			id="questions"
		>
			<Tabs
				defaultValue="platform"
				value={activeTab}
				onValueChange={handleActiveFaq}
				className="w-full md:w-[40rem] lg:w-[45rem] xl:w-[50rem]"
			>
				<TabsList className="w-full">
					<TabsTrigger
						value="platform"
						className="w-full text-xs data-[state=active]:bg-white md:text-base"
					>
						Platform
					</TabsTrigger>
					<TabsTrigger
						value="campaigns"
						className="w-full text-xs data-[state=active]:bg-white md:text-base"
					>
						Campaigns
					</TabsTrigger>
					<TabsTrigger
						value="donors"
						className="w-full text-xs data-[state=active]:bg-white md:text-base"
					>
						Donors
					</TabsTrigger>
					<TabsTrigger
						value="security"
						className="w-full text-xs data-[state=active]:bg-white md:text-base"
					>
						Security
					</TabsTrigger>
				</TabsList>
				<TabsContent value={activeTab} className="mt-5">
					<h2 className="text-black font-semibold text-xl md:text-2xl">
						{categoryTitles[activeTab].title}
					</h2>
					<p className="text-[#727276] text-sm md:text-base">
						{categoryTitles[activeTab].subtitle}
					</p>
					<Accordion
						type="single"
						collapsible
						className="w-full mt-5"
						value={selectedQuestion || undefined}
					>
						{faqData[activeTab].map(({ id, question, answer }) => (
							<AccordionItem
								key={id}
								value={id}
								onClick={() => handleSelectedQuestion(null)}
							>
								<AccordionTrigger className="text-sm text-left md:text-base">
									{question}
								</AccordionTrigger>
								<AccordionContent className="text-xs md:text-sm">
									{answer}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</TabsContent>
			</Tabs>
		</section>
	)
}
