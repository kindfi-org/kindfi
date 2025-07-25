'use client'

import { motion } from 'framer-motion'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
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

	// Get the total roadmap items length for progress indicator
	const _totalSteps = mockAboutUs.roadmap.length

	return (
		<div className="container mx-auto py-6 relative z-10">
			{/* Section header */}
			<motion.div
				className="text-center mb-16"
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
				viewport={{ once: true, amount: 0.2 }}
			>
				<h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
					Designed to Scale Social Good
				</h2>
				<div className="w-20 h-1 bg-gradient-to-r from-green-500 to-indigo-500 mx-auto rounded-full mb-4" />
				<p className="text-lg text-gray-700 max-w-2xl mx-auto">
					Our vision for transforming social impact with blockchain, AI, and
					community governance.
				</p>
			</motion.div>

			{/* Roadmap cards container */}
			<motion.div
				className="flex flex-wrap justify-center lg:flex-nowrap gap-8 w-full max-w-6xl mx-auto"
				variants={containerVariants}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.1 }}
			>
				{mockAboutUs.roadmap.map((item, _index) => (
					<motion.div
						key={item.id}
						variants={cardVariants}
						className="flex-1 min-w-[300px] max-w-sm relative"
						whileHover={{ y: -10, transition: { duration: 0.3 } }}
					>
						<Card className="h-full rounded-xl shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
							{/* Top gradient bar */}
							<div className="h-1.5 w-full bg-gradient-to-r from-green-500 to-indigo-400" />

							<CardHeader className="pt-20 pb-4 px-6">
								<CardTitle className="text-xl font-bold text-gray-800">
									{item.title}
								</CardTitle>
							</CardHeader>

							<CardContent className="px-6 pb-6 text-gray-600">
								{item.details}
							</CardContent>
						</Card>
					</motion.div>
				))}
			</motion.div>
		</div>
	)
}

export { Roadmap }
