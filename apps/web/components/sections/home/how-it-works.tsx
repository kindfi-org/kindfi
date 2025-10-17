'use client'

import { InvestmentModelCard } from '~/components/shared/investment-model-card'
import { SectionCaption } from '~/components/shared/section-caption'
import { SectionContainer } from '~/components/shared/section-container'
import { models } from '~/lib/constants/how-it-works-data'
import { useI18n } from '~/lib/i18n'

export function HowItWorks() {
	const { t } = useI18n()

	// Translated models
	const translatedModels = [
		{
			...models[0],
			title: t('home.escrowTitle'),
			description: t('home.escrowDesc'),
			capabilities: [
				{ id: 'smart-contracts-id', text: t('home.escrowBullet1') },
				{ id: 'secure-fund-custody-id', text: t('home.escrowBullet2') },
				{ id: 'blockchain-transparency-id', text: t('home.escrowBullet3') },
			],
		},
		{
			...models[1],
			title: t('home.resultsTitle'),
			description: t('home.resultsDesc'),
			capabilities: [
				{ id: 'impact-reports-id', text: t('home.resultsBullet1') },
				{ id: 'real-time-tracking-id', text: t('home.resultsBullet2') },
				{ id: 'engaged-communities-id', text: t('home.resultsBullet3') },
			],
		},
		{
			...models[2],
			title: t('home.stellarTitle'),
			description: t('home.stellarDesc'),
			capabilities: [
				{ id: 'instant-transactions-id', text: t('home.stellarBullet1') },
				{ id: 'immutable-records-id', text: t('home.stellarBullet2') },
				{ id: 'nft-certificates-tokens-id', text: t('home.stellarBullet3') },
			],
		},
	]

	return (
		<section className="w-full py-20 bg-white">
			<SectionContainer>
				<SectionCaption
					title={t('home.howItWorksTitle')}
					subtitle={t('home.howItWorksSubtitle')}
					highlightWords={['Trust Built']}
				/>

				<div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{translatedModels.map((model) => (
						<InvestmentModelCard
							key={model.id}
							{...model}
							onLearnMore={() =>
								console.log(`Learn more about model ${model.variant}`)
							}
						/>
					))}
				</div>
			</SectionContainer>
		</section>
	)
}
