'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { ProjectCardGrid, ProjectCardList } from '~/components/sections/projects/cards'
import { EmptyProject } from '~/components/sections/projects/empty-project'
import { CategoryTicker, SortDropdown, ViewToggle } from '~/components/sections/projects/filters'
import {
	ProjectCardGridSkeleton,
	ProjectCardListSkeleton,
} from '~/components/sections/projects/skeletons'
import { SectionContainer } from '~/components/shared/section-container'
import { staggerContainer } from '~/lib/constants/animations'
import { useI18n } from '~/lib/i18n'
import { getAllCategories, getAllProjects } from '~/lib/queries/projects'
import type { SortOption } from '~/lib/types/project'

const sortSlugToOption = (sortParam: string): SortOption => {
	if (sortParam === 'most-recent') return 'Most Recent'
	if (sortParam === 'most-funded') return 'Most Funded'
	if (sortParam === 'most-supporters') return 'Most Supporters'
	return 'Most Popular'
}

const formatResultsCount = (count: number, t: (key: string) => string) => {
	if (count === 1) {
		return t('projects.resultsCountOne').replace('{count}', String(count))
	}
	return t('projects.resultsCountMany').replace('{count}', String(count))
}

export function ProjectsClientWrapper() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { t, language } = useI18n()
	const reducedMotion = useReducedMotion()
	const categoryParams = searchParams.getAll('category')
	const categoryFilterKey = categoryParams.join(',')
	const sortParam = searchParams.get('sort') ?? 'most-popular'
	const selectedCategories = categoryParams
	const sortOption = sortSlugToOption(sortParam)

	const {
		data: projects = [],
		isLoading: isLoadingProjects,
		error: projectError,
	} = useSupabaseQuery(
		'projects',
		(client) =>
			getAllProjects(client, categoryParams, sortParam, undefined, { viewerLocale: language }),
		{
			additionalKeyValues: [categoryFilterKey, sortParam, language],
		},
	)

	const {
		data: categories = [],
		isLoading: isLoadingCategories,
		error: categoryError,
	} = useSupabaseQuery('categories', getAllCategories, {
		staleTime: 1000 * 60 * 60,
		gcTime: 1000 * 60 * 60,
	})

	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

	const handleCategoryToggle = (categorySlug: string) => {
		const next = selectedCategories.includes(categorySlug)
			? selectedCategories.filter((slug) => slug !== categorySlug)
			: [...selectedCategories, categorySlug]

		const params = new URLSearchParams(searchParams.toString())
		params.delete('category')
		for (const slug of next) {
			params.append('category', slug)
		}
		router.push(`?${params.toString()}`, { scroll: false })
	}

	const handleResetCategories = () => {
		const params = new URLSearchParams(searchParams.toString())
		params.delete('category')
		router.push(`?${params.toString()}`, { scroll: false })
	}

	const handleSortChange = (newSort: SortOption) => {
		const params = new URLSearchParams(searchParams.toString())
		params.set('sort', newSort.toLowerCase().replace(/ /g, '-'))
		router.push(`?${params.toString()}`, { scroll: false })
	}

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
						<p className="mt-1 text-lg font-semibold text-slate-900">
							{isLoadingProjects ? t('projects.loading') : formatResultsCount(projects.length, t)}
						</p>
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
						) : projects.length === 0 ? (
							<EmptyProject
								selectedCategories={selectedCategories}
								onClearFilters={handleResetCategories}
							/>
						) : viewMode === 'grid' ? (
							<motion.div
								className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
								variants={reducedMotion ? undefined : staggerContainer}
								initial={reducedMotion ? false : 'initial'}
								animate={reducedMotion ? false : 'animate'}
								role="feed"
								aria-label="Projects grid view"
							>
								{projects.map((project, index) => (
									<ProjectCardGrid key={project.id} project={project} index={index} />
								))}
							</motion.div>
						) : (
							<motion.div
								className="flex flex-col gap-6"
								variants={reducedMotion ? undefined : staggerContainer}
								initial={reducedMotion ? false : 'initial'}
								animate={reducedMotion ? false : 'animate'}
								role="feed"
								aria-label="Projects list view"
							>
								{projects.map((project) => (
									<ProjectCardList key={project.id} project={project} />
								))}
							</motion.div>
						)}
					</motion.div>
				</AnimatePresence>
			</SectionContainer>
		</section>
	)
}
