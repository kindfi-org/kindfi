'use client'

import { motion } from 'framer-motion'
import { TestimonialCard } from '~/components/shared/testimonial-card-impact'
import { testimonials } from '~/lib/constants/impact-data/testimonials-data'

export function CommunityVoices() {
	return (
		<section className="py-32 bg-gray-50">
			<div className="container">
				<div className="mb-16 text-center">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						viewport={{ once: true }}
						className="mb-4 text-4xl font-bold"
					>
						Community Voices
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						viewport={{ once: true }}
						className="mx-auto max-w-2xl text-lg text-gray-600"
					>
						Real stories from the people and communities impacted by KindFi
						projects.
					</motion.p>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					{testimonials.map((testimonial, index) => (
						<TestimonialCard
							key={testimonial.id}
							testimonial={testimonial}
							index={index}
						/>
					))}
				</div>
			</div>
		</section>
	)
}
