'use client'

import { motion } from 'framer-motion'
import { StoryCard } from '~/components/shared/story-card'
import { successStories } from '~/lib/constants/impact-data/succes-data'

export function SuccessStories() {
	return (
		<section className="py-16">
			<div className="container">
				<div className="mb-16 text-center">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						viewport={{ once: true }}
						className="mb-4 text-4xl font-bold"
					>
						Featured Success Stories
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						viewport={{ once: true }}
						className="mx-auto max-w-2xl text-lg text-gray-600"
					>
						Discover how KindFi projects are making a real difference in
						communities worldwide.
					</motion.p>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					{successStories.map((story) => (
						<StoryCard key={story.id} story={story} />
					))}
				</div>
			</div>
		</section>
	)
}
