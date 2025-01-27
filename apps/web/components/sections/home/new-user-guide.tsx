'use client'

import { motion } from 'framer-motion'
import { StepCard } from '~/components/shared/steps-card'
import { steps } from '~/lib/mock-data/mock-new-user-guide'

export function NewUserGuide() {
	return (
		<section className="relative py-24 overflow-hidden">
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
						<span className="block">New in KindFi?</span>
						<span className="block gradient-text">
							Support Verified Projects Today!
						</span>
					</h2>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						In just 3 simple steps, you can begin contributing to social
						initiatives securely and transparently.
					</p>
				</motion.div>

				{/* Steps */}
				<div className="max-w-4xl mx-auto space-y-20">
					{steps.map((step, index) => (
						<StepCard
							key={`step-${step.stepNumber}`}
							{...step}
							isReversed={index % 2 !== 0}
						/>
					))}
				</div>
			</div>
		</section>
	)
}
