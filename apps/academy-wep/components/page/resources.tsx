'use client'

import { useState } from 'react'

import { Button } from '~/components/base/button'
import { AllResources } from '~/components/sections/resources/all-resources'
import { FilterPanel } from '~/components/sections/resources/filter-panel'
import { ResourceCard } from '~/components/sections/resources/resource-card'
import { useResourceFilters } from '~/hooks/resources/use-resource-filters'
import { resources } from '~/lib/mock-data/mock-resources'

export function Resources() {
	const {
		selectedCategories,
		selectedTypes,
		selectedLevels,
		sortOption,
		filteredResources,
		visibleCount,
		setSortOption,
		resetFilters,
		toggleCategory,
		toggleType,
		toggleLevel,
		loadMore,
	} = useResourceFilters(resources)

	const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(false)

	return (
		<div className="flex-1 p-4 pt-0">
			<div className="max-w-7xl mx-auto">
				<AllResources
					totalResources={filteredResources.length}
					sortOption={sortOption}
					onSortChange={setSortOption}
					onToggleFilters={() => setIsFilterPanelVisible((v) => !v)}
				/>

				{isFilterPanelVisible && (
					<div className="bg-white rounded-lg p-6 shadow-sm mb-8 border border-gray-100">
						<FilterPanel
							resources={resources}
							selectedCategories={selectedCategories}
							selectedTypes={selectedTypes}
							selectedLevels={selectedLevels}
							onCategoryChange={toggleCategory}
							onTypeChange={toggleType}
							onLevelChange={toggleLevel}
							onResetFilters={resetFilters}
						/>
					</div>
				)}

				{filteredResources.length > 0 ? (
					<>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-4">
							{filteredResources.slice(0, visibleCount).map((resource) => (
								<ResourceCard
									key={resource.id}
									type={resource.type}
									category={resource.category}
									title={resource.title}
									description={resource.description}
									timeToConsume={resource.timeToConsume}
									level={resource.level}
									tags={resource.tags}
									likes={resource.likes}
									comments={resource.comments}
									date={resource.date}
									slug={resource.slug}
								/>
							))}
						</div>

						{visibleCount < filteredResources.length && (
							<div className="flex justify-center">
								<Button
									variant="outline"
									onClick={loadMore}
									className="text-gray-800 bg-white hover:text-primary hover:bg-white border-gray-200 hover:border-primary"
								>
									Load More Resources
								</Button>
							</div>
						)}
					</>
				) : (
					<div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
						<h3 className="text-lg font-medium mb-2">No resources found</h3>
						<p className="text-muted-foreground mb-4">
							Try adjusting your filters to find what you&apos;re looking for.
						</p>
						<Button
							variant="outline"
							size="sm"
							className="text-gray-800 bg-white hover:text-primary hover:bg-white border-gray-200 hover:border-primary rounded-full"
							onClick={resetFilters}
						>
							Reset Filters
						</Button>
					</div>
				)}
			</div>
		</div>
	)
}
