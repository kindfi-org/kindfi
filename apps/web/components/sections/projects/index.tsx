'use client'

import React from 'react'
import { CategoryFilters } from './category-filters'
import { mockProjects } from './mock-data'
import { ProjectGrid } from './project-grid'
import { SortingControls } from './sorting-controls'

export function ProjectsSection() {
	const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
		null,
	)
	const [sortBy, setSortBy] = React.useState('popular')

	const filteredProjects = mockProjects.filter(
		(project) => !selectedCategory || project.category === selectedCategory,
	)

	return (
		<section className="w-full max-w-7xl mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold mb-6">Causes That Change Lives</h1>

			<CategoryFilters
				selectedCategory={selectedCategory}
				onSelectCategory={setSelectedCategory}
			/>

			<div className="flex justify-between items-center mt-8 mb-6">
				<h2 className="text-xl">Social Causes To Support</h2>
				<SortingControls value={sortBy} onChange={setSortBy} />
			</div>

			<ProjectGrid projects={filteredProjects} />
		</section>
	)
}
