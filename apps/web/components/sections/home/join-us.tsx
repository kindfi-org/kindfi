'use client'

import { motion } from 'framer-motion'
import { KindfiMission } from '~/components/sections/home/mision'
import { SectionCaption } from '~/components/shared/section-caption'
import { SectionContainer } from '~/components/shared/section-container'
import { fadeInUpAnimation } from '~/lib/constants/animations'
import { features } from '~/lib/constants/join-us-data'
import { useI18n } from '~/lib/i18n'

export function JoinUs() {
	const { t } = useI18n()
	
	// Translated features
	const translatedFeatures = [
		{
			...features[0],
			title: t('home.feature1Title'),
			description: t('home.feature1Desc'),
		},
		{
			...features[1],
			title: t('home.feature2Title'),
			description: t('home.feature2Desc'),
		},
		{
			...features[2],
			title: t('home.feature3Title'),
			description: t('home.feature3Desc'),
		},
	]
	
	return (
		<section className="relative py-24 overflow-hidden">
			{/* Background */}
			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
			</div>

			<SectionContainer className="relative">
			{/* Section Caption */}
			<motion.div {...fadeInUpAnimation}>
				<SectionCaption
					title={t('home.joinUsTitle')}
					subtitle={t('home.joinUsSubtitle')}
					highlightWords={[
						'Support Change. Earn Trust. Build Impact',
						'KindFi',
					]}
				/>
			</motion.div>

			{/* Feature Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16">
				{translatedFeatures.map((feature, index) => (
						<motion.div
							key={feature.id}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
						>
							<article
								className="group h-full bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300"
								aria-labelledby={`feature-title-${feature.id}`}
							>
								{feature.icon}

								<h3
									id={`feature-title-${feature.id}`}
									className="mt-6 text-xl font-semibold text-gray-900"
								>
									{feature.title}
								</h3>
								<p className="mt-4 text-gray-600 leading-relaxed">
									{feature.description}
								</p>
							</article>
						</motion.div>
					))}
				</div>

				<KindfiMission />
			</SectionContainer>
		</section>
	)
}
