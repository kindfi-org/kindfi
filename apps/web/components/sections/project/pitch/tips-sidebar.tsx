'use client'

import { motion } from 'framer-motion'
import { CircleHelp } from 'lucide-react'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import { fadeInWithDelay, fadeSlideUp } from '~/lib/constants/animations'
import { tips } from '~/lib/mock-data/project/mock-pitch'

export function TipsSidebar() {
	return (
		<motion.aside className="mx-auto" {...fadeInWithDelay(0.5)}>
			<div className="flex items-center gap-2">
				<CircleHelp className="text-gray-500" />
				<h2 className="text-xl font-bold">Tips to Maximize Your Raise</h2>
			</div>
			<div className="mt-4 space-y-4">
				{tips.map((tip, index) => (
					<motion.div key={tip.id} {...fadeSlideUp(0.7 + index * 0.1)}>
						<Card className="p-4 shadow-md border-none">
							<CardContent className="flex items-center gap-4">
								<div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-300">
									<tip.icon className="w-6 h-6" />
								</div>
								<div className="flex-1">
									<h3 className="text-lg font-semibold">{tip.title}</h3>
									<p className="text-gray-600 font-medium">{tip.description}</p>
									<Button variant="link" size="sm" className="px-0">
										{tip.action}
									</Button>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</motion.aside>
	)
}
