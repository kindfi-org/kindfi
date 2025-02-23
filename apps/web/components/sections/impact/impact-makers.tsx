'use client'

import { motion } from 'framer-motion'
import { ImpactMakerCard } from '~/components/base/impact-maker-card'
import { impactMakers } from '~/lib/constants/impact-data/makers'

export function TopImpactMakers() {
	return (
		<section className="py-32">
			<div className="container">
				<div className="mb-12 text-center">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						viewport={{ once: true }}
						className="mb-4 text-4xl font-bold"
					>
						Top Impact Makers
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						viewport={{ once: true }}
						className="mx-auto max-w-2xl text-lg text-gray-600"
					>
						Celebrating the individuals making extraordinary contributions to
						social causes.
					</motion.p>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					{impactMakers.map((maker, index) => (
						<ImpactMakerCard key={maker.id} maker={maker} index={index} />
					))}
				</div>
			</div>
		</section>
	)
}
