'use client'

import { useEffect, useState } from 'react'
import ProjectCard, { type Project } from '../shared/project-card'
import { FilterSort } from './filter-sort'

interface ProjectsGridProps {
	projects: Project[]
	title: string
	description: string
}

export const ProjectsGrid: React.FC<ProjectsGridProps> = ({
	projects,
	title,
	description,
}) => {
	const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects)
	const [filter, setFilter] = useState('all')
	const [sort, setSort] = useState('trending')

	useEffect(() => {
		let result = [...projects]

		// Apply filtering
		if (filter !== 'all') {
			result = result.filter((project) =>
				project.category
					? project.category.toLowerCase() === filter.toLowerCase()
					: '',
			)
		}

		// Apply sorting
		if (sort === 'trending') {
			result = result.sort(
				(a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0),
			)
		} else if (sort === 'mostFunded') {
			result = result.sort((a, b) => (b.raised ?? 0) - (a.raised ?? 0))
		} else if (sort === 'newest') {
			// This would typically sort by date, but for mock data we'll just use id
			result = result.sort((a, b) => Number(b.id) - Number(a.id))
		}

		setFilteredProjects(result)
	}, [filter, sort, projects])

	return (
		<section className="py-24 lg:py-32 px-6 lg:px-8">
			<div className="container">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
					<div>
						<h2 className="text-3xl font-bold tracking-tight lg:text-4xl mb-4">
							{title}
						</h2>
						<p className="text-lg text-muted-foreground">{description}</p>
					</div>
					<FilterSort
						onFilterChange={setFilter}
						onSortChange={setSort}
						initialFilter={filter}
						initialSort={sort}
					/>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
					{filteredProjects.map((project) => (
						<ProjectCard key={project.id} project={project} />
					))}
				</div>
			</div>
		</section>
	)
}
