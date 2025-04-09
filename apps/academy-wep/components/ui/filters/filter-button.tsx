'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Filter, LayoutGrid, Menu, X } from 'lucide-react'
import type { LayoutType } from '~/lib/types/filters.types'
import { cn } from '~/lib/utils'
import { Button } from '../../base/button'

interface FilterButtonProps {
	onFilterClick: () => void
	onLayoutChange: (layout: LayoutType) => void
	currentLayout: LayoutType
	isExpanded?: boolean
}

export function FilterButton({
	onFilterClick,
	onLayoutChange,
	currentLayout,
	isExpanded = false,
}: FilterButtonProps) {
	return (
		<div className="flex flex-row gap-4 justify-between lg:justify-between lg:w-auto w-full">
			<Button
				onClick={onFilterClick}
				aria-label={isExpanded ? 'Hide filters' : 'Show filters'}
				aria-expanded={isExpanded}
				className="bg-primary-500 hover:bg-primary-600 transition-all rounded-md shadow-lg hover:shadow-xl w-36 h-10 cursor-pointer"
				type="button"
			>
				<Filter className="mr-2" />
				Filters
				<AnimatePresence mode="wait" initial={false}>
					{isExpanded ? (
						<motion.span
							key="x-icon"
							initial={{ opacity: 0, scale: 0 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0 }}
							transition={{ duration: 0.2 }}
							className="ml-2"
						>
							<X />
						</motion.span>
					) : null}
				</AnimatePresence>
			</Button>

			<div
				className="bg-white rounded-md border border-gray-200 flex-row flex p-1 items-center gap-1"
				role="radiogroup"
				aria-label="Layout selection"
			>
				<Button
					onClick={() => onLayoutChange('grid')}
					className={cn(
						'focus:outline-none border-none shadow-none py-1 px-2.5 cursor-pointer',
						currentLayout === 'grid'
							? 'text-primary bg-primary-100/50 hover:bg-primary-100/50'
							: 'text-gray-400 bg-transparent hover:bg-primary-100',
					)}
					aria-label="Grid layout"
					aria-pressed={currentLayout === 'grid'}
					type="button"
				>
					<LayoutGrid className="w-6 h-6" />
				</Button>
				<Button
					onClick={() => onLayoutChange('list')}
					className={cn(
						'focus:outline-none border-none shadow-none py-1 px-2.5 cursor-pointer',
						currentLayout === 'list'
							? 'text-primary bg-primary-100/50 hover:bg-primary-100/50'
							: 'text-gray-400 bg-transparent hover:bg-primary-100',
					)}
					aria-label="List layout"
					aria-pressed={currentLayout === 'list'}
					type="button"
				>
					<Menu className="w-6 h-6" />
				</Button>
			</div>
		</div>
	)
}
