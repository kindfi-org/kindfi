'use client'

import { motion, useReducedMotion } from 'framer-motion'
import {
	features,
} from '~/lib/constants/final-cta-data'

export const FinalCTA = () => {
	const shouldReduceMotion = useReducedMotion()

	return (
		<section className="relative py-24 overflow-hidden">
			{/* Background */}
			<div
				className="absolute inset-0 gradient-bg-blue-purple to-white"
				role="presentation"
				aria-hidden="true"
			>
				<div
					className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"
					role="presentation"
					aria-hidden="true"
				/>
			</div>

			<div className="relative container mx-auto px-4">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{
						opacity: 1,
						y: shouldReduceMotion ? 0 : 20,
					}}
					viewport={{ once: true }}
					transition={{
						duration: shouldReduceMotion ? 0.3 : 0.6,
					}}
					className="text-center mb-16 max-w-3xl mx-auto"
				>
					<h2 className="text-4xl font-bold text-gray-900 mb-6">
						Built by Web3 Developers
						<span className="block gradient-text">
							Designed for Real-World Change
						</span>
					</h2>
					<p className="text-lg text-gray-600 leading-relaxed">
						KindFi is the first crowdfunding platform built by Web3 developers
						specifically for verified social impact. Backed by the Stellar
						blockchain, we bridge crypto transparency with human needs uniting
						cause creators, collaborators, and communities across Latin America
						and beyond. When you launch on KindFi, you are not just raising
						funds. You are joining a movement to make social good unstoppable
						and accountable.
					</p>
				</motion.div>

				{/* Main Content */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch">
					{features.map((feature, index) => (
						<motion.div
							key={feature.id}
							initial={{ opacity: 0, x: -20 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
						>
							<div className="flex items-center gap-4 mb-4">
								<div className="p-2 rounded-xl bg-teal-50">
									{feature.icon}
								</div>
								<h3 className="text-xl font-semibold text-gray-900">
									{feature.title}
								</h3>
							</div>
							<p className="text-gray-600 leading-relaxed pl-14 flex-1">
								{feature.description}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	)
}
