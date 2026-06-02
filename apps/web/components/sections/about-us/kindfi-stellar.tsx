'use client'

import type { Variants } from 'framer-motion'
import { motion } from 'framer-motion'
import { Card, CardContent } from '~/components/base/card'
import { Icon } from '~/components/base/icon'
import { AboutSectionHeader } from '~/components/sections/about-us/about-section-header'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'
import { mockAboutUs } from '~/lib/mock-data/mock-about-us'

const cardClassName =
	'flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-sm transition-all duration-300 hover:border-emerald-200/60 hover:shadow-md'

const KindFiStellar = () => {
	const { t } = useI18n()

	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.06, delayChildren: 0.08 },
		},
	}

	const itemVariants: Variants = {
		hidden: { opacity: 0, y: 16 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
		},
	}

	return (
		<section
			className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
			aria-labelledby="about-kindfi-stellar-heading"
		>
			<SectionContainer maxWidth="6xl">
				<AboutSectionHeader
					id="about-kindfi-stellar-heading"
					title={t('about.kindfiStellar.title')}
					subtitle={t('about.kindfiStellar.description')}
				/>

				<motion.ul
					className="mx-auto grid max-w-5xl list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.15 }}
				>
					{mockAboutUs.kindfiStellarFeatures.map((feature) => (
						<motion.li key={feature.id} variants={itemVariants} className="min-w-0">
							<Card className={cardClassName}>
								<CardContent className="flex items-center gap-4 p-5">
									<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
										<Icon name={feature.icon} className="h-5 w-5" />
									</div>
									<p className="text-sm font-semibold leading-snug text-slate-900 sm:text-base">
										{t(`about.kindfiStellar.features.${feature.id}.title`)}
									</p>
								</CardContent>
							</Card>
						</motion.li>
					))}
				</motion.ul>
			</SectionContainer>
		</section>
	)
}

export { KindFiStellar }
