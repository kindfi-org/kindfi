'use client'

import { motion } from 'framer-motion'
import { SectionContainer } from '~/components/shared/section-container'
import { Web3FeatureCard } from '~/components/shared/web3-feature-card'
import { fadeInUpAnimation } from '~/lib/constants/animations'
import { features } from '~/lib/constants/platform-overview-data'
import { useI18n } from '~/lib/i18n'

export function PlatformOverview() {
	const { t } = useI18n()

	return (
		<section className="relative py-24 overflow-hidden">
			{/* Background */}
			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
			</div>

			<SectionContainer className="relative">
				{/* Header */}
				<motion.div
					{...fadeInUpAnimation}
					className="text-center mb-16 max-w-3xl mx-auto"
				>
					<h2 className="text-4xl font-bold text-gray-900 mb-6">
						<span className="block">{t('home.platformTitle1')}</span>
						<span className="block gradient-text">
							{t('home.platformTitle2')}
						</span>
					</h2>
					<p className="text-lg text-gray-600">{t('home.platformSubtitle')}</p>
				</motion.div>

				{/* Features Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-16">
					<Web3FeatureCard
						key={features[0].id}
						{...features[0]}
						title={t('home.platformFeature1Title')}
						description={t('home.platformFeature1Desc')}
						stats={{
							value: t('home.platformFeature1StatValue'),
							label: t('home.platformFeature1StatLabel'),
						}}
					/>
					<Web3FeatureCard
						key={features[1].id}
						{...features[1]}
						title={t('home.platformFeature2Title')}
						description={t('home.platformFeature2Desc')}
						stats={{
							value: t('home.platformFeature2StatValue'),
							label: t('home.platformFeature2StatLabel'),
						}}
					/>
					<Web3FeatureCard
						key={features[2].id}
						{...features[2]}
						title={t('home.platformFeature3Title')}
						description={t('home.platformFeature3Desc')}
						checkList={[
							{ id: 'metrics', text: t('home.platformFeature3Check1') },
							{ id: 'escrows', text: t('home.platformFeature3Check2') },
							{ id: 'governance', text: t('home.platformFeature3Check3') },
							{ id: 'blockchain', text: t('home.platformFeature3Check4') },
						]}
					/>
				</div>
			</SectionContainer>
		</section>
	)
}
