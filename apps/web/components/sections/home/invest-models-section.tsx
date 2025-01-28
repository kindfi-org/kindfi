'use client'

import { Globe, Shield, Users } from 'lucide-react'
import { InvestmentModelCard } from '~/components/shared/investment-model-card'
import { SectionCaption } from '~/components/shared/section-caption'
import { investmentContent } from '~/constants/sections/invest'

const iconComponents = {
	Shield: <Shield className="w-6 h-6 mb-4 text-emerald-600" />,
	Users: <Users className="w-6 h-6 mb-4 text-blue-600" />,
	Globe: <Globe className="w-6 h-6 mb-4 text-teal-600" />,
}

export const InvestmentModelsSection = () => {
	return (
		<section className="w-full px-4 py-20 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<SectionCaption
					title={investmentContent.title}
					subtitle={investmentContent.subtitle}
					highlightWords={investmentContent.highlightWords}
				/>

				<div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{investmentContent.models.map((model) => (
						<InvestmentModelCard
							key={model.id}
							{...model}
							icon={iconComponents[model.icon]}
							onLearnMore={() =>
								console.log(`Learn more about model ${model.variant}`)
							}
						/>
					))}
				</div>
			</div>
		</section>
	)
}
