'use client'

import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CategoryFilter } from '~/components/sections/projects/category-filter'
import { ProjectsGrid } from '~/components/sections/projects/projects-grid'
import { ProjectsHeader } from '~/components/sections/projects/projects-header'
import { SortDropdown } from '~/components/sections/projects/sort-dropdown'
import { useProjectsFilter } from '~/hooks/use-projects-filter'
import type { SortOption } from '~/hooks/use-projects-filter'
import { projects } from '~/lib/mock-data/mock-projects'
import type { Project } from '~/components/shared/project-card'

export default function ProjectsPage() {
	const [projectsData, setProjectsData] = useState<Project[]>([])
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
	const {
		selectedCategories,
		setSelectedCategories,
		sortOption,
		setSortOption,
		filterProjects,
		sortProjects,
	} = useProjectsFilter()

	// Simulate real data loading (for future API integration)
	useEffect(() => {
		setProjectsData(projects)
	}, [])

	const filteredProjects = filterProjects(
		sortProjects(projectsData, sortOption),
	)

	return (
		<div className="container mx-auto px-4 py-8">
			<ProjectsHeader
				title="Causes That Change Lives"
				viewMode={viewMode}
				onViewModeChange={setViewMode}
			/>

			<div className="mt-8 mb-12">
				<CategoryFilter
					selectedCategories={selectedCategories}
					onCategoryToggle={(category: string) => {
						if (selectedCategories.includes(category)) {
							setSelectedCategories(
								selectedCategories.filter((id) => id !== category),
							)
						} else {
							setSelectedCategories([...selectedCategories, category])
						}
					}}
				/>
			</div>

			<div className="flex justify-between items-center mb-8">
				<h2 className="text-2xl font-semibold">Social Causes To Support</h2>
				<div className="flex items-center gap-4">
					<button
						type="button"
						className="text-primary-500 hover:underline bg-transparent border-none p-0 cursor-pointer"
						onClick={() => {
							/*future logic */
						}}
					>
						See all ({projectsData.length})
					</button>
					<SortDropdown
						value={sortOption}
						onChange={(value: SortOption) => setSortOption(value)}
					/>
				</div>
			</div>

			<AnimatePresence mode="wait">
				<ProjectsGrid projects={filteredProjects} viewMode={viewMode} />
			</AnimatePresence>
		</div>
	)
}
