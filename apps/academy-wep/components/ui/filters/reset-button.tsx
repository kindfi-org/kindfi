'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ActiveFilter } from '~/lib/types/filters.types'
import { Button } from '../../base/button'

interface ResetButtonProps {
	onReset: () => void
	activeFilters?: ActiveFilter[]
	removeFilter: (filter: ActiveFilter) => void
}

export function ResetButton({
	onReset,
	activeFilters = [],
	removeFilter,
}: ResetButtonProps) {
	// Helper function to capitalize first letter
	const capitalize = (str: string) => {
		return str.charAt(0).toUpperCase() + str.slice(1)
	}

	// Only render content when there are active filters
	if (activeFilters.length === 0) {
		return null // Don't render anything when no filters are active
	}

	// Group filters by type to handle animations better
	const filtersByType: Record<string, ActiveFilter[]> = activeFilters.reduce(
		(acc, filter) => {
			if (!acc[filter.type]) {
				acc[filter.type] = []
			}
			acc[filter.type].push(filter)
			return acc
		},
		{} as Record<string, ActiveFilter[]>,
	)

	return (
		<motion.div
			className="w-full"
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			transition={{ duration: 0.3 }}
		>
			<div className="flex justify-end mb-4 overflow-hidden rounded-md">
				<motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.95 }}>
					<Button
						onClick={onReset}
						className="bg-transparent text-black hover:text-white border hover:border-none group hover:bg-primary-500"
					>
						<X className="text-black group-hover:text-white mr-2" />
						Reset Filters
					</Button>
				</motion.div>
			</div>
			<motion.div
				className="flex lg:items-center  flex-col lg:flex-row gap-2"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.1 }}
			>
				<p className="text-gray-600 w-full lg:w-fit text-left">
					Active filters:
				</p>
				<div className="flex flex-wrap gap-3">
					{/* Render filters by type to maintain layout animations */}
					{Object.keys(filtersByType).map((filterType) => (
						<AnimatePresence mode="popLayout" key={filterType}>
							{filtersByType[filterType].map((filter) => (
								<motion.div
									key={filter.value}
									className="flex items-center bg-primary/10 px-3 py-1 rounded-full"
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.8 }}
									transition={{ duration: 0.3 }}
									layoutId={`filter-${filter.type}`}
								>
									<span className="text-sm text-primary">
										{capitalize(filter.type)}: {filter.value}
									</span>
									<motion.button
										onClick={() => removeFilter(filter)}
										className="ml-2 text-primary hover:text-primary-500"
										aria-label={`Remove ${filter.type} filter`}
										whileHover={{ scale: 1.2 }}
										whileTap={{ scale: 0.8 }}
									>
										<X size={14} />
									</motion.button>
								</motion.div>
							))}
						</AnimatePresence>
					))}{' '}
					<motion.button
						onClick={onReset}
						className="text-sm ml-2 text-zinc-500 hover:text-zinc-600"
						aria-label="Clear all filters"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						Clear all
					</motion.button>
				</div>
			</motion.div>
		</motion.div>
	)
}
