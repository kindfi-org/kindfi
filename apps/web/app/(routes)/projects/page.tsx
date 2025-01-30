'use client'

import React from 'react'
import type { ProjectIconType } from '~/components/icons/index'
import { CategoryFilters } from '~/components/sections/projects/category-filters'
import { mockProjects } from '~/components/sections/projects/mock-data'
import { ProjectGrid } from '~/components/sections/projects/project-grid'
import { SortingControls } from '~/components/sections/projects/sorting-controls'

export default function ProjectsPage() {
	const [selectedCategory, setSelectedCategory] =
		React.useState<ProjectIconType | null>(null)
	const [sortBy, setSortBy] = React.useState('popular')

	const filteredProjects = mockProjects.filter(
		(project) => !selectedCategory || project.category === selectedCategory,
	)

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
						See all (50)
					</button>
				</div>
				<SortingControls value={sortBy} onChange={setSortBy} />
			</div>

			<ProjectGrid projects={filteredProjects} />
		</main>
	)
}
