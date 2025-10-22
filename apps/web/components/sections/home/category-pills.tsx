'use client'

import type { Tables } from '@services/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { CategoryBadge } from '~/components/sections/projects/shared'
import { CategoryBadgeSkeleton } from '~/components/sections/projects/skeletons'
import useReducedMotion from '~/hooks/use-reduced-motion'
import { useI18n } from '~/lib/i18n'
import { buildProjectsCategoryUrl, cn } from '~/lib/utils'

interface CategoryPillsProps {
	categories: Tables<'categories'>[]
	isLoading: boolean
	error?: unknown
	className?: string
	onCategoryClick?: (category: Tables<'categories'>) => void
	/** If true (default), clicking will navigate to the projects page filtered by category using the slug */
	enableDefaultNavigation?: boolean
	/** Custom URL builder. If provided, overrides the default URL builder */
	buildUrl?: (category: Tables<'categories'>) => string
	/** Show left/right scroll controls (default true) */
	showScrollButtons?: boolean
	/** Enable gentle auto-scroll like a carousel (default true, respects reduced motion) */
	enableAutoScroll?: boolean
	/** Auto-scroll speed in pixels/second (default 40) */
	autoScrollSpeed?: number
}

export function CategoryPills({
	categories,
	isLoading,
	error,
	className,
	onCategoryClick,
	enableDefaultNavigation = true,
	buildUrl,
	showScrollButtons = false,
	enableAutoScroll = true,
	autoScrollSpeed = 40,
}: CategoryPillsProps) {
	const router = useRouter()
	const { t } = useI18n()
	const prefersReducedMotion = useReducedMotion()
	const scrollRef = useRef<HTMLDivElement | null>(null)
	const [isHovered, setIsHovered] = useState(false)
	const [isInteracting, setIsInteracting] = useState(false)
	const [showLeftFade, setShowLeftFade] = useState(false)
	const [showRightFade, setShowRightFade] = useState(false)

	const handleCategoryClick =
		onCategoryClick ||
		(enableDefaultNavigation
			? (category: Tables<'categories'>) => {
					if (!category.slug) return
					const href = buildUrl
						? buildUrl(category)
						: buildProjectsCategoryUrl(category.slug as string)
					router.push(href)
				}
			: undefined)

	// Auto-scroll effect (gentle, pauses on hover/interaction, resets to start at end)
	useEffect(() => {
		if (!enableAutoScroll || prefersReducedMotion) return
		const element = scrollRef.current
		if (!element) return

		let rafId: number | null = null
		let lastTs: number | null = null

		const step = (ts: number) => {
			if (isHovered || isInteracting) {
				lastTs = ts
				rafId = requestAnimationFrame(step)
				return
			}
			if (lastTs == null) lastTs = ts
			const deltaMs = ts - lastTs
			lastTs = ts
			const deltaPx = (autoScrollSpeed * deltaMs) / 1000
			const maxScrollLeft = element.scrollWidth - element.clientWidth
			if (element.scrollLeft + deltaPx >= maxScrollLeft - 1) {
				// reset back to start for a loop effect
				element.scrollTo({ left: 0, behavior: 'auto' })
			} else {
				element.scrollTo({
					left: element.scrollLeft + deltaPx,
					behavior: 'auto',
				})
			}
			rafId = requestAnimationFrame(step)
		}

		rafId = requestAnimationFrame(step)

		return () => {
			if (rafId) cancelAnimationFrame(rafId)
		}
	}, [
		enableAutoScroll,
		prefersReducedMotion,
		isHovered,
		isInteracting,
		autoScrollSpeed,
	])

	const scrollByAmount = (amount: number) => {
		const element = scrollRef.current
		if (!element) return
		element.scrollBy({ left: amount, behavior: 'smooth' })
	}

	// Update edge mask visibility based on scroll position and overflow
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
		<div className={cn('mt-8 relative', className)}>
			{/* Scroll buttons */}
			{showScrollButtons && (
				<>
					<button
						type="button"
						className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow ring-1 ring-black/5 hover:bg-white focus:outline-none"
						aria-label={t('common.previous')}
						onClick={() => scrollByAmount(-240)}
					>
						<span aria-hidden>‹</span>
					</button>
					<button
						type="button"
						className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow ring-1 ring-black/5 hover:bg-white focus:outline-none"
						aria-label={t('common.next')}
						onClick={() => scrollByAmount(240)}
					>
						<span aria-hidden>›</span>
					</button>
				</>
			)}

			{/* Edge fade masks - appear only when scrollable on each side */}
			{showLeftFade && (
				<div className="pointer-events-none absolute inset-y-0 left-0 w-8 z-10 bg-gradient-to-r from-white dark:from-background to-transparent" />
			)}
			{showRightFade && (
				<div className="pointer-events-none absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-white dark:from-background to-transparent" />
			)}

			{/* Horizontal scroll area */}
			<div
				ref={scrollRef}
				className={cn(
					'group relative flex overflow-x-auto overflow-y-hidden no-scrollbar gap-2 p-4',
				)}
				role="navigation"
				aria-label={t('home.categories')}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => {
					setIsHovered(false)
					setIsInteracting(false)
				}}
				onPointerDown={() => setIsInteracting(true)}
				onKeyDown={() => setIsInteracting(true)}
			>
				{isLoading ? (
					<div className="flex items-center gap-2">
						{Array.from({ length: 12 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: using index as key is acceptable here
							<CategoryBadgeSkeleton key={i} />
						))}
					</div>
				) : error ? (
					<p className="text-sm text-destructive text-center w-full">
						{t('home.failedToLoadCategories')}
					</p>
				) : (
					<div className="flex items-center gap-2 pr-8">
						{categories.map((category) => (
							<CategoryBadge
								key={category.id}
								category={category}
								onClick={
									handleCategoryClick
										? () => handleCategoryClick(category)
										: undefined
								}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
