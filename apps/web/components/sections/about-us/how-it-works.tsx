'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '~/components/base/card'
import { Icon } from '~/components/base/icon'
import { AboutSectionHeader } from '~/components/sections/about-us/about-section-header'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'

const STEP_ICONS = ['globe', 'lock', 'check-circle', 'star'] as const
const STEP_KEYS = ['one', 'two', 'three', 'four'] as const

const cardClassName =
	'flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-sm transition-all duration-300 hover:border-emerald-200/60 hover:shadow-md'

const HowItWorks = () => {
	const { t } = useI18n()

	return (
		<section
			className="bg-[#fafbfc] py-16 sm:py-20 lg:py-24"
			aria-labelledby="about-how-it-works-heading"
		>
			<SectionContainer maxWidth="6xl">
				<AboutSectionHeader
					id="about-how-it-works-heading"
					title={t('about.howItWorksSectionTitle')}
					subtitle={t('about.howItWorksSectionSubtitle')}
				/>

				<div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{STEP_KEYS.map((stepKey, index) => (
						<motion.div
							key={stepKey}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.45,
								delay: index * 0.06,
								ease: [0.22, 1, 0.36, 1],
							}}
							viewport={{ once: true, amount: 0.2 }}
						>
							<Card className={cardClassName}>
								<div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
									<span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
										{String(index + 1).padStart(2, '0')}
									</span>
									<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
										<Icon name={STEP_ICONS[index]} className="h-4 w-4" />
									</div>
								</div>
								<CardContent className="flex flex-1 flex-col gap-2 p-5">
									<h3 className="text-lg font-semibold text-slate-900">
										{t(`about.howSteps.${stepKey}.title`)}
									</h3>
									<p className="text-sm leading-relaxed text-muted-foreground">
										{t(`about.howSteps.${stepKey}.description`)}
									</p>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</SectionContainer>
		</section>
	)
}

export { HowItWorks }
