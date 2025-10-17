'use client'

import { motion } from 'framer-motion'
import { FloatingFeature } from '~/components/shared/floating-feature'
import { useTranslation } from '~/hooks/use-translation'
import { mockAboutUs } from '~/lib/mock-data/mock-about-us'

const containerVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.2,
		},
	},
}

const KindFiStellar = () => {
	const { t } = useTranslation()
	return (
		<section className="relative py-16 overflow-hidden">
			<div className="container mx-auto px-6 text-center">
				<motion.h2
					initial={{ opacity: 0, y: -20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					viewport={{ once: true, amount: 0.2 }}
					className="text-3xl md:text-4xl font-bold"
				>
					{t('about.kindfiStellar.title')}
				</motion.h2>

				<motion.p
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					transition={{ delay: 0.2, duration: 0.5 }}
					viewport={{ once: true, amount: 0.2 }}
					className="text-gray-600 max-w-2xl mx-auto mt-4"
				>
					{t('about.kindfiStellar.description')}
				</motion.p>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, amount: 0.2 }}
					className="relative mt-12 flex flex-wrap justify-center items-center gap-8"
				>
					{mockAboutUs.kindfiStellarFeatures.map((feature) => (
						<FloatingFeature
							key={feature.id}
							icon={feature.icon}
							title={t(`about.kindfiStellar.features.${feature.id}.title`)}
						/>
					))}
				</motion.div>
			</div>
		</section>
	)
}

export { KindFiStellar }
