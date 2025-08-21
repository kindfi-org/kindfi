'use client'

import { motion } from 'framer-motion'
import type { Testimonial } from '~/lib/types/impact/impact-testimonial.types'
import { UserAvatar } from '../base/user-avatar'

interface TestimonialCardProps {
	testimonial: Testimonial
	index: number
}

export function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: index * 0.1 }}
			viewport={{ once: true }}
			className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg"
		>
			<UserAvatar
				src={testimonial.image}
				alt={testimonial.name}
				name={testimonial.name}
				className="mb-4 w-20 h-20"
			/>

			<div className="text-center">
				<h3 className="text-xl font-semibold">{testimonial.name}</h3>
				<p className="text-gray-600">
					{testimonial.role}, {testimonial.location}
				</p>
			</div>

			<blockquote className="mt-6 text-center">
				<p className="italic text-gray-700">&quot;{testimonial.quote}&quot;</p>
			</blockquote>
		</motion.div>
	)
}
