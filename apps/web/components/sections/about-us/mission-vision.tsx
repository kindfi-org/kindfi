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
			className="flex flex-col items-center relative py-16 sm:py-20 lg:py-24 bg-white"
			aria-labelledby="about-our-purpose-heading"
		>
			<SectionContainer>
				<motion.div
					className="text-center mb-12 max-w-3xl mx-auto sm:mb-16"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					viewport={{ once: true, amount: 0.2 }}
				>
					<h2
						id="about-our-purpose-heading"
						className="text-3xl font-bold tracking-tight gradient-text mb-3 sm:text-4xl"
					>
						{t('about.ourPurpose')}
					</h2>
					<p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
						Our mission and vision for transparent, impact-driven crowdfunding.
					</p>
				</motion.div>

				<div className="flex flex-col md:flex-row gap-6 sm:gap-8 justify-center items-stretch z-10 max-w-5xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 24 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
						viewport={{ once: true, amount: 0.2 }}
						className="w-full"
					>
						<Card className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:border-emerald-100">
							<div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
							<CardHeader className="pt-6 pb-2 px-6">
								<div className="flex items-center gap-3">
									<div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
										<Target size={22} strokeWidth={2} />
									</div>
									<CardTitle className="text-xl font-semibold text-gray-900">
										{t('about.missionTitle')}
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="pb-6 px-6 pt-0">
								<p className="text-muted-foreground text-base leading-relaxed">
									{t('about.missionDesc')}
								</p>
							</CardContent>
						</Card>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 24 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
						viewport={{ once: true, amount: 0.2 }}
						className="w-full"
					>
						<Card className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:border-indigo-100">
							<div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-600" />
							<CardHeader className="pt-6 pb-2 px-6">
								<div className="flex items-center gap-3">
									<div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
										<EyeIcon size={22} strokeWidth={2} />
									</div>
									<CardTitle className="text-xl font-semibold text-gray-900">
										{t('about.visionTitle')}
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="pb-6 px-6 pt-0">
								<p className="text-muted-foreground text-base leading-relaxed">
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
