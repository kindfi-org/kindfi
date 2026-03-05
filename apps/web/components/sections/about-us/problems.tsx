'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '~/components/base/card'
import { Icon } from '~/components/base/icon'
import { SectionContainer } from '~/components/shared/section-container'
import { useTranslation } from '~/hooks/use-translation'
import { mockAboutUs } from '~/lib/mock-data/mock-about-us'

interface Problem {
	title: string
	description: string
	icon: string
}

const Problems = () => {
	const { t } = useTranslation()
	const problems: Problem[] = mockAboutUs.problems

	const titleToKey: Record<string, string> = {
		'Lack of Transparency': 'lack-transparency',
		'High Costs': 'high-costs',
		'Limited Engagement': 'limited-engagement',
		'No Proof of Progress': 'no-proof',
	}

	function getProblemKey(title: string): string {
		const mapped = titleToKey[title]
		if (mapped) return mapped
		return title
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
	}

	// Animation variants for staggered children
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.2,
				delayChildren: 0.3,
			},
		},
	}

	const itemVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
		},
	}

	return (
		<section
			className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-gray-50/60"
			aria-labelledby="about-problems-heading"
		>
			<SectionContainer className="flex flex-col items-center">
				<motion.div
					className="text-center mb-10 max-w-3xl mx-auto sm:mb-14"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					viewport={{ once: true, amount: 0.2 }}
				>
					<h2
						id="about-problems-heading"
						className="text-3xl font-bold tracking-tight gradient-text mb-3 sm:text-4xl"
					>
						{t('about.problems.title')}
					</h2>
					<p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
						{t('about.problems.subtitle')}
					</p>
				</motion.div>

				<motion.div
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 w-full max-w-6xl"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.1 }}
				>
					{problems.map((problem, index) => (
						<motion.div
							key={problem.title || `problem-${index}`}
							variants={itemVariants}
							className="h-full"
						>
							<Card className="h-full flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
								<div
									className={`h-1 ${
										index % 3 === 0
											? 'bg-gradient-to-r from-emerald-500 to-teal-500'
											: index % 3 === 1
												? 'bg-gradient-to-r from-blue-500 to-indigo-500'
												: 'bg-gradient-to-r from-violet-500 to-purple-500'
									}`}
								/>
								<div className="flex flex-col flex-1 p-6 sm:p-7">
									<div
										className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
											index % 3 === 0
												? 'bg-emerald-50 text-emerald-600'
												: index % 3 === 1
													? 'bg-blue-50 text-blue-600'
													: 'bg-violet-50 text-violet-600'
										}`}
									>
										<Icon name={problem.icon} className="text-2xl" />
									</div>
									<CardContent className="flex flex-col text-left p-0 flex-1">
										<h3 className="text-lg font-semibold text-gray-900 mb-2">
											{t(
												`about.problems.items.${getProblemKey(problem.title)}.title`,
											)}
										</h3>
										<p className="text-muted-foreground text-sm leading-relaxed">
											{t(
												`about.problems.items.${getProblemKey(problem.title)}.description`,
											)}
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
