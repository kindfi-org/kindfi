'use client'

import { motion } from 'framer-motion'
import { CategoryCard } from '~/components/base/category-card'
import { impactCategories } from '~/lib/constants/impact-data/impact-categories'

export function ImpactCategories() {
	return (
		<section className="py-16">
			<div className="container">
				<div className="mb-12 text-center">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						viewport={{ once: true }}
						className="mb-4 text-4xl font-bold"
					>
						Impact Categories
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						viewport={{ once: true }}
						className="mx-auto max-w-2xl text-lg text-gray-600"
					>
						Explore the diverse areas where KindFi projects are creating
						positive change.
					</motion.p>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					{impactCategories.map((category, index) => (
						<CategoryCard key={category.id} category={category} index={index} />
					))}
				</div>
			</div>
		</section>
	)
}
