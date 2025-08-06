/** biome-ignore-all lint/a11y/useSemanticElements: any */
'use client'

import { motion } from 'framer-motion'
import { LayoutGrid, List } from 'lucide-react'

import { Button } from '~/components/base/button'

type ViewMode = 'grid' | 'list'

interface ViewToggleProps {
	viewMode: ViewMode
	onViewModeChange: (mode: ViewMode) => void
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
	return (
		<div
			className="flex items-center space-x-2 bg-gray-100 p-1 rounded-md"
			role="radiogroup"
		>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => onViewModeChange('grid')}
				className={`relative ${viewMode === 'grid' ? 'text-primary' : 'text-gray-500'}`}
				aria-label="Grid view"
				aria-checked={viewMode === 'grid'}
				role="radio"
			>
				{viewMode === 'grid' && (
					<motion.div
						layoutId="viewModeIndicator"
						className="absolute inset-0 bg-white rounded-sm z-0"
						initial={false}
						transition={{ type: 'spring', duration: 0.3 }}
					/>
				)}
				<LayoutGrid className="h-4 w-4 relative z-10" aria-hidden="true" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => onViewModeChange('list')}
				className={`relative ${viewMode === 'list' ? 'text-primary' : 'text-gray-500'}`}
				aria-label="List view"
				aria-checked={viewMode === 'list'}
				role="radio"
			>
				{viewMode === 'list' && (
					<motion.div
						layoutId="viewModeIndicator"
						className="absolute inset-0 bg-white rounded-sm z-0"
						initial={false}
						transition={{ type: 'spring', duration: 0.3 }}
					/>
				)}
				<List className="h-4 w-4 relative z-10" aria-hidden="true" />
			</Button>
		</div>
	)
}
