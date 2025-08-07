'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Lightbulb, Star } from 'lucide-react'
import { Card } from '~/components/base/card'

export function TipsSidebar() {
	return (
		<motion.div
			className="sticky top-16 space-y-6"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.2 }}
		>
			<Card className="p-6 shadow-md hover:shadow-lg transition-shadow bg-white">
				<div className="flex items-center gap-2 mb-4">
					<Star className="w-5 h-5 text-yellow-500" />
					<h3 className="text-xl font-semibold">Writing Tips</h3>
				</div>
				<ul className="space-y-3">
					{[
						'Start with a compelling problem statement',
						'Explain your unique solution clearly',
						'Include specific impact metric goals',
						"Share your team's expertise and passion",
						'Use visuals to support narrative',
						'End with a clear call to action',
					].map((tip) => (
						<li key={tip} className="flex items-start gap-2">
							<ChevronRight className="w-4 h-4 mt-1 text-blue-500 shrink-0" />
							<span>{tip}</span>
						</li>
					))}
				</ul>
			</Card>

			<Card className="p-6 shadow-md hover:shadow-lg transition-shadow bg-white">
				<div className="flex items-center gap-2 mb-2">
					<Lightbulb className="w-5 h-5 text-yellow-500" />
					<h3 className="text-lg font-semibold">Pro Tip</h3>
				</div>
				<p className="text-gray-600">
					Keep your pitch concise and focused. Use data and stories to
					demonstrate your impactful potential.
				</p>
			</Card>
		</motion.div>
	)
}
