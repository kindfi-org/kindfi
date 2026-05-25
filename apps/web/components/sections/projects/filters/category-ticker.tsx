'use client'

import type { Tables } from '@services/supabase'
import { Heart, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '~/components/base/button'
import { CategoryBadge } from '~/components/sections/projects/shared'
import useReducedMotion from '~/hooks/use-reduced-motion'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'

interface CategoryTickerProps {
	categories: Tables<'categories'>[]
	selectedCategories: string[]
	onCategoryToggle: (categorySlug: string) => void
	onResetCategories: () => void
	isLoading?: boolean
	className?: string
}

export function CategoryTicker({
	categories,
	selectedCategories,
	onCategoryToggle,
	onResetCategories,
	isLoading = false,
	className,
}: CategoryTickerProps) {
	const { t } = useI18n()
	const prefersReducedMotion = useReducedMotion()
	const [isPaused, setIsPaused] = useState(false)

	const tickerCategories = useMemo(
		() => categories.filter((category) => Boolean(category.slug)),
		[categories],
	)

	const hasSelection = selectedCategories.length > 0
	const shouldMarquee =
		!prefersReducedMotion && tickerCategories.length > 4

	return (
		<div
			className={cn(
				'relative z-10 -mt-6 mb-8 sm:-mt-8 sm:mb-10',
				className,
			)}
		>
			<div className="relative overflow-hidden">
					<div className="px-4 pt-5 sm:px-6 sm:pt-6">
						<div className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center">
							<p className="text-balance text-base font-medium leading-relaxed text-slate-800 sm:text-lg">
								{hasSelection
									? t('projects.categoryTickerFiltering')
									: t('projects.categoryTickerMessage')}
							</p>
							<p className="text-sm leading-relaxed text-muted-foreground">
								{hasSelection
									? t('projects.categoryTickerFilteringHint')
									: t('projects.categoryTickerSubline')}
							</p>
							{hasSelection ? (
								<Button
									variant="ghost"
									size="sm"
									onClick={onResetCategories}
									className="mt-2 h-8 rounded-full px-4 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
									aria-label={t('projects.clearCategories')}
								>
									<X className="mr-1.5 h-4 w-4" aria-hidden="true" />
									{t('projects.clearCategories')}
								</Button>
							) : null}
						</div>
					</div>

					<div
						className="relative pb-4 pt-3 sm:pb-5 sm:pt-4"
						onMouseEnter={() => setIsPaused(true)}
						onMouseLeave={() => setIsPaused(false)}
						onFocusCapture={() => setIsPaused(true)}
						onBlurCapture={(event) => {
							if (
								!event.currentTarget.contains(event.relatedTarget as Node | null)
							) {
								setIsPaused(false)
							}
						}}
					>
						<div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent sm:w-14" />
						<div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent sm:w-14" />

						{isLoading ? (
							<div className="flex items-center gap-3 overflow-hidden px-4 sm:px-6">
								{Array.from({ length: 8 }).map((_, index) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
									<div
										key={index}
										className="h-9 w-32 shrink-0 animate-pulse rounded-full bg-emerald-50"
									/>
								))}
							</div>
						) : tickerCategories.length === 0 ? (
							<p className="px-4 py-2 text-center text-sm text-muted-foreground sm:px-6">
								{t('projects.noCategories')}
							</p>
						) : shouldMarquee ? (
							<div
								className={cn(
									'flex w-max items-center animate-category-ticker',
									isPaused && '[animation-play-state:paused]',
								)}
								role="group"
								aria-label={t('projects.filterByCategory')}
							>
								<TickerTrack
									categories={tickerCategories}
									selectedCategories={selectedCategories}
									onCategoryToggle={onCategoryToggle}
								/>
								<TickerTrack
									categories={tickerCategories}
									selectedCategories={selectedCategories}
									onCategoryToggle={onCategoryToggle}
									ariaHidden
								/>
							</div>
						) : (
							<div
								className="flex justify-center gap-2 overflow-x-auto px-4 py-1 no-scrollbar sm:gap-3 sm:px-6"
								role="group"
								aria-label={t('projects.filterByCategory')}
							>
								<TickerTrack
									categories={tickerCategories}
									selectedCategories={selectedCategories}
									onCategoryToggle={onCategoryToggle}
								/>
							</div>
						)}
					</div>
			</div>
		</div>
	)
}

function TickerTrack({
	categories,
	selectedCategories,
	onCategoryToggle,
	ariaHidden = false,
}: {
	categories: Tables<'categories'>[]
	selectedCategories: string[]
	onCategoryToggle: (categorySlug: string) => void
	ariaHidden?: boolean
}) {
	return (
		<div
			className="flex shrink-0 items-center gap-3 px-4 sm:gap-4 sm:px-6"
			aria-hidden={ariaHidden || undefined}
		>
			{categories.map((category, index) => {
				const slug = category.slug ?? ''
				const selected = selectedCategories.includes(slug)

				return (
					<div
						key={`${category.id}-${index}`}
						className="flex shrink-0 items-center gap-3 sm:gap-4"
					>
						{index > 0 ? (
							<Heart
								className="h-3 w-3 shrink-0 fill-emerald-200/80 text-emerald-200/80"
								aria-hidden="true"
							/>
						) : null}
						<CategoryBadge
							category={category}
							selected={selected}
							onClick={
								ariaHidden ? undefined : () => onCategoryToggle(slug)
							}
							className="shadow-sm"
						/>
					</div>
				)
			})}
		</div>
	)
}
