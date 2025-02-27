'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { noResultsVariants } from '~/lib/constants/animations'

export function NoResultsMessage() {
	const shouldReduceMotion = useReducedMotion()

	return (
		<motion.div
			key="no-results"
			className="text-center py-12"
			variants={shouldReduceMotion ? {} : noResultsVariants}
			initial="hidden"
			animate="visible"
			exit="hidden"
		>
			<AlertCircle className="mx-auto h-12 w-12 text-gray-800" />
			<h3 className="mt-2 text-sm font-semibold text-gray-800">
				No investors found
			</h3>
			<p className="mt-1 text-sm text-gray-500">
				We couldn't find any investors matching your current filters. Try
				adjusting your category or sorting criteria.
			</p>
		</motion.div>
	)
}
