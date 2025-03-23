// apps/web/app/(routes)/projects/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { ProjectsGrid } from '~/components/shared/projects/projects-grid'
import ProjectsHeader from '~/components/shared/projects/projects-header'
import { useProjectsFilter } from '~/hooks/use-projects-filter'
import { mockProjectsView } from '~/lib/mock-data/mock-projects-view'

export default function ProjectsPage() {
	const [projects, setProjects] = useState(mockProjectsView)
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
		setProjects(mockProjectsView)
	}, [])

	const filteredProjects = filterProjects(sortProjects(projects, sortOption))

	return (
		<div className="container mx-auto px-4 py-8">
			<ProjectsHeader
				title="Causes That Change Lives"
				viewMode={viewMode}
				onViewModeChange={setViewMode}
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
