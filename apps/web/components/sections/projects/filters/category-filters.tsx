'use client'

import type { Tables } from '@services/supabase'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '~/components/base/button'
import { CategoryBadge } from '~/components/sections/projects/shared'
import { fadeIn, staggerContainer } from '~/lib/constants/animations'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'

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
	const { t } = useI18n()
	const scrollRef = useRef<HTMLDivElement | null>(null)
	const [showLeftFade, setShowLeftFade] = useState(false)
	const [showRightFade, setShowRightFade] = useState(false)

	useEffect(() => {
		const element = scrollRef.current
		if (!element) return
		const updateFades = () => {
			const maxScrollLeft = element.scrollWidth - element.clientWidth
			if (maxScrollLeft <= 0) {
				setShowLeftFade(false)
				setShowRightFade(false)
				return
			}
			setShowLeftFade(element.scrollLeft > 2)
			setShowRightFade(element.scrollLeft < maxScrollLeft - 2)
		}
		updateFades()
		const onScroll = () => updateFades()
		element.addEventListener('scroll', onScroll, { passive: true })
		let resizeObserver: ResizeObserver | null = null
		if (typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver(updateFades)
			resizeObserver.observe(element)
		}
		return () => {
			element.removeEventListener('scroll', onScroll)
			if (resizeObserver) resizeObserver.disconnect()
		}
	}, [])
	return (
		<motion.div
			className="flex flex-col space-y-3 mb-6 relative"
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25, ease: 'easeOut' }}
		>
			<div className="flex justify-between items-center">
				<h3 className="font-medium">{t('projects.filterByCategory')}</h3>
				{selectedCategories.length > 0 && (
					<Button
						variant="ghost"
						size="sm"
						onClick={onResetCategories}
						className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
						aria-label={t('projects.clearCategories')}
					>
						<X className="h-4 w-4" aria-hidden="true" />
						{t('projects.clearCategories')}
					</Button>
				)}
			</div>
			{/* Edge fades */}
			{showLeftFade && (
				<div className="pointer-events-none absolute inset-y-10 -left-1 w-6 bg-gradient-to-r from-background to-transparent" />
			)}
			{showRightFade && (
				<div className="pointer-events-none absolute inset-y-10 -right-1 w-6 bg-gradient-to-l from-background to-transparent" />
			)}

			<motion.div
				ref={scrollRef}
				className={cn(
					'flex overflow-x-auto overflow-y-hidden no-scrollbar gap-2 py-1',
				)}
				variants={staggerContainer}
				initial="initial"
				animate="animate"
				role="group"
				aria-label={t('projects.filterByCategory')}
			>
				{categories.map((category) => (
					<motion.div key={category.id} variants={fadeIn} className="shrink-0">
						<CategoryBadge
							category={category}
							selected={selectedCategories.includes(category.slug ?? '')}
							onClick={() => onCategoryToggle(category.slug ?? '')}
						/>
					</motion.div>
				))}
			</motion.div>
		</motion.div>
	)
}
