'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '~/components/base/card'
import { Icon } from '~/components/base/icon'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'
import { mockAboutUs } from '~/lib/mock-data/mock-about-us'

const Problems = () => {
	const { t } = useI18n()

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.08,
				delayChildren: 0.1,
			},
		},
	}

	const itemVariants = {
		hidden: { opacity: 0, y: 24 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
		},
	}

	return (
		<section
			className="relative overflow-hidden bg-background py-16 sm:py-20 lg:py-24"
			aria-labelledby="about-problems-heading"
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
						id="about-problems-heading"
						className="mb-3 text-3xl font-bold tracking-tight gradient-text sm:text-4xl"
					>
						{t('about.problems.title')}
					</h2>
					<p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
						{t('about.problems.subtitle')}
					</p>
				</motion.div>

				<motion.div
					className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.12 }}
				>
					{mockAboutUs.problems.map((problem, index) => (
						<motion.div
							key={problem.id}
							variants={itemVariants}
							className="h-full"
						>
							<Card className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
								<div
									className={
										index % 3 === 0
											? 'h-1 bg-gradient-to-r from-emerald-500 to-teal-500'
											: index % 3 === 1
												? 'h-1 bg-gradient-to-r from-blue-500 to-indigo-500'
												: 'h-1 bg-gradient-to-r from-violet-500 to-purple-500'
									}
								/>
								<div className="flex flex-1 flex-col p-6 sm:p-7">
									<div
										className={
											index % 3 === 0
												? 'mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600'
												: index % 3 === 1
													? 'mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600'
													: 'mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600'
										}
									>
										<Icon name={problem.icon} className="text-2xl" />
									</div>
									<CardContent className="flex flex-1 flex-col p-0 text-left">
										<h3 className="mb-2 text-lg font-semibold text-foreground">
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
