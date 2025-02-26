'use client'

import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

import { motion } from 'framer-motion'
import { Checkbox } from '~/components/base/checkbox'
import { Progress } from '~/components/base/progress'
import { cn } from '~/lib/utils'

interface RequiredItem {
	id: string
	label: string
	completed: boolean
}

const requiredItems: RequiredItem[] = [
	{ id: 'highlights', label: 'Add at least 2 Highlights', completed: false },
	{ id: 'pitch', label: 'Complete your Pitch', completed: false },
	{ id: 'contract', label: 'Review Contract', completed: false },
]

export default function Hero() {
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
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="mx-auto"
		>
			<motion.h1
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.2, duration: 0.5 }}
				className="text-2xl font-bold"
			>
				Complete Your Pitch
			</motion.h1>
			<motion.p
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.4, duration: 0.5 }}
				className="text-gray-600"
			>
				Before you can start collecting reservations, fill out at least 2
				Highlights, your Pitch, and your Contract.
			</motion.p>

			<motion.section
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 0.6, duration: 0.5 }}
				className="rounded-lg shadow-md p-6 mt-5"
			>
				<div className="mt-4 flex justify-between items-center">
					<h2 className="text-lg font-semibold">Required Items</h2>
					<span className="text-gray-500 text-sm">
						{completedCount} of {items.length} completed
					</span>
				</div>

				{/* Progress Bar */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.7, duration: 0.5 }}
				>
					<Progress value={progress} className="h-2 mt-2" />
				</motion.div>

				{/* Checklist */}
				<ul className="mt-4 space-y-3">
					{items.map((item, index) => (
						<motion.li
							key={item.id}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.8 + index * 0.2, duration: 0.5 }}
							className={cn(
								'flex items-center justify-between p-4 rounded-lg transition-colors',
								item.completed ? 'bg-muted' : 'hover:bg-muted/50',
							)}
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
