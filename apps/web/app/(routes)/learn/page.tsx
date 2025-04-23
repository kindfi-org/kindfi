'use client'
import { useState } from 'react'
import { CategoryGrid } from '~/components/sections/learning/category-grid'
import { Hero } from '~/components/sections/learning/hero'
import { JoinCommunity } from '~/components/sections/learning/join-community'
import { LatestUpdates } from '~/components/sections/learning/latest-updates'
import { ResourceFilters } from '~/components/sections/learning/resource-filters'
import { ResourceGrid } from '~/components/sections/learning/resource-grid'
import { categories, resources } from '~/lib/mock-data/mock-learning'

export default function LearningPage() {
	const [activeLevel, setActiveLevel] = useState('all levels')
	const [searchQuery, setSearchQuery] = useState('')

	const filteredResources = resources.filter((resource) => {
		const matchesLevel =
			activeLevel === 'all levels' ||
			resource.level.toLowerCase() === activeLevel.toLowerCase()
		const matchesSearch =
			!searchQuery ||
			resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			resource.description.toLowerCase().includes(searchQuery.toLowerCase())
		return matchesLevel && matchesSearch
	})

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<Hero />

			{/* Categories Section */}
			<section className="py-24">
				<div className="container">
					<CategoryGrid categories={categories} />
				</div>
			</section>

			{/* Featured Resources Section */}
			<section className="py-24 bg-gray-50/40">
				<div className="container">
					{/* Header and Filters */}
					<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-16 gap-8">
						<div className="max-w-md">
							<h2 className="text-3xl font-bold mb-2">Featured Resources</h2>
							<p className="text-gray-600">
								Discover our most popular guides, tutorials, and articles.
							</p>
						</div>

						<div className="flex-1 lg:flex lg:justify-end">
							<ResourceFilters
								activeLevel={activeLevel}
								onLevelChange={setActiveLevel}
								onSearch={setSearchQuery}
							/>
						</div>
					</div>

					{/* Resources Grid */}
					<ResourceGrid resources={filteredResources} />
				</div>
			</section>

			{/* Latest Updates */}
			<LatestUpdates />

			{/* Join Community Section */}
			<JoinCommunity />
		</div>
	)
}
