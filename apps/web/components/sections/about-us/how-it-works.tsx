'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '~/components/base/card'
import { Icon } from '~/components/base/icon'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'

const STEP_ICONS = ['globe', 'lock', 'check-circle', 'star'] as const
const STEP_KEYS = ['one', 'two', 'three', 'four'] as const

const HowItWorks = () => {
	const { t } = useI18n()

	return (
		<section
			className="bg-muted/30 py-16 sm:py-20 lg:py-24"
			aria-labelledby="about-how-it-works-heading"
		>
			<SectionContainer maxWidth="6xl">
				<div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
					<h2
						id="about-how-it-works-heading"
						className="mb-3 text-3xl font-bold tracking-tight gradient-text sm:text-4xl"
					>
						{t('about.howItWorksSectionTitle')}
					</h2>
					<p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
						{t('about.howItWorksSectionSubtitle')}
					</p>
				</div>

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
							<Card className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition-shadow hover:shadow-md">
								<div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
									<span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
										{String(index + 1).padStart(2, '0')}
									</span>
									<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
										<Icon name={STEP_ICONS[index]} className="h-4 w-4" />
									</div>
								</div>
								<CardContent className="flex flex-1 flex-col gap-2 p-5">
									<h3 className="text-lg font-semibold text-foreground">
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
