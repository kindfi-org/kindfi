'use client'

import { motion } from 'framer-motion'
import { EyeIcon, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/base/card'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'

const MissionVision = () => {
	const { t } = useI18n()

	return (
		<motion.section
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
			viewport={{ once: true, amount: 0.2 }}
			className="relative bg-muted/30 py-16 sm:py-20 lg:py-24"
			aria-labelledby="about-our-purpose-heading"
		>
			<SectionContainer maxWidth="6xl">
				<motion.div
					className="mx-auto mb-12 max-w-3xl text-center sm:mb-16"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					viewport={{ once: true, amount: 0.2 }}
				>
					<h2
						id="about-our-purpose-heading"
						className="mb-3 text-3xl font-bold tracking-tight gradient-text sm:text-4xl"
					>
						{t('about.ourPurpose')}
					</h2>
					<p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
						{t('about.purposeLead')}
					</p>
				</motion.div>

				<div className="mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-6 md:grid-cols-2 md:gap-8">
					<motion.div
						initial={{ opacity: 0, y: 24 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{
							duration: 0.5,
							ease: [0.22, 1, 0.36, 1],
							delay: 0.05,
						}}
						viewport={{ once: true, amount: 0.2 }}
					>
						<Card className="h-full overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md">
							<div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
							<CardHeader className="px-6 pb-2 pt-6">
								<div className="flex items-center gap-3">
									<div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600">
										<Target size={22} strokeWidth={2} aria-hidden />
									</div>
									<CardTitle className="text-xl font-semibold text-foreground">
										{t('about.missionTitle')}
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="px-6 pb-6 pt-0 text-left">
								<p className="text-base leading-relaxed text-muted-foreground">
									{t('about.missionDesc')}
								</p>
							</CardContent>
						</Card>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 24 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
						viewport={{ once: true, amount: 0.2 }}
					>
						<Card className="h-full overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md">
							<div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-600" />
							<CardHeader className="px-6 pb-2 pt-6">
								<div className="flex items-center gap-3">
									<div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-600">
										<EyeIcon size={22} strokeWidth={2} aria-hidden />
									</div>
									<CardTitle className="text-xl font-semibold text-foreground">
										{t('about.visionTitle')}
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="px-6 pb-6 pt-0 text-left">
								<p className="text-base leading-relaxed text-muted-foreground">
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
