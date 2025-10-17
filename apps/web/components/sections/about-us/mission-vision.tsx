'use client'

import { motion } from 'framer-motion'
import { EyeIcon, Target } from 'lucide-react'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'
import { mockAboutUs } from '~/lib/mock-data/mock-about-us'

const MissionVision = () => {
	const { t } = useI18n()
	const mission = mockAboutUs?.missionVision?.mission
	const vision = mockAboutUs?.missionVision?.vision

	if (!mission || !vision) return null

	return (
		<motion.section
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
			viewport={{ once: true, amount: 0.2 }}
			className="flex flex-col items-center relative"
		>
			<SectionContainer>
				{/* Section title */}
				<motion.div
					className="text-center mb-16"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					viewport={{ once: true, amount: 0.2 }}
				>
					<h2 className="text-3xl md:text-4xl font-bold gradient-text inline-block mb-4">
						{t('about.ourPurpose')}
					</h2>
				</motion.div>

				<div className="flex flex-col md:flex-row gap-8 justify-center items-stretch z-10 max-w-5xl">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
						viewport={{ once: true, amount: 0.2 }}
						whileHover={{ y: -8, transition: { duration: 0.3 } }}
						className="w-full"
					>
						<Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden h-full transition-all duration-300 hover:shadow-green-200/50 hover:shadow-2xl">
							<div className="h-2 bg-gradient-to-r from-green-500 to-blue-700" />
							<CardHeader className="pt-8 pb-2">
								<div className="flex items-center gap-3 mb-4">
									<div className="p-3 rounded-lg bg-purple-100 text-green-600">
										<Target size={24} strokeWidth={2} />
									</div>
									<CardTitle className="text-2xl font-bold text-gray-800">
										{t('about.missionTitle')}
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="pb-8">
								<p className="text-gray-700 text-lg leading-relaxed">
									{t('about.missionDesc')}
								</p>
							</CardContent>
						</Card>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
						viewport={{ once: true, amount: 0.2 }}
						whileHover={{ y: -8, transition: { duration: 0.3 } }}
						className="w-full"
					>
						<Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden h-full transition-all duration-300 hover:shadow-indigo-200/50 hover:shadow-2xl">
							<div className="h-2 bg-gradient-to-r from-blue-700 to-green-400" />
							<CardHeader className="pt-8 pb-2">
								<div className="flex items-center gap-3 mb-4">
									<div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
										<EyeIcon size={24} strokeWidth={2} />
									</div>
									<CardTitle className="text-2xl font-bold text-gray-800">
										{t('about.visionTitle')}
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="pb-8">
								<p className="text-gray-700 text-lg leading-relaxed">
									{t('about.visionDesc')}
								</p>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</SectionContainer>
		</motion.section>
	)
}

export { MissionVision }
