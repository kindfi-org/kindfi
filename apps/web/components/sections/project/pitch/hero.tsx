'use client'

import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

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
		<div className="max-w-2xl mx-auto">
			<h2 className="text-2xl font-bold">Complete Your Pitch</h2>
			<p className="text-gray-600">
				Before you can start collecting reservations, fill out at least 2
				Highlights, your Pitch, and your Contract.
			</p>

			<section className="rounded-lg shadow-md p-6 mt-5">
				<div className="mt-4 flex justify-between items-center">
					<h3 className="text-lg font-semibold">Required Items</h3>
					<span className="text-gray-500 text-sm">
						{completedCount} of {items.length} completed
					</span>
				</div>

				{/* Progress Bar */}
				<Progress value={progress} className="h-2 mt-2" />

				{/* Checklist */}
				<ul className="mt-4 space-y-3">
					{items.map((item) => (
						<li
							key={item.id}
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
						</li>
					))}
				</ul>
			</section>
		</div>
	)
}
