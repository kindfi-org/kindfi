'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { staggerContainer } from '~/lib/constants/animations'
import type { Category, Project, SortOption } from '~/lib/types/project'
import { CategoryFilters } from './category-filters'
import { ProjectCardGrid } from './project-card-grid'
import { ProjectCardList } from './project-card-list'
import { SearchInput } from './search-input'
import { SortDropdown } from './sort-dropdown'
import { ViewToggle } from './view-toggle'

interface ProjectsViewProps {
	initialProjects: Project[]
	categories: Category[]
}

// Number of projects to load per "page"
const PROJECTS_PER_PAGE = 8

export function ProjectsView({
	initialProjects,
	categories,
}: ProjectsViewProps) {
	const [filteredProjects, setFilteredProjects] =
		useState<Project[]>(initialProjects)
	const [displayedProjects, setDisplayedProjects] = useState<Project[]>([])
	const [selectedCategories, setSelectedCategories] = useState<string[]>([])
	const [searchQuery, setSearchQuery] = useState('')
	const [sortOption, setSortOption] = useState<SortOption>('Most Popular')
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
	const [page, setPage] = useState(1)
	const [hasMore, setHasMore] = useState(true)
	const [isLoading, setIsLoading] = useState(false)

	const observer = useRef<IntersectionObserver | null>(null)
	const lastProjectElementRef = useCallback(
		(node: HTMLDivElement | null) => {
			if (isLoading) return
			if (observer.current) observer.current.disconnect()

			observer.current = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting && hasMore) {
					loadMoreProjects()
				}
			})

			if (node) observer.current.observe(node)
		},
		[isLoading, hasMore],
	)

	// Filter projects when dependencies change
	useEffect(() => {
		let result = [...initialProjects]

		// Apply category filter
		if (selectedCategories.length > 0) {
			result = result.filter((project) =>
				selectedCategories.includes(project.categoryId),
			)
		}

		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase()
			result = result.filter(
				(project) =>
					project.title.toLowerCase().includes(query) ||
					project.description.toLowerCase().includes(query),
			)
		}

		// Apply sorting
		switch (sortOption) {
			case 'Most Funded':
				result.sort((a, b) => b.raised - a.raised)
				break
			case 'Most Recent':
				// Since IDs are now strings but we're using them as a proxy for creation date,
				// we need to handle the comparison differently
				result.sort((a, b) => {
					// This assumes IDs are sequential or timestamp-based strings
					// For UUIDs, you might want to sort by a separate createdAt field instead
					return b.id.localeCompare(a.id)
				})
				break
			case 'Most Supporters':
				result.sort((a, b) => b.investors - a.investors)
				break
			// Most Popular is default order
			default:
				break
		}

		setFilteredProjects(result)
		setPage(1)
		setDisplayedProjects(result.slice(0, PROJECTS_PER_PAGE))
		setHasMore(result.length > PROJECTS_PER_PAGE)
	}, [initialProjects, selectedCategories, searchQuery, sortOption])

	const loadMoreProjects = () => {
		if (!hasMore || isLoading) return

		setIsLoading(true)

		// Simulate loading delay
		setTimeout(() => {
			const nextPage = page + 1
			const startIndex = (nextPage - 1) * PROJECTS_PER_PAGE
			const endIndex = nextPage * PROJECTS_PER_PAGE

			const newProjects = filteredProjects.slice(startIndex, endIndex)
			setDisplayedProjects((prev) => [...prev, ...newProjects])
			setPage(nextPage)
			setHasMore(endIndex < filteredProjects.length)
			setIsLoading(false)
		}, 800)
	}

	const handleCategoryToggle = (categoryId: string) => {
		setSelectedCategories((prev) =>
			prev.includes(categoryId)
				? prev.filter((id) => id !== categoryId)
				: [...prev, categoryId],
		)
	}

	const handleResetCategories = () => {
		setSelectedCategories([])
	}

	const handleSearch = (query: string) => {
		setSearchQuery(query)
	}

	return (
		<div>
			<div className="mb-8">
				<CategoryFilters
					categories={categories}
					selectedCategories={selectedCategories}
					onCategoryToggle={handleCategoryToggle}
					onResetCategories={handleResetCategories}
				/>

				<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
					<div className="w-full md:w-1/3">
						<SearchInput onSearch={handleSearch} />
					</div>

					<div className="flex flex-col md:flex-row items-between md:items-center gap-4 w-full md:w-auto justify-between md:justify-end">
						<p className="text-sm text-gray-500" aria-live="polite">
							Showing {displayedProjects.length} of {filteredProjects.length}{' '}
							projects
						</p>

						<div className="flex items-center gap-3 justify-between">
							<SortDropdown value={sortOption} onChange={setSortOption} />
							<ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
						</div>
					</div>
				</div>
			</div>

			<AnimatePresence mode="wait">
				<motion.div
					key={viewMode}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
				>
					{viewMode === 'grid' ? (
						<motion.div
							className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
							variants={staggerContainer}
							initial="initial"
							animate="animate"
							role="feed"
							aria-busy={isLoading}
							aria-label="Projects grid view"
						>
							{displayedProjects.map((project, index) => {
								if (displayedProjects.length === index + 1) {
									return (
										<div ref={lastProjectElementRef} key={project.id}>
											<ProjectCardGrid project={project} />
										</div>
									)
								}

								return <ProjectCardGrid key={project.id} project={project} />
							})}
						</motion.div>
					) : (
						<motion.div
							className="flex flex-col gap-6"
							variants={staggerContainer}
							initial="initial"
							animate="animate"
							role="feed"
							aria-busy={isLoading}
							aria-label="Projects list view"
						>
							{displayedProjects.map((project, index) => {
								if (displayedProjects.length === index + 1) {
									return (
										<div ref={lastProjectElementRef} key={project.id}>
											<ProjectCardList project={project} />
										</div>
									)
								}

								return <ProjectCardList key={project.id} project={project} />
							})}
						</motion.div>
					)}

					{isLoading && (
						<div className="flex justify-center mt-8" aria-live="polite">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
							<span className="sr-only">Loading more projects...</span>
						</div>
					)}

					{!hasMore && filteredProjects.length > 0 && (
						<p className="text-center text-gray-500 mt-8" aria-live="polite">
							No more projects to load
						</p>
					)}

					{filteredProjects.length === 0 && (
						<div className="text-center py-12" aria-live="polite">
							<h3 className="text-xl font-medium mb-2">No projects found</h3>
							<p className="text-gray-500">
								Try adjusting your search or filters
							</p>
						</div>
					)}
				</motion.div>
			</AnimatePresence>
		</div>
	)
}
