'use client'

import React from 'react'
import { Button } from '~/components/base/button'
import { type ProjectIconType, ProjectIcons } from '~/components/icons'
import { cn } from '~/lib/utils'

const categories: Array<{
	id: ProjectIconType
	label: string
}> = [
	{ id: 'sustainability', label: 'Sustainability' },
	{ id: 'education', label: 'Education' },
	{ id: 'healthcare', label: 'Healthcare' },
	{ id: 'climate', label: 'Climate Action' },
	{ id: 'equality', label: 'Social Equality' },
	{ id: 'food', label: 'Food Security' },
	{ id: 'water', label: 'Clean Water' },
	{ id: 'energy', label: 'Clean Energy' },
	{ id: 'poverty', label: 'Poverty Relief' },
	{ id: 'community', label: 'Community' },
]

interface CategoryFiltersProps {
	selectedCategory: ProjectIconType | null
	onSelectCategory: (category: ProjectIconType | null) => void
}

export function CategoryFilters({
	selectedCategory,
	onSelectCategory,
}: CategoryFiltersProps) {
	return (
		<div className="w-full overflow-x-auto">
			<div className="flex gap-4 min-w-max px-4 py-2">
				{categories.map(({ id, label }) => {
					const Icon = ProjectIcons[id]
					const isSelected = selectedCategory === id

					return (
						<Button
							key={id}
							variant="ghost"
							className={cn(
								'flex-col gap-2 h-auto py-2',
								isSelected && 'text-blue-600',
							)}
							onClick={() => onSelectCategory(isSelected ? null : id)}
						>
							<Icon className="h-6 w-6" />
							<span className="text-xs">{label}</span>
						</Button>
					)
				})}
			</div>
		</div>
	)
}
