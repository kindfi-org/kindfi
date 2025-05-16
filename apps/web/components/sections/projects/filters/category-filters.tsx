'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'

import type { Tables } from '@services/supabase'
import { Button } from '~/components/base/button'
import { fadeIn, staggerContainer } from '~/lib/constants/animations'
import { CategoryBadge } from './'

interface CategoryFiltersProps {
	categories: Tables<'categories'>[]
	selectedCategories: string[]
	onCategoryToggle: (categorySlug: string) => void
	onResetCategories: () => void
}

export function CategoryFilters({
	categories,
	selectedCategories,
	onCategoryToggle,
	onResetCategories,
}: CategoryFiltersProps) {
	return (
		<div className="flex flex-col space-y-3 mb-6">
			<div className="flex justify-between items-center">
				<h3 className="font-medium">Filter by category</h3>
				{selectedCategories.length > 0 && (
					<Button
						variant="ghost"
						size="sm"
						onClick={onResetCategories}
						className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
						aria-label="Clear all category filters"
					>
						<X className="h-4 w-4" aria-hidden="true" />
						Clear categories
					</Button>
				)}
			</div>
			<motion.div
				className="flex flex-wrap gap-2"
				variants={staggerContainer}
				initial="initial"
				animate="animate"
			>
				{categories.map((category) => (
					<motion.div key={category.id} variants={fadeIn}>
						<CategoryBadge
							category={category}
							selected={selectedCategories.includes(category.slug ?? '')}
							onClick={() => onCategoryToggle(category.slug ?? '')}
						/>
					</motion.div>
				))}
			</motion.div>
		</div>
	)
}
