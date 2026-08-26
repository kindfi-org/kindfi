'use client'

import type { Variants } from 'framer-motion'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/base/card'
import { AboutSectionHeader } from '~/components/sections/about-us/about-section-header'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'

const ROADMAP_KEYS = ['ai', 'partnerships', 'soroban', 'rails'] as const

const cardClassName =
	'flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200/60 hover:shadow-md'

const Roadmap = () => {
	const { t } = useI18n()

	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.08,
			},
		},
	}

	const cardVariants: Variants = {
		hidden: { opacity: 0, y: 28 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
		},
	}

	return (
		<section
			className="relative bg-[#fafbfc] py-16 sm:py-20 lg:py-24"
			aria-labelledby="roadmap-heading"
		>
			<SectionContainer maxWidth="6xl">
				<AboutSectionHeader
					id="roadmap-heading"
					title={t('about.roadmapSectionTitle')}
					subtitle={t('about.roadmapSectionSubtitle')}
				/>

				<motion.div
					className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.1 }}
				>
					{ROADMAP_KEYS.map((key) => (
						<motion.div key={key} variants={cardVariants} className="h-full">
							<Card className={cardClassName}>
								<CardHeader className="px-6 pb-2 pt-6">
									<CardTitle className="text-lg font-semibold text-slate-900">
										{t(`about.roadmapItems.${key}.title`)}
									</CardTitle>
								</CardHeader>
								<CardContent className="flex-1 px-6 pb-6 pt-0 text-sm leading-relaxed text-muted-foreground">
									{t(`about.roadmapItems.${key}.description`)}
								</CardContent>
							</Card>
						</motion.div>
					))}
				</motion.div>
			</SectionContainer>
		</section>
	)
}

export { Roadmap }
