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
import { mockAboutUs } from '~/lib/mock-data/mock-about-us'

export function WhyKindFiIsDifferent() {
	const { whyIsDifferent } = mockAboutUs

	// Animation variants for consistent animations
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
			transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
		},
	}

	return (
		<section
			className="w-full py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-white"
			aria-labelledby="about-why-different-heading"
		>
			<SectionContainer>
				<motion.header
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					viewport={{ once: true }}
					className="text-center max-w-3xl mx-auto mb-10 sm:mb-14"
				>
					<h2
						id="about-why-different-heading"
						className="text-3xl font-bold tracking-tight gradient-text mb-3 sm:text-4xl"
					>
						Why KindFi Is Different
					</h2>
					<p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
						Discover how KindFi transforms crowdfunding with transparency,
						accountability, and borderless participation powered by blockchain.
					</p>
				</motion.header>

				<motion.div
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full max-w-6xl mx-auto"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.1 }}
				>
					{whyIsDifferent.map((feature, index) => (
						<motion.div
							key={feature.title || `feature-${index}`}
							variants={cardVariants}
							className="h-full"
						>
							<Card className="h-full rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
								<div
									className={`h-1 bg-gradient-to-r ${
										index % 3 === 0
											? 'from-emerald-500 to-teal-500'
											: index % 3 === 1
												? 'from-indigo-500 to-violet-500'
												: 'from-teal-500 to-emerald-500'
									}`}
								/>
								<CardHeader className="flex flex-col items-center pt-6 pb-2 px-6">
									<div
										className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
											index % 3 === 0
												? 'bg-emerald-50 text-emerald-600'
												: index % 3 === 1
													? 'bg-indigo-50 text-indigo-600'
													: 'bg-teal-50 text-teal-600'
										}`}
									>
										<Icon name={feature.icon || 'lock'} className="w-6 h-6" />
									</div>
									<CardTitle className="text-lg font-semibold text-gray-900 mb-1 text-center">
										{feature.title}
									</CardTitle>
								</CardHeader>
								<CardContent className="px-6 pb-6 pt-0 text-muted-foreground text-sm leading-relaxed text-center">
									{feature.description}
								</CardContent>
							</Card>
						</motion.div>
					))}
				</motion.div>
			</SectionContainer>
		</section>
	)
}
