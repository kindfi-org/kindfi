'use client'

import type { Variants } from 'framer-motion'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/base/card'
import { Icon } from '~/components/base/icon'
import { AboutSectionHeader } from '~/components/sections/about-us/about-section-header'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'

const ITEMS = [
	{ id: 'transparency' as const, icon: 'eye' as const },
	{ id: 'escrow' as const, icon: 'lock' as const },
	{ id: 'access' as const, icon: 'globe' as const },
]

const cardClassName =
	'h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200/60 hover:shadow-md'

export function WhyKindFiIsDifferent() {
	const { t } = useI18n()

	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
		},
	}

	const cardVariants: Variants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
		},
	}

	return (
		<section
			className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
			aria-labelledby="about-why-different-heading"
		>
			<SectionContainer maxWidth="6xl">
				<AboutSectionHeader
					id="about-why-different-heading"
					title={t('about.whyDifferentTitle')}
					subtitle={t('about.whyDifferentSubtitle')}
				/>

				<motion.div
					className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.12 }}
				>
					{ITEMS.map((item) => (
						<motion.div key={item.id} variants={cardVariants} className="h-full">
							<Card className={cardClassName}>
								<CardHeader className="flex flex-col items-start px-6 pb-2 pt-6">
									<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
										<Icon name={item.icon} className="h-6 w-6" />
									</div>
									<CardTitle className="text-lg font-semibold text-slate-900">
										{t(`about.whyDifferentItems.${item.id}.title`)}
									</CardTitle>
								</CardHeader>
								<CardContent className="px-6 pb-6 pt-0 text-sm leading-relaxed text-muted-foreground">
									{t(`about.whyDifferentItems.${item.id}.description`)}
								</CardContent>
							</Card>
						</motion.div>
					))}
				</motion.div>
			</SectionContainer>
		</section>
	)
}
