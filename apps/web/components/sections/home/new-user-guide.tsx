'use client'

import { motion } from 'framer-motion'
import { SectionContainer } from '~/components/shared/section-container'
import { StepCard } from '~/components/shared/steps-card'
import { fadeInUpVariants } from '~/lib/constants/animations'
import { steps } from '~/lib/constants/new-user-guide-data'
import { useI18n } from '~/lib/i18n'

export function NewUserGuide() {
	const { t } = useI18n()

	// Translated steps
	const translatedSteps = [
		{
			...steps[0],
			title: t('home.guideStep1Title'),
			description: t('home.guideStep1Desc'),
		},
		{
			...steps[1],
			title: t('home.guideStep2Title'),
			description: t('home.guideStep2Desc'),
		},
		{
			...steps[2],
			title: t('home.guideStep3Title'),
			description: t('home.guideStep3Desc'),
		},
	]

	return (
		<section className="relative py-24 overflow-hidden">
			<SectionContainer className="relative">
				{/* Header */}
				<motion.div
					variants={fadeInUpVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center mb-20"
				>
					<h2 className="text-4xl font-bold text-gray-900 mb-6">
						<span className="block">{t('home.newUserTitle1')}</span>
						<span className="block gradient-text">
							{t('home.newUserTitle2')}
						</span>
					</h2>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						{t('home.newUserSubtitle')}
					</p>
				</motion.div>

				{/* Steps */}
				<div className="max-w-4xl mx-auto space-y-20">
					{translatedSteps.map((step, index) => (
						<StepCard
							key={`step-${step.stepNumber}`}
							{...step}
							isReversed={index % 2 !== 0}
						/>
					))}
				</div>
			</SectionContainer>
		</section>
	)
}
