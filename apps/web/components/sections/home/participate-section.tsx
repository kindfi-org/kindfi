'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ChevronRight, Megaphone, RefreshCw } from 'lucide-react'
import { Button } from '~/components/base/button'
import { SectionCaption } from '~/components/shared/section-caption'
import { participateContent } from '~/constants/sections/participate'

const iconComponents = {
	ArrowUpRight: (
		<ArrowUpRight className="w-8 h-8 text-teal-600 relative z-10" />
	),
	RefreshCw: <RefreshCw className="w-8 h-8 text-sky-600 relative z-10" />,
	Megaphone: <Megaphone className="w-8 h-8 text-purple-600 relative z-10" />,
}

export const WhyInvestSection = () => {
	return (
		<section className="relative py-24 overflow-hidden">
			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
			</div>

			<div className="relative container mx-auto px-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<SectionCaption
						title={participateContent.title}
						subtitle={participateContent.subtitle}
						highlightWords={participateContent.highlightWords}
					/>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16">
					{participateContent.features.map((feature, index) => (
						<motion.div
							key={feature.id}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
						>
							<div className="group h-full bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
								<div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center relative overflow-hidden group-hover:bg-teal-100 transition-colors duration-300">
									<motion.div
										initial={{ rotate: 0 }}
										animate={{ rotate: 360 }}
										transition={{
											duration: 20,
											repeat: Number.POSITIVE_INFINITY,
											ease: 'linear',
										}}
										className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(20,184,166,0.1),transparent)]"
									/>
									{iconComponents[feature.icon]}
								</div>

								<h3 className="mt-6 text-xl font-semibold text-gray-900">
									{feature.title}
								</h3>
								<p className="mt-4 text-gray-600 leading-relaxed">
									{feature.description}
								</p>

								<div className="mt-6 flex items-center text-sm font-medium text-blue-600">
									{feature.highlight}
									<ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
								</div>
							</div>
						</motion.div>
					))}
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="relative bg-white rounded-2xl p-8 lg:p-12 shadow-lg max-w-3xl mx-auto overflow-hidden"
				>
					<div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-sky-50 opacity-50" />

					<div className="relative">
						<h4 className="text-xl font-semibold text-center text-gray-900 mb-4">
							{participateContent.cta.title}
						</h4>
						<p className="text-gray-600 mb-8 leading-relaxed">
							{participateContent.cta.description}
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button size="lg" className="gradient-btn text-white px-8">
								{participateContent.cta.buttons.primary}
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="gradient-border-btn hover:bg-teal-50"
							>
								{participateContent.cta.buttons.secondary}
							</Button>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	)
}
