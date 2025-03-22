'use client'

import { useState } from 'react'

import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import { highlightItems } from '~/lib/mock-data/project/mock-overview-section'

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
