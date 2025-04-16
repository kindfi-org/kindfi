'use client'

import { InvestmentModelCard } from '~/components/shared/investment-model-card'
import { SectionCaption } from '~/components/shared/section-caption'
import { models } from '~/lib/constants/how-it-works-data'

export function HowItWorks() {
	return (
		<section className="w-full px-4 py-20 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<SectionCaption
					title="Trust Built In. Impact Locked On. Powered by Stellar"
					subtitle="At KindFi, every donation is secure, transparent, and verifiable. With Stellar-powered smart contracts and milestone-based fund releases, your crypto fuels real-world impact not empty promises."
					highlightWords={['Stellar']}
				/>

				<div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{models.map((model) => (
						<InvestmentModelCard
							key={model.id}
							{...model}
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
