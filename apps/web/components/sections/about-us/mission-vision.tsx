'use client'

import { motion } from 'framer-motion'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { mockAboutUs } from '~/lib/mock-data/mock-about-us'

const MissionVision = () => {
	const mission = mockAboutUs?.missionVision?.mission
	const vision = mockAboutUs?.missionVision?.vision

	if (!mission || !vision) return null

	return (
		<motion.section
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: 'easeOut' }}
			viewport={{ once: true, amount: 0.2 }}
			className="container mx-auto px-6 py-12 flex flex-col items-center"
		>
			<div className="flex flex-col md:flex-row gap-4 justify-center items-center">
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
					viewport={{ once: true, amount: 0.2 }}
					whileHover={{ scale: 1.05, rotate: 1 }}
					className="w-full max-w-md"
				>
					<Card className="shadow-lg p-6 min-h-[220px]">
						<CardHeader>
							<CardTitle className="text-2xl font-bold">
								{mission.title}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-700 text-lg">{mission.description}</p>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
					viewport={{ once: true, amount: 0.2 }}
					whileHover={{ scale: 1.05, rotate: -1 }}
					className="w-full max-w-md"
				>
					<Card className="shadow-lg p-6 min-h-[220px]">
						<CardHeader>
							<CardTitle className="text-2xl font-bold">
								{vision.title}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-700 text-lg">{vision.description}</p>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</motion.section>
	)
}

export { MissionVision }
