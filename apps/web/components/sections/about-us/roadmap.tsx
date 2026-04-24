'use client'

import { motion } from 'framer-motion'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'

const ROADMAP_KEYS = ['ai', 'partnerships', 'soroban', 'rails'] as const

const Roadmap = () => {
	const { t } = useI18n()

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.08,
			},
		},
	}

	const cardVariants = {
		hidden: { opacity: 0, y: 28 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
		},
	}

	return (
		<section
			className="relative bg-background py-16 sm:py-20 lg:py-24"
			aria-labelledby="roadmap-heading"
		>
			<SectionContainer maxWidth="6xl">
				<motion.div
					className="mx-auto mb-10 max-w-3xl text-center sm:mb-14"
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
					viewport={{ once: true, amount: 0.2 }}
				>
					<h2
						id="roadmap-heading"
						className="mb-3 text-3xl font-bold tracking-tight gradient-text sm:text-4xl"
					>
						{t('about.roadmapSectionTitle')}
					</h2>
					<p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
						{t('about.roadmapSectionSubtitle')}
					</p>
				</motion.div>

				<motion.div
					className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.1 }}
				>
					{ROADMAP_KEYS.map((key) => (
						<motion.div key={key} variants={cardVariants} className="h-full">
							<Card className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
								<div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-indigo-500" />
								<CardHeader className="px-6 pb-2 pt-6">
									<CardTitle className="text-lg font-semibold text-foreground">
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
