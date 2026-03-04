'use client'

import { motion } from 'framer-motion'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { SectionContainer } from '~/components/shared/section-container'
import { mockAboutUs } from '~/lib/mock-data/mock-about-us'

const Roadmap = () => {
	// Define animation variants for consistent animations
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.15,
				delayChildren: 0.2,
			},
		},
	}

	const cardVariants = {
		hidden: { opacity: 0, y: 40 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: [0.22, 1, 0.36, 1],
			},
		},
	}

	return (
		<section
			className="py-16 sm:py-20 lg:py-24 relative z-10 bg-gray-50/60"
			aria-labelledby="roadmap-heading"
		>
			<SectionContainer>
				<motion.div
					className="text-center mb-10 max-w-3xl mx-auto sm:mb-14"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					viewport={{ once: true, amount: 0.2 }}
				>
					<h2
						id="roadmap-heading"
						className="text-3xl font-bold tracking-tight gradient-text mb-3 sm:text-4xl"
					>
						Designed to Scale Social Good
					</h2>
					<p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
						Our vision for transforming social impact with blockchain, AI, and
						community governance.
					</p>
				</motion.div>

				<motion.div
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 w-full max-w-6xl mx-auto"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.1 }}
				>
					{mockAboutUs.roadmap.map((item) => (
						<motion.div
							key={item.id}
							variants={cardVariants}
							className="h-full"
						>
							<Card className="h-full rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
								<div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-indigo-500" />
								<CardHeader className="pt-6 pb-2 px-6">
									<CardTitle className="text-lg font-semibold text-gray-900">
										{item.title}
									</CardTitle>
								</CardHeader>
								<CardContent className="px-6 pb-6 pt-0 text-muted-foreground text-sm leading-relaxed">
									{item.details}
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
