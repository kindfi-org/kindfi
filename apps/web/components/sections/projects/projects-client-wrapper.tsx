'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
	ProjectCardGrid,
	ProjectCardList,
} from '~/components/sections/projects/cards'
import {
	CategoryFilters,
	SortDropdown,
	ViewToggle,
} from '~/components/sections/projects/filters'
import {
	CategoryBadgeSkeleton,
	ProjectCardGridSkeleton,
	ProjectCardListSkeleton,
} from '~/components/sections/projects/skeletons'
import { staggerContainer } from '~/lib/constants/animations'
import { useI18n } from '~/lib/i18n'
import { getAllCategories, getAllProjects } from '~/lib/queries/projects'
import type { Project, SortOption } from '~/lib/types/project'

export function ProjectsClientWrapper() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { t } = useI18n()
	const initialCategoryParams = searchParams.getAll('category')
	const sortParam = searchParams.get('sort') ?? 'most-popular'

	const {
		data: initialProjects = [],
		isLoading: isLoadingProjects,
		error: projectError,
	} = useSupabaseQuery(
		'projects',
		(client) => getAllProjects(client, initialCategoryParams, sortParam),
		{
			additionalKeyValues: [initialCategoryParams, sortParam],
		},
	)

	const {
		data: categories = [],
		isLoading: isLoadingCategories,
		error: categoryError,
	} = useSupabaseQuery('categories', getAllCategories, {
		staleTime: 1000 * 60 * 60, // 1 hour
		gcTime: 1000 * 60 * 60, // 1 hour
	})

	const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
	const [selectedCategories, setSelectedCategories] = useState<string[]>(
		initialCategoryParams,
	)
	const [sortOption, setSortOption] = useState<SortOption>('Most Popular')
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

	useEffect(() => {
		if (sortParam === 'most-recent') setSortOption('Most Recent')
		else if (sortParam === 'most-funded') setSortOption('Most Funded')
		else if (sortParam === 'most-supporters') setSortOption('Most Supporters')
		else if (sortParam === 'most-popular') setSortOption('Most Popular')
	}, [sortParam])

	useEffect(() => {
		setFilteredProjects(initialProjects)
	}, [initialProjects])

	const handleCategoryToggle = (categorySlug: string) => {
		const next = selectedCategories.includes(categorySlug)
			? selectedCategories.filter((id) => id !== categorySlug)
			: [...selectedCategories, categorySlug]

		setSelectedCategories(next)

		const params = new URLSearchParams(searchParams.toString())
		params.delete('category')
		for (const slug of next) {
			params.append('category', slug)
		}
		router.push(`?${params.toString()}`)
	}

	const handleResetCategories = () => {
		setSelectedCategories([])

		const params = new URLSearchParams(searchParams.toString())
		params.delete('category')
		router.push(`?${params.toString()}`)
	}

	const handleSortChange = (newSort: SortOption) => {
		setSortOption(newSort)
		const params = new URLSearchParams(searchParams.toString())
		params.set('sort', newSort.toLowerCase().replace(/ /g, '-'))
		for (const slug of selectedCategories) {
			params.append('category', slug)
		}
		router.push(`?${params.toString()}`)
	}

	if (projectError || categoryError) {
		return (
			<div className="text-center text-destructive py-12">
				{t('common.error')}: {projectError?.message || categoryError?.message}
			</div>
		)
	}

	return (
		<div>
			<motion.div
				className="mb-6"
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.25, ease: 'easeOut' }}
			>
				{isLoadingCategories ? (
					<div className="flex flex-wrap gap-2">
						{Array.from({ length: 12 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: using index as key is acceptable here
							<CategoryBadgeSkeleton key={i} />
						))}
					</div>
				) : (
					<CategoryFilters
						categories={categories}
						selectedCategories={selectedCategories}
						onCategoryToggle={handleCategoryToggle}
						onResetCategories={handleResetCategories}
					/>
				)}

				<div className="flex flex-col md:flex-row gap-4 justify-between">
					<div className="flex flex-row items-center justify-between gap-2 md:gap-4">
						<h2 className="text-xl font-semibold">
							{t('nav.exploreProjects')}
						</h2>
						<p className="text-sm text-gray-500 md:hidden">
							{selectedCategories.length > 0
								? `${filteredProjects.length} ${filteredProjects.length === 1 ? t('projects.title').slice(0, -1) : t('projects.title')}`
								: `${filteredProjects.length} ${filteredProjects.length === 1 ? t('projects.title').slice(0, -1) : t('projects.title')}`}
						</p>
					</div>

					<div className="flex flex-row items-center gap-0 md:gap-4 justify-between md:justify-end">
						<p className="hidden md:block text-sm text-gray-500">
							{selectedCategories.length > 0
								? `${filteredProjects.length} ${filteredProjects.length === 1 ? t('projects.title').slice(0, -1) : t('projects.title')}`
								: `${filteredProjects.length} ${filteredProjects.length === 1 ? t('projects.title').slice(0, -1) : t('projects.title')}`}
						</p>
						<SortDropdown value={sortOption} onChange={handleSortChange} />
						<ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
					</div>
				</div>
			</motion.div>
			<AnimatePresence mode="wait">
				<motion.div
					key={viewMode}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
				>
					{isLoadingProjects ? (
						<div className="flex gap-4 flex-wrap">
							{Array.from({ length: 8 }).map((_, i) =>
								viewMode === 'grid' ? (
									// biome-ignore lint/suspicious/noArrayIndexKey: using index as key is acceptable here
									<ProjectCardGridSkeleton key={i} />
								) : (
									// biome-ignore lint/suspicious/noArrayIndexKey: using index as key is acceptable here
									<ProjectCardListSkeleton key={i} />
								),
							)}
						</div>
					) : viewMode === 'grid' ? (
						<motion.div
							className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
							variants={staggerContainer}
							initial="initial"
							animate="animate"
							role="feed"
							aria-label="Projects grid view"
						>
							{filteredProjects.map((project) => (
								<ProjectCardGrid key={project.id} project={project} />
							))}
						</motion.div>
					) : (
						<motion.div
							className="flex flex-col gap-6"
							variants={staggerContainer}
							initial="initial"
							animate="animate"
							role="feed"
							aria-label="Projects list view"
						>
							{filteredProjects.map((project) => (
								<ProjectCardList key={project.id} project={project} />
							))}
						</motion.div>
					)}
				</motion.div>
			</AnimatePresence>
		</div>
	)
}
