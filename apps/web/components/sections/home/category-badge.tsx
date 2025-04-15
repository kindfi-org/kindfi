'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { categories as defaultCategories } from '~/constants/hero-data'
import { staggerChildren } from '~/lib/constants/animations'
import type { Category } from '~/lib/types'
import { RenderAnimatedCategory } from '~/lib/utils/categories-util'

interface CategoriesProps {
	categories?: Category[]
	className?: string
	layout?: 'grid' | 'flex'
}

export function Categories({
	categories = defaultCategories,
	className = '',
	layout = 'flex',
}: CategoriesProps) {
	const router = useRouter()

	const handleCategoryClick = useCallback(
		(categoryId: string) => {
			router.push(`/projects?category=${categoryId}`)
		},
		[router],
	)

	return (
		<motion.div
			className={`
        ${
					layout === 'grid'
						? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5'
						: 'flex flex-wrap justify-center gap-4 md:gap-5'
				} 
        py-2
        ${className}
      `}
			variants={staggerChildren}
			initial="initial"
			animate="animate"
		>
			{categories.map((category) => (
				<RenderAnimatedCategory
					key={category.id}
					category={category}
					onClick={() => handleCategoryClick(category.id)}
				/>
			))}
		</motion.div>
	)
}
