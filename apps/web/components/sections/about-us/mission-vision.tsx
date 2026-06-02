'use client'

import { motion } from 'framer-motion'
import { EyeIcon, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/base/card'
import { AboutSectionHeader } from '~/components/sections/about-us/about-section-header'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'

const cardClassName =
	'h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:border-emerald-200/60 hover:shadow-md'

const MissionVision = () => {
	const { t } = useI18n()

	return (
		<section
			className="relative bg-white py-16 sm:py-20 lg:py-24"
			aria-labelledby="about-our-purpose-heading"
		>
			<SectionContainer maxWidth="6xl">
				<AboutSectionHeader
					id="about-our-purpose-heading"
					title={t('about.ourPurpose')}
					subtitle={t('about.purposeLead')}
				/>

				<div className="mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-6 md:grid-cols-2 md:gap-8">
					<MissionVisionCard
						icon={<Target size={22} strokeWidth={2} aria-hidden />}
						title={t('about.missionTitle')}
						description={t('about.missionDesc')}
						delay={0.05}
					/>
					<MissionVisionCard
						icon={<EyeIcon size={22} strokeWidth={2} aria-hidden />}
						title={t('about.visionTitle')}
						description={t('about.visionDesc')}
						delay={0.1}
					/>
				</div>
			</SectionContainer>
		</section>
	)
}

function MissionVisionCard({
	icon,
	title,
	description,
	delay,
}: {
	icon: React.ReactNode
	title: string
	description: string
	delay: number
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
			viewport={{ once: true, amount: 0.2 }}
		>
			<Card className={cardClassName}>
				<CardHeader className="px-6 pb-2 pt-6">
					<div className="flex items-center gap-3">
						<div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">{icon}</div>
						<CardTitle className="text-xl font-semibold text-slate-900">{title}</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="px-6 pb-6 pt-0 text-left">
					<p className="text-base leading-relaxed text-muted-foreground">{description}</p>
				</CardContent>
			</Card>
		</motion.div>
	)
}

export { MissionVision }
