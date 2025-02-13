'use client'

import { AlertCircle } from 'lucide-react'
import React from 'react'
import type { ProjectIconType } from '~/components/icons/index'
import { CategoryFilters } from '~/components/sections/projects/category-filters'
import { mockProjects } from '~/components/sections/projects/mock-data'
import { ProjectGrid } from '~/components/sections/projects/project-grid'
import {
	type SortOption,
	SortingControls,
} from '~/components/sections/projects/sorting-controls'
import { Paginations } from '~/components/shared/pagination'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Skeleton } from '~/components/ui/skeleton'

const ITEMS_PER_PAGE = 8

export default function ProjectsPage() {
	const [selectedCategory, setSelectedCategory] =
		React.useState<ProjectIconType | null>(null)
	const [sortBy, setSortBy] = React.useState('popular')
	const [currentPage, setCurrentPage] = React.useState(1)
	const [isLoading, setIsLoading] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)
	const [projects, setProjects] = React.useState(mockProjects)

	const fetchProjects = React.useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)
			// Simulate API call with mock data
			await new Promise((resolve) => setTimeout(resolve, 1000))
			setProjects(mockProjects)
		} catch (err) {
			setError('Failed to load projects. Please try again later.')
		} finally {
			setIsLoading(false)
		}
	}, [])

	React.useEffect(() => {
		void fetchProjects()
	}, [fetchProjects])

	// Reset page when category changes
	React.useEffect(() => {
		setCurrentPage(1)
	}, []) // Removed selectedCategory from dependencies

	const filteredProjects = React.useMemo(
		() =>
			projects
				.filter(
					(project) =>
						!selectedCategory || project.category === selectedCategory,
				)
				.sort((a, b) => {
					switch (sortBy) {
						case 'recent':
							return (
								new Date(b.createdAt).getTime() -
								new Date(a.createdAt).getTime()
							)
						case 'funded':
							return b.percentageReached - a.percentageReached
						default:
							return b.supporters - a.supporters
					}
				}),
		[projects, selectedCategory, sortBy],
	)

	const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE)
	const paginatedProjects = React.useMemo(
		() =>
			filteredProjects.slice(
				(currentPage - 1) * ITEMS_PER_PAGE,
				currentPage * ITEMS_PER_PAGE,
			),
		[filteredProjects, currentPage],
	)

	const handlePageChange = (page: number) => {
		setCurrentPage(page)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	if (error) {
		return (
			<Alert variant="destructive" className="m-4">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		)
	}

	return (
		<main className="container mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold mb-6">Causes That Change Lives</h1>

			<CategoryFilters
				selectedCategory={selectedCategory}
				onSelectCategory={setSelectedCategory}
			/>

			<div className="flex justify-between items-center mt-8 mb-6">
				<div className="flex items-center gap-4">
					<h2 className="text-xl">Social Causes To Support</h2>
					<button type="button" className="text-blue-600 text-sm">
						See all ({filteredProjects.length})
					</button>
				</div>
				<SortingControls
					value={sortBy}
					onChange={(value: string) => setSortBy(value as SortOption)}
				/>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{Array.from({ length: ITEMS_PER_PAGE }).map(() => (
						<div key={crypto.randomUUID()} className="space-y-3">
							<Skeleton className="h-48 w-full rounded-lg" />
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-4 w-1/2" />
						</div>
					))}
				</div>
			) : (
				<>
					<ProjectGrid projects={paginatedProjects} />
					{totalPages > 1 && (
						<div className="mt-8 flex justify-center">
							<Paginations
								currentPage={currentPage}
								totalPages={totalPages}
								onPageChange={handlePageChange}
							/>
						</div>
					)}
				</>
			)}
		</main>
	)
}
