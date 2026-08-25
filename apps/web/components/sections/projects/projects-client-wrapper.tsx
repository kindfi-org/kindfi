'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'
import { ProjectCardGrid, ProjectCardList } from '~/components/sections/projects/cards'
import { EmptyProject } from '~/components/sections/projects/empty-project'
import { CategoryTicker, SortDropdown, ViewToggle } from '~/components/sections/projects/filters'
import { LoadMoreSentinel } from '~/components/sections/projects/load-more-sentinel'
import {
	ProjectCardGridSkeleton,
	ProjectCardListSkeleton,
} from '~/components/sections/projects/skeletons'
import { SectionContainer } from '~/components/shared/section-container'
import { usePaginatedProjects } from '~/hooks/projects/use-paginated-projects'
import { useI18n } from '~/lib/i18n'
import { getAllCategories } from '~/lib/queries/projects'
import type { SortOption } from '~/lib/types/project'

const sortSlugToOption = (sortParam: string): SortOption => {
	if (sortParam === 'most-recent') return 'Most Recent'
	if (sortParam === 'most-funded') return 'Most Funded'
	if (sortParam === 'most-supporters') return 'Most Supporters'
	return 'Most Popular'
}

export function ProjectsClientWrapper() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { t, language } = useI18n()
	const reducedMotion = useReducedMotion()
	const categoryParams = searchParams.getAll('category')
	const sortParam = searchParams.get('sort') ?? 'most-popular'
	const selectedCategories = categoryParams
	const sortOption = sortSlugToOption(sortParam)

	// ─── Paginated projects ───────────────────────────────────────────────────
	const {
		data,
		isLoading: isLoadingProjects,
		error: projectError,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = usePaginatedProjects({
		categorySlugs: categoryParams,
		sortSlug: sortParam,
		language,
	})

	/**
	 * Flatten all pages into a single ordered list.
	 * Pages are stable references — React will not re-render already-rendered
	 * cards when a new page is appended.
	 */
	const allProjects = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data])

	/**
	 * Track the IDs that appeared in the most-recently loaded page.
	 * Only these cards will receive enter animations.
	 */
	const prevCountRef = useRef(0)
	const newIds = useMemo<ReadonlySet<string>>(() => {
		const lastPage = data?.pages[data.pages.length - 1]
		if (!lastPage || data.pages.length === 1) {
			// First load: animate all initial cards
			prevCountRef.current = lastPage?.items.length ?? 0
			return new Set(lastPage?.items.map((p) => p.id) ?? [])
		}
		// Subsequent pages: animate only the newly added IDs
		const ids = new Set(lastPage.items.map((p) => p.id))
		prevCountRef.current = allProjects.length
		return ids
	}, [data, allProjects.length])

	const total = data?.pages[data.pages.length - 1]?.total ?? 0

	// ─── Categories ───────────────────────────────────────────────────────────
	const {
		data: categories = [],
		isLoading: isLoadingCategories,
		error: categoryError,
	} = useSupabaseQuery('categories', getAllCategories, {
		staleTime: 1000 * 60 * 60,
		gcTime: 1000 * 60 * 60,
	})

	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

	// ─── URL-driven filter helpers ─────────────────────────────────────────────
	const handleCategoryToggle = useCallback(
		(categorySlug: string) => {
			const next = selectedCategories.includes(categorySlug)
				? selectedCategories.filter((slug) => slug !== categorySlug)
				: [...selectedCategories, categorySlug]

			const params = new URLSearchParams(searchParams.toString())
			params.delete('category')
			for (const slug of next) {
				params.append('category', slug)
			}
			router.push(`?${params.toString()}`, { scroll: false })
		},
		[selectedCategories, searchParams, router],
	)

	const handleResetCategories = useCallback(() => {
		const params = new URLSearchParams(searchParams.toString())
		params.delete('category')
		router.push(`?${params.toString()}`, { scroll: false })
	}, [searchParams, router])

	const handleSortChange = useCallback(
		(newSort: SortOption) => {
			const params = new URLSearchParams(searchParams.toString())
			params.set('sort', newSort.toLowerCase().replace(/ /g, '-'))
			router.push(`?${params.toString()}`, { scroll: false })
		},
		[searchParams, router],
	)

	// ─── Results count label ───────────────────────────────────────────────────
	const resultsLabel = useMemo(() => {
		if (isLoadingProjects) return t('projects.loading')
		const shown = allProjects.length
		if (total > shown) {
			return t('projects.resultsShowing')
				.replace('{shown}', String(shown))
				.replace('{total}', String(total))
		}
		return total === 1
			? t('projects.resultsCountOne').replace('{count}', String(total))
			: t('projects.resultsCountMany').replace('{count}', String(total))
	}, [isLoadingProjects, allProjects.length, total, t])

	// ─── Error state ───────────────────────────────────────────────────────────
	if (projectError || categoryError) {
		return (
			<SectionContainer className="py-16">
				<div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-8 text-center text-destructive">
					{t('common.error')}: {projectError?.message || categoryError?.message}
				</div>
			</SectionContainer>
		)
	}

	return (
		<section id="projects-results" className="bg-white pb-10 pt-2 sm:pb-12 md:pb-14">
			<SectionContainer withPadding={false} className="px-4 sm:px-6 lg:px-8">
				<CategoryTicker
					categories={categories}
					selectedCategories={selectedCategories}
					onCategoryToggle={handleCategoryToggle}
					onResetCategories={handleResetCategories}
					isLoading={isLoadingCategories}
				/>

				<div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700/80">
							{t('nav.exploreProjects')}
						</p>
						<p className="mt-1 text-lg font-semibold text-slate-900">{resultsLabel}</p>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						<SortDropdown value={sortOption} onChange={handleSortChange} />
						<ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
					</div>
				</div>

				<AnimatePresence mode="wait">
					<motion.div
						key={viewMode}
						initial={reducedMotion ? false : { opacity: 0 }}
						animate={reducedMotion ? false : { opacity: 1 }}
						exit={reducedMotion ? undefined : { opacity: 0 }}
						transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
					>
						{isLoadingProjects ? (
							/* ── Skeleton placeholders while first page loads ── */
							<div
								className={
									viewMode === 'grid'
										? 'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'
										: 'flex flex-col gap-6'
								}
							>
								{Array.from({ length: 6 }).map((_, i) =>
									viewMode === 'grid' ? (
										// biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
										<ProjectCardGridSkeleton key={i} />
									) : (
										// biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
										<ProjectCardListSkeleton key={i} />
									),
								)}
							</div>
						) : allProjects.length === 0 ? (
							<EmptyProject
								selectedCategories={selectedCategories}
								onClearFilters={handleResetCategories}
							/>
						) : viewMode === 'grid' ? (
							/* ── Grid view ── */
							<div
								className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
								role="feed"
								aria-label="Projects grid view"
								aria-busy={isFetchingNextPage}
							>
								{allProjects.map((project, index) => {
									const isNew = newIds.has(project.id)
									if (reducedMotion || !isNew) {
										return (
											<div key={project.id} className="long-list-item h-full">
												<ProjectCardGrid project={project} index={index} />
											</div>
										)
									}
									return (
										<motion.div
											key={project.id}
											initial={{ opacity: 0, y: 16 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
											className="long-list-item h-full"
										>
											<ProjectCardGrid project={project} index={index} />
										</motion.div>
									)
								})}
							</div>
						) : (
							/* ── List view ── */
							<div
								className="flex flex-col gap-6"
								role="feed"
								aria-label="Projects list view"
								aria-busy={isFetchingNextPage}
							>
								{allProjects.map((project) => {
									const isNew = newIds.has(project.id)
									if (reducedMotion || !isNew) {
										return (
											<div key={project.id}>
												<ProjectCardList project={project} />
											</div>
										)
									}
									return (
										<motion.div
											key={project.id}
											initial={{ opacity: 0, y: 16 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
										>
											<ProjectCardList project={project} />
										</motion.div>
									)
								})}
							</div>
						)}
					</motion.div>
				</AnimatePresence>

				{/* ── Load-more sentinel (auto-scroll + button fallback) ── */}
				{!isLoadingProjects && (
					<LoadMoreSentinel
						onLoadMore={fetchNextPage}
						isLoading={isFetchingNextPage}
						hasMore={!!hasNextPage}
					/>
				)}
			</SectionContainer>
		</section>
	)
}
