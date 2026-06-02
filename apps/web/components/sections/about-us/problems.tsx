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
	'flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200/60 hover:shadow-md'

const Problems = () => {
	const { t } = useI18n()

	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.08,
				delayChildren: 0.1,
			},
		},
	}

	const itemVariants: Variants = {
		hidden: { opacity: 0, y: 24 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
		},
	}

	return (
		<section
			className="relative overflow-hidden bg-[#fafbfc] py-16 sm:py-20 lg:py-24"
			aria-labelledby="about-problems-heading"
		>
			<SectionContainer maxWidth="6xl">
				<AboutSectionHeader
					id="about-problems-heading"
					title={t('about.problems.title')}
					subtitle={t('about.problems.subtitle')}
				/>

				<motion.div
					className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.12 }}
				>
					{mockAboutUs.problems.map((problem) => (
						<motion.div key={problem.id} variants={itemVariants} className="h-full">
							<Card className={cardClassName}>
								<div className="flex flex-1 flex-col p-6 sm:p-7">
									<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
										<Icon name={problem.icon} className="text-2xl" />
									</div>
									<CardContent className="flex flex-1 flex-col p-0 text-left">
										<h3 className="mb-2 text-lg font-semibold text-slate-900">
											{t(`about.problems.items.${problem.id}.title`)}
										</h3>
										<p className="text-sm leading-relaxed text-muted-foreground">
											{t(`about.problems.items.${problem.id}.description`)}
										</p>
									</CardContent>
								</div>
							</Card>
						</motion.div>
					))}
				</motion.div>
			</SectionContainer>
		</section>
	)
}

export { Problems }
