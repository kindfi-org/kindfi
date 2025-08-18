'use client'

import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { KindfiMission } from '~/components/sections/home/mision'
import { SectionCaption } from '~/components/shared/section-caption'
import { fadeInUpAnimation } from '~/lib/constants/animations'
import { features } from '~/lib/constants/join-us-data'

export function JoinUs() {
	return (
		<section className="relative py-24 overflow-hidden">
			{/* Background */}
			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
			</div>

			<div className="relative container mx-auto px-4">
				{/* Section Caption */}
				<motion.div {...fadeInUpAnimation}>
					<SectionCaption
						title="Join the KindFi Movement: Support Change. Earn Trust. Build Impact."
						subtitle="KindFi is more than a platform — it's a new way to fund real change. Whether you're a cause creator or a supporter, every action you take earns trust, builds your on-chain reputation, and strengthens a transparent, community-led ecosystem."
						highlightWords={[
							'Support Change. Earn Trust. Build Impact',
							'KindFi',
						]}
					/>
				</motion.div>

				{/* Feature Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16">
					{features.map((feature, index) => (
						<motion.div
							key={feature.id}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
						>
							<article
								className="group h-full bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300"
								aria-labelledby={`feature-title-${feature.id}`}
							>
								{feature.icon}

								<h3
									id={`feature-title-${feature.id}`}
									className="mt-6 text-xl font-semibold text-gray-900"
								>
									{feature.title}
								</h3>
								<p className="mt-4 text-gray-600 leading-relaxed">
									{feature.description}
								</p>
							</article>
						</motion.div>
					))}
				</div>

				<KindfiMission />
			</div>
		</section>
	)
}
