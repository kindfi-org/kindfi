'use client'

import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

import { motion } from 'framer-motion'
import { Checkbox } from '~/components/base/checkbox'
import { Progress } from '~/components/base/progress'
import {
	fadeInUp,
	fadeInWithDelay,
	fadeSlideLeft,
	scaleFadeIn,
} from '~/lib/constants/animations'
import { requiredItems } from '~/lib/mock-data/project/mock-pitch'
import type { RequiredItem } from '~/lib/types/project/pitch.types'
import { cn } from '~/lib/utils'

export function Hero() {
	const [items, setItems] = useState<RequiredItem[]>(requiredItems)

	const completedCount = items.filter((item) => item.completed).length
	const progress = (completedCount / items.length) * 100

	const toggleItem = (id: string) => {
		setItems((prevItems) =>
			prevItems.map((item) =>
				item.id === id ? { ...item, completed: !item.completed } : item,
			),
		)
	}

	return (
		<motion.div className="mx-auto" {...fadeInUp}>
			<motion.h1 className="text-2xl font-bold" {...fadeInWithDelay(0.2)}>
				Complete Your Pitch
			</motion.h1>
			<motion.p className="text-gray-600" {...fadeInWithDelay(0.4)}>
				Before you can start collecting reservations, fill out at least 2
				Highlights, your Pitch, and your Contract.
			</motion.p>

			<motion.section
				className="rounded-lg shadow-md p-6 mt-5"
				{...scaleFadeIn}
			>
				<div className="mt-4 flex justify-between items-center">
					<h2 className="text-lg font-semibold">Required Items</h2>
					<span className="text-gray-500 text-sm">
						{completedCount} of {items.length} completed
					</span>
				</div>

				{/* Progress Bar */}
				<motion.div {...fadeSlideLeft(0.7)}>
					<Progress value={progress} className="h-2 mt-2" />
				</motion.div>

				{/* Checklist */}
				<ul className="mt-4 space-y-3">
					{items.map((item, index) => (
						<motion.li
							key={item.id}
							className={cn(
								'flex items-center justify-between p-4 rounded-lg transition-colors',
								item.completed ? 'bg-muted' : 'hover:bg-muted/50',
							)}
							{...fadeSlideLeft(0.8 + index * 0.2)}
						>
							<div className="w-6 h-6 flex items-center justify-center border-2 rounded-full mr-3 border-primary">
								<Checkbox
									id={item.id}
									checked={item.completed}
									onCheckedChange={() => toggleItem(item.id)}
								/>
							</div>
							<span className="flex-1 text-gray-800">{item.label}</span>
							<ArrowRight className="text-gray-900 w-5 h-5" />
						</motion.li>
					))}
				</ul>
			</motion.section>
		</motion.div>
	)
}
