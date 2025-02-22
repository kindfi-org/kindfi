'use client'

import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import type { Testimonial } from '~/lib/types/impact/testimonial'

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
			className="flex flex-col items-center rounded-2xl bg-white p-8 shadow-lg"
		>
			<Avatar className="h-20 w-20 mb-4">
				<AvatarImage src={testimonial.image} alt={testimonial.name} />
				<AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
			</Avatar>

			<div className="text-center">
				<h3 className="text-xl font-semibold">{testimonial.name}</h3>
				<p className="text-gray-600">
					{testimonial.role}, {testimonial.location}
				</p>
			</div>

			<blockquote className="mt-6 text-center">
				<p className="text-gray-700 italic">"{testimonial.quote}"</p>
			</blockquote>
		</motion.div>
	)
}
