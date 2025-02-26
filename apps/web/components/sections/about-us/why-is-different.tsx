'use client'

import { motion } from 'framer-motion'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import Icon from '~/components/base/icon'
import { mockAboutUs } from '~/lib/constants/mock-data/mock-about-us'

const WhyIsDifferent = () => {
	const { whyIsDifferent } = mockAboutUs

	return (
		<section className="flex flex-col items-center justify-center gap-8 py-12 w-full">
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="text-center max-w-2xl"
			>
				<h2 className="text-4xl font-bold">Why KindFi Is Different</h2>
				<p className="text-lg text-gray-600 mt-2">
					Discover what makes this platform unique and how it revolutionizes
					crowdfunding.
				</p>
			</motion.div>

			<div className="relative flex justify-center gap-6 w-full px-6">
				{whyIsDifferent.map((feature, index) => (
					<motion.div
						key={feature.title || `feature-${index}`}
						initial={{ opacity: 0, scale: 0.9 }}
						whileInView={{ opacity: 1, scale: 1 }}
						whileHover={{ scale: 1.05 }}
						transition={{ duration: 0.3 }}
						viewport={{ once: true }}
						className="w-80 flex-shrink-0 overflow-visible"
					>
						<Card className="h-80 shadow-lg flex flex-col justify-center items-center p-6 border border-gray-200 rounded-lg overflow-hidden">
							<CardHeader className="flex flex-col items-center text-center">
								<Icon
									name={feature.icon || 'lock'}
									className="w-16 h-16 text-black"
								/>
								<CardTitle className="mt-4 text-lg">{feature.title}</CardTitle>
							</CardHeader>
							<CardContent className="mt-2 text-center text-gray-600 text-sm">
								{feature.description}
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</section>
	)
}

export default WhyIsDifferent
