'use client'

import { useSetState } from 'react-use'
import { ProjectsGrid } from '~/components/sections/projects/projects-grid'
import { ProjectsHeader } from '~/components/sections/projects/projects-header'
import { useProjectsFilter } from '~/hooks/use-projects-filter'
import { projects as mockProjectsView } from '~/lib/mock-data/project/projects.mock'
import type { Project } from '~/lib/types'

export default function ProjectsPage() {
	const [state, setState] = useSetState<{
		projects: Project[]
		viewMode: 'grid' | 'list'
	}>({
		projects: mockProjectsView,
		viewMode: 'grid',
	})
	const {
		selectedCategories,
		setSelectedCategories,
		sortOption,
		setSortOption,
		filterProjects,
		sortProjects,
	} = useProjectsFilter()

	const { projects, viewMode } = state

	const filteredProjects = filterProjects(
		sortProjects(state.projects, sortOption),
	)

	//? Function to clear all selected categories
	const handleClearFilters = () => {
		setSelectedCategories([])
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<ProjectsHeader
				title="Change Lives One Block at a Time"
				viewMode={viewMode}
				onViewModeChange={(val) =>
					setState((prev) => ({ ...prev, viewMode: val }))
				}
				selectedCategories={selectedCategories}
				setSelectedCategories={setSelectedCategories}
				totalItems={filteredProjects.length}
				showSortDropdown
				sortOption={sortOption}
				onSortChange={setSortOption}
			/>

			<ProjectsGrid
				projects={filteredProjects}
				viewMode={viewMode}
				selectedCategories={selectedCategories}
				onClearFilters={handleClearFilters}
			/>
		</div>
	)
}
