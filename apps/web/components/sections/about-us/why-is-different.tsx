'use client'

import { motion } from 'framer-motion'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { Icon } from '~/components/base/icon'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'

const ITEMS = [
	{ id: 'transparency' as const, icon: 'eye' as const },
	{ id: 'escrow' as const, icon: 'lock' as const },
	{ id: 'access' as const, icon: 'globe' as const },
]

export function WhyKindFiIsDifferent() {
	const { t } = useI18n()

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
		},
	}

	const cardVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
		},
	}

	return (
		<section
			className="relative overflow-hidden bg-background py-16 sm:py-20 lg:py-24"
			aria-labelledby="about-why-different-heading"
		>
			<SectionContainer maxWidth="6xl">
				<motion.header
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
					viewport={{ once: true }}
					className="mx-auto mb-10 max-w-3xl text-center sm:mb-14"
				>
					<h2
						id="about-why-different-heading"
						className="mb-3 text-3xl font-bold tracking-tight gradient-text sm:text-4xl"
					>
						{t('about.whyDifferentTitle')}
					</h2>
					<p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
						{t('about.whyDifferentSubtitle')}
					</p>
				</motion.header>

				<motion.div
					className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.12 }}
				>
					{ITEMS.map((item, index) => (
						<motion.div
							key={item.id}
							variants={cardVariants}
							className="h-full"
						>
							<Card className="h-full overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
								<div
									className={
										index % 3 === 0
											? 'h-1 bg-gradient-to-r from-emerald-500 to-teal-500'
											: index % 3 === 1
												? 'h-1 bg-gradient-to-r from-indigo-500 to-violet-500'
												: 'h-1 bg-gradient-to-r from-teal-500 to-emerald-500'
									}
								/>
								<CardHeader className="flex flex-col items-start px-6 pb-2 pt-6">
									<div
										className={
											index % 3 === 0
												? 'mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600'
												: index % 3 === 1
													? 'mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600'
													: 'mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600'
										}
									>
										<Icon name={item.icon} className="h-6 w-6" />
									</div>
									<CardTitle className="text-lg font-semibold text-foreground">
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
