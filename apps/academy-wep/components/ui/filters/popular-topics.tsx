'use client'

import { cn } from '~/lib/utils'
import { Button } from '../../base/button'

interface PopularTopicsProps {
	topics: string[]
	selected: number
	onTopicSelect: (topic: string, index: number) => void
}

// Define topic colors outside the component
const TOPIC_COLORS = [
	{
		bg: 'bg-primary-50 hover:bg-primary-200 text-primary-700',
		borderSelected: 'border-primary-500 bg-primary-200',
		borderNormal: 'border-primary-200',
	},
	{
		bg: 'bg-blue-50 hover:bg-blue-200 text-blue-700',
		borderSelected: 'border-blue-500 bg-blue-200',
		borderNormal: 'border-blue-200',
	},
	{
		bg: 'bg-purple-50 hover:bg-purple-200 text-purple-700',
		borderSelected: 'border-purple-500 bg-purple-200',
		borderNormal: 'border-purple-200',
	},
	{
		bg: 'bg-yellow-50 hover:bg-yellow-200 text-yellow-700',
		borderSelected: 'border-yellow-500 bg-yellow-200',
		borderNormal: 'border-yellow-200',
	},
]

export function PopularTopics({
	topics,
	selected,
	onTopicSelect,
}: PopularTopicsProps) {
	return (
		<div className="flex flex-col w-auto gap-4">
			<p className="font-normal text-base">Popular Topics</p>
			<div className="flex flex-wrap items-start gap-2">
				{topics.map((topic, i) => {
					const color = TOPIC_COLORS[i % TOPIC_COLORS.length]
					return (
						<Button
							key={topic}
							onClick={() => onTopicSelect(topic, i)}
							className={cn(
								'transition-all rounded-full px-4 py-2 font-medium border cursor-pointer',
								color.bg,
								selected === i ? color.borderSelected : color.borderNormal,
							)}
							aria-pressed={selected === i}
							type="button"
						>
							{topic}
						</Button>
					)
				})}
			</div>
		</div>
	)
}
