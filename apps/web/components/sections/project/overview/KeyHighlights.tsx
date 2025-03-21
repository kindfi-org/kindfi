'use client'

import { useState } from 'react'

import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'

interface HighlightItem {
	id: string
	title: string
	description: string
	indicator?: number
	backgroundColor?: string
}

const highlightItems: HighlightItem[] = [
	{
		id: 'vc-backed',
		title: 'VC-Backed',
		description: 'Raised $250K or more from a venture firm',
	},
	{
		id: 'traction',
		title: 'Traction',
		description: '$110M in signed customer LOIs',
		indicator: 1,
	},
	{
		id: 'team',
		title: 'Team',
		description:
			'Powerhouse of experts in tech, engineering & biz, united to transform energy systems',
		indicator: 2,
	},
	{
		id: 'technology',
		title: 'Technology',
		description:
			'Fully functional 40%-scale prototype proving our technologies and design architecture',
		indicator: 3,
	},
	{
		id: 'patents',
		title: 'Patents',
		description: '3 applications filed to protect our core innovations',
		indicator: 4,
	},
	{
		id: 'market-potential',
		title: 'Market Potential',
		description:
			'Projected to address a $500B+ market with increasing global energy demands',
		indicator: 5,
	},
	{
		id: 'sustainability',
		title: 'Sustainability',
		description:
			'Designed for clean energy with zero emissions and a circular economy approach',
		indicator: 6,
	},
]

export function KeyHighlights() {
	const [showAll, setShowAll] = useState(false)
	const displayedItems = showAll ? highlightItems : highlightItems.slice(0, 5)

	return (
		<div className="space-y-6">
			<h2 className="text-3xl font-bold">Key Highlights</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{displayedItems.map((item) => (
					<Card
						key={item.id}
						className={`overflow-hidden ${item.indicator === undefined ? 'bg-purple-100 text-blue-800' : ''}`}
					>
						<CardContent className="p-6 relative">
							{item.indicator && (
								<div className="absolute top-6 right-6 bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-medium">
									{item.indicator}
								</div>
							)}
							<h3 className="text-xl font-medium mb-2">{item.title}</h3>
							<p>{item.description}</p>
						</CardContent>
					</Card>
				))}
			</div>
			{highlightItems.length > 5 && (
				<div>
					<Button
						variant="outline"
						onClick={() => setShowAll(!showAll)}
						className="text-gray-700"
					>
						{showAll ? 'Show less' : 'Show more'}
					</Button>
				</div>
			)}
		</div>
	)
}
