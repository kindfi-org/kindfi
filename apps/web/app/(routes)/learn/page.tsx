'use client'
import { useState } from 'react'
import { CategoryGrid } from '~/components/sections/learning/category-grid'
import { NewsGrid } from '~/components/sections/learning/news-grid'
import { ResourceFilters } from '~/components/sections/learning/resource-filters'
import { ResourceGrid } from '~/components/sections/learning/resource-grid'
import { SectionHeader } from '~/components/sections/learning/section-header'
import {
	categories,
	newsUpdates,
	resources,
} from '~/lib/constants/mock-data/mock-learning'

export default function LearningPage() {
	const [activeLevel, setActiveLevel] = useState('all')
	const [searchQuery, setSearchQuery] = useState('')

	const filteredResources = resources.filter((resource) => {
		const matchesLevel =
			activeLevel === 'all' || resource.level.toLowerCase() === activeLevel
		const matchesSearch =
			resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			resource.description.toLowerCase().includes(searchQuery.toLowerCase())
		return matchesLevel && matchesSearch
	})

	return (
		<div className="min-h-screen bg-background">
			{/* Categories Section */}
			<section className="section-spacing section-padding">
				<div className="container">
					<SectionHeader
						title="Learning Categories"
						description="Explore our comprehensive learning resources across different topics."
					/>
					<CategoryGrid categories={categories} />
				</div>
			</section>

			{/* Featured Resources */}
			<section className="section-spacing section-padding gradient-bg-blue-purple">
				<div className="container">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
						<SectionHeader
							title="Featured Resources"
							description="Discover our most popular guides, tutorials, and articles."
							alignment="left"
							className="mb-0 md:mb-0"
						/>
						<ResourceFilters
							activeLevel={activeLevel}
							onLevelChange={setActiveLevel}
							onSearch={setSearchQuery}
						/>
					</div>
					<ResourceGrid resources={filteredResources} />
				</div>
			</section>

			{/* Latest Updates */}
			<section className="section-spacing section-padding">
				<div className="container">
					<SectionHeader
						title="Latest Updates"
						description="Stay informed about the latest developments in Web3 crowdfunding."
					/>
					<NewsGrid updates={newsUpdates} />
				</div>
			</section>
		</div>
	)
}
