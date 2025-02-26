'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { containerVariants, itemVariants } from '~/lib/constants/animations'
import type { Investor } from '~/lib/types/investors/top-investors'
import { InvestorCard } from './investor-card'

interface InvestorGridProps {
	investors: Investor[]
	sortBy: string
	category: string
}

export function InvestorGrid({
	investors,
	sortBy,
	category,
}: InvestorGridProps) {
	const shouldReduceMotion = useReducedMotion()

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={`${sortBy}-${category}`}
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
				variants={shouldReduceMotion ? {} : containerVariants}
				initial="hidden"
				animate="visible"
				exit="hidden"
			>
				{investors.map((investor) => (
					<motion.div
						key={investor.id}
						variants={shouldReduceMotion ? {} : itemVariants}
					>
						<InvestorCard investor={investor} />
					</motion.div>
				))}
			</motion.div>
		</AnimatePresence>
	)
}
