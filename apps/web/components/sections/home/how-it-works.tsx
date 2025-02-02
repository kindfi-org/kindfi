'use client'

import { InvestmentModelCard } from '~/components/shared/investment-model-card'
import { SectionCaption } from '~/components/shared/section-caption'
import { models } from '~/lib/mock-data/mock-how-it-works-section'

export function HowItWorks() {
	return (
		<section className="w-full px-4 py-20 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<SectionCaption
					title="Secure, Transparent, and Powered by Web3"
					subtitle="At KindFi, we ensure that every donation or contribution is backed by the security and transparency of a Web3-based Escrow system. Smart contracts guarantee that funds reach their intended destination to create real impact."
					highlightWords={['Powered by Web3']}
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
