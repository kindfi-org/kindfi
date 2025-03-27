'use client'

import { useSetState } from 'react-use'
import { ProjectsGrid } from '~/components/shared/projects/projects-grid'
import { ProjectsHeader } from '~/components/shared/projects/projects-header'
import { useProjectsFilter } from '~/hooks/use-projects-filter'
import { projects as mockProjectsView } from '~/lib/mock-data/mock-projects'
import type { Project } from '~/lib/types'

export function ProjectsPage() {
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

	return (
		<div className="container mx-auto px-4 py-8">
			<ProjectsHeader
				title="Causes That Change Lives"
				viewMode={viewMode}
				onViewModeChange={(val) =>
					setState((prev) => ({ ...prev, viewMode: val }))
				}
				selectedCategories={selectedCategories}
				setSelectedCategories={setSelectedCategories}
				subHeader="Social Causes To Support"
				totalItems={projects.length}
				showSortDropdown
				sortOption={sortOption}
				onSortChange={setSortOption}
			/>

			<ProjectsGrid projects={filteredProjects} viewMode={viewMode} />
		</div>
	)
}
