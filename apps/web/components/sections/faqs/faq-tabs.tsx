import {
	ChevronDown,
	LayoutDashboard,
	Megaphone,
	Shield,
	Users,
} from 'lucide-react'
import { useTranslation } from '~/hooks/use-translation'
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
	const { t } = useTranslation()
	return (
		<section
			className="w-full bg-transparent flex flex-col justify-center items-center p-7 md:p-20 lg:p-32"
			id="questions"
		>
			<div className="w-full md:w-[40rem] lg:w-[55rem] xl:w-[65rem]">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{(['platform', 'campaigns', 'donors', 'security'] as const).map(
						(key) => {
							const isActive = activeTab === key
							const Icon =
								key === 'platform'
									? LayoutDashboard
									: key === 'campaigns'
										? Megaphone
										: key === 'donors'
											? Users
											: Shield
							return (
								<button
									key={key}
									type="button"
									onClick={() => handleActiveFaq(key)}
									className={`group flex items-start gap-3 rounded-2xl border ${isActive ? 'border-black bg-black text-white' : 'border-[#E6E6E6] bg-white text-black'} p-4 shadow-sm transition hover:shadow`}
									aria-pressed={isActive}
								>
									<span
										className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${isActive ? 'bg-white/10' : 'bg-gray-100'} transition`}
									>
										<Icon
											className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-700'}`}
										/>
									</span>
									<span className="flex-1 text-left">
										<span className="block text-sm font-semibold">
											{t(`faqs.tabs.${key}`)} ({faqData[key].length})
										</span>
										<span
											className={`mt-1 block text-xs ${isActive ? 'text-white/80' : 'text-[#727276]'}`}
										>
											{categoryTitles[key].subtitle}
										</span>
									</span>
								</button>
							)
						},
					)}
				</div>

				<div className="mt-8">
					<h2 className="text-black font-semibold text-xl md:text-2xl">
						{t(`faqs.categories.${activeTab}.title`) ===
						`faqs.categories.${activeTab}.title`
							? categoryTitles[activeTab].title
							: t(`faqs.categories.${activeTab}.title`)}
					</h2>
					<p className="text-[#727276] text-sm md:text-base">
						{t(`faqs.categories.${activeTab}.subtitle`) ===
						`faqs.categories.${activeTab}.subtitle`
							? categoryTitles[activeTab].subtitle
							: t(`faqs.categories.${activeTab}.subtitle`)}
					</p>
					<div className="w-full mt-5 space-y-3">
						{faqData[activeTab].map(({ id, question, answer }) => {
							const isOpen = selectedQuestion === id
							const tq = t(`faqs.items.${id}.q`)
							const ta = t(`faqs.items.${id}.a`)
							const translatedQuestion =
								tq === `faqs.items.${id}.q` ? question : tq
							const translatedAnswer = ta === `faqs.items.${id}.a` ? answer : ta
							return (
								<div
									key={id}
									className="border border-[#E6E6E6] rounded-2xl bg-white shadow-sm overflow-hidden"
								>
									<button
										type="button"
										onClick={() => handleSelectedQuestion(isOpen ? null : id)}
										className="w-full flex items-start gap-3 px-4 py-3 md:px-6 md:py-4 hover:bg-gray-50 transition"
										aria-expanded={isOpen}
									>
										<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
											<ChevronDown
												className={`h-4 w-4 text-gray-700 transition-transform ${isOpen ? 'rotate-180' : ''}`}
											/>
										</span>
										<span className="flex-1 text-left text-sm md:text-base font-medium text-black">
											{translatedQuestion}
										</span>
									</button>
									<div
										className={`px-4 md:px-6 ${isOpen ? 'pt-3 md:pt-4 pb-4 md:pb-6' : 'pb-0'} text-[#4B5563] text-xs md:text-sm leading-relaxed border-t border-[#F0F0F0] transition-all duration-300 ${isOpen ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0 overflow-hidden'}`}
									>
										{translatedAnswer}
									</div>
								</div>
							)
						})}
					</div>
				</div>
			</div>
		</section>
	)
}
