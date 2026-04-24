'use client'

import { motion } from 'framer-motion'
import { FloatingFeature } from '~/components/shared/floating-feature'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'
import { mockAboutUs } from '~/lib/mock-data/mock-about-us'

const VARIANTS = ['green', 'blue', 'indigo', 'purple'] as const

const KindFiStellar = () => {
	const { t } = useI18n()

	return (
		<section
			className="relative overflow-hidden bg-muted/30 py-16 sm:py-20 lg:py-24"
			aria-labelledby="about-kindfi-stellar-heading"
		>
			<SectionContainer maxWidth="6xl" className="text-center">
				<motion.h2
					id="about-kindfi-stellar-heading"
					initial={{ opacity: 0, y: 12 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45 }}
					viewport={{ once: true, amount: 0.2 }}
					className="mb-3 text-3xl font-bold tracking-tight gradient-text sm:text-4xl"
				>
					{t('about.kindfiStellar.title')}
				</motion.h2>

				<motion.p
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					transition={{ delay: 0.08, duration: 0.45 }}
					viewport={{ once: true, amount: 0.2 }}
					className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
				>
					{t('about.kindfiStellar.description')}
				</motion.p>

				<motion.ul
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1, duration: 0.45 }}
					viewport={{ once: true, amount: 0.15 }}
					className="mx-auto mt-10 grid max-w-5xl list-none grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3"
				>
					{mockAboutUs.kindfiStellarFeatures.map((feature, index) => (
						<li key={feature.id} className="min-w-0">
							<FloatingFeature
								icon={feature.icon}
								title={t(`about.kindfiStellar.features.${feature.id}.title`)}
								variant={VARIANTS[index % VARIANTS.length]}
								className="max-w-none"
							/>
						</li>
					))}
				</motion.ul>
			</SectionContainer>
		</section>
	)
}

export { KindFiStellar }
