'use client'

import { motion } from 'framer-motion'
import {
	Contibute,
	ExploreDetails,
	ExploreProject,
} from '~/components/icons/illustrations'
import { StepCard } from '~/components/shared/steps-card'
import { investorContent } from '~/constants/sections/investor'

const iconComponents = {
	ExploreProject,
	ExploreDetails,
	Contibute,
}

interface NewInvestorGuideProps {
	className?: string
}

const NewInvestorGuide = ({ className = '' }: NewInvestorGuideProps) => {
	return (
		<section className={`relative py-24 overflow-hidden ${className}`}>
			{/* Background */}
			<div className="absolute inset-0 gradient-bg-blue-purple">
				<div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
			</div>

			<div className="relative container mx-auto px-4">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center mb-20"
				>
					<h2 className="text-4xl font-bold text-gray-900 mb-6">
						<span className="block">{investorContent.title.main}</span>
						<span className="block gradient-text">
							{investorContent.title.highlight}
						</span>
					</h2>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						{investorContent.description}
					</p>
				</motion.div>

				{/* Steps */}
				<div className="max-w-4xl mx-auto space-y-20">
					{investorContent.steps.map((step, index) => (
						<StepCard
							key={`step-${step.stepNumber}`}
							{...step}
							Icon={iconComponents[step.Icon]}
							isReversed={index % 2 !== 0}
						/>
					))}
				</div>
			</div>
		</section>
	)
}

export default NewInvestorGuide
