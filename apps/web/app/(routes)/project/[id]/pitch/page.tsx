'use client'

import { motion } from 'framer-motion'

import Hero from '~/components/sections/project/pitch/hero'
import TipsSidebar from '~/components/sections/project/pitch/tips-sidebar'
import UpcomingSteps from '~/components/sections/project/pitch/upcoming-steps'

export default function PitchPage() {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="px-4 py-8 max-w-2xl lg:max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] justify-center gap-8"
		>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="space-y-8"
			>
				<Hero />
				<UpcomingSteps />
			</motion.div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.2 }}
			>
				<TipsSidebar />
			</motion.div>
		</motion.div>
	)
}
