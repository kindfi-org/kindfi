'use client'

import type { Tables } from '@services/supabase'
import { motion, useReducedMotion } from 'framer-motion'
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
	variant?: 'default' | 'embedded'
}

export function CategoryFilters({
	categories,
	selectedCategories,
	onCategoryToggle,
	onResetCategories,
	variant = 'default',
}: CategoryFiltersProps) {
	const { t } = useI18n()
	const reducedMotion = useReducedMotion()
	const scrollRef = useRef<HTMLDivElement | null>(null)
	const [showLeftFade, setShowLeftFade] = useState(false)
	const [showRightFade, setShowRightFade] = useState(false)
	const isEmbedded = variant === 'embedded'

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
			className={cn('relative flex flex-col', !isEmbedded && 'mb-6 space-y-3')}
			initial={reducedMotion ? false : { opacity: 0, y: 8 }}
			animate={reducedMotion ? false : { opacity: 1, y: 0 }}
			transition={reducedMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
		>
			{!isEmbedded ? (
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold text-slate-900">{t('projects.filterByCategory')}</h3>
					{selectedCategories.length > 0 ? (
						<Button
							variant="ghost"
							size="sm"
							onClick={onResetCategories}
							className="rounded-full text-muted-foreground hover:text-slate-900"
							aria-label={t('projects.clearCategories')}
						>
							<X className="mr-1 h-4 w-4" aria-hidden="true" />
							{t('projects.clearCategories')}
						</Button>
					) : null}
				</div>
			) : selectedCategories.length > 0 ? (
				<div className="mb-3 flex justify-end">
					<Button
						variant="ghost"
						size="sm"
						onClick={onResetCategories}
						className="rounded-full text-muted-foreground hover:text-slate-900"
						aria-label={t('projects.clearCategories')}
					>
						<X className="mr-1 h-4 w-4" aria-hidden="true" />
						{t('projects.clearCategories')}
					</Button>
				</div>
			) : null}

			{showLeftFade ? (
				<div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white to-transparent" />
			) : null}
			{showRightFade ? (
				<div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent" />
			) : null}

			<motion.div
				ref={scrollRef}
				className="flex gap-2 overflow-x-auto overflow-y-hidden py-1 no-scrollbar"
				variants={reducedMotion ? undefined : staggerContainer}
				initial={reducedMotion ? false : 'initial'}
				animate={reducedMotion ? false : 'animate'}
				role="group"
				aria-label={t('projects.filterByCategory')}
			>
				{categories.map((category) => (
					<motion.div
						key={category.id}
						variants={reducedMotion ? undefined : fadeIn}
						className="shrink-0"
					>
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
