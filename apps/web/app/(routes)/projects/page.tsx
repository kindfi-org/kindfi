'use client'

import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Separator } from '~/components/base/separator'
import BusinessModel from '~/components/sections/projects/BusinessModel'
import CompetitiveAdvantages from '~/components/sections/projects/CompetitiveAdvantages'
import InvestmentDetails from '~/components/sections/projects/InvestmentDetails'
import MarketOpportunity from '~/components/sections/projects/MarketOpportunity'
import ProjectDocuments from '~/components/sections/projects/ProjectDocuments'
import ProjectOverview from '~/components/sections/projects/ProjectOverview'
import Technology from '~/components/sections/projects/Technology'
import TractionMilestones from '~/components/sections/projects/TractionMilestones'
import { CategoryFilter } from '~/components/sections/projects/category-filter'
import { ProjectsGrid } from '~/components/sections/projects/projects-grid'
import { ProjectsHeader } from '~/components/sections/projects/projects-header'
import { SortDropdown } from '~/components/sections/projects/sort-dropdown'
import { useProjectsFilter } from '~/hooks/use-projects-filter'
import type { SortOption } from '~/hooks/use-projects-filter'
import { businessModelData } from '~/lib/mock-data/mock-business-model'
import { competitiveAdvantagesData } from '~/lib/mock-data/mock-competitive-adventage'
import { investmentDetailsData } from '~/lib/mock-data/mock-investment-details'
import { marketOpportunityData } from '~/lib/mock-data/mock-market-opportunity'
import { projectDocumentsData } from '~/lib/mock-data/mock-project-documents'
import { projectData } from '~/lib/mock-data/mock-project-overview'
import { mockProjectsView } from '~/lib/mock-data/mock-projects-view'
import { technologyData } from '~/lib/mock-data/mock-technology'
import { tractionMilestonesData } from '~/lib/mock-data/mock-traction-milestones'

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
			{/* Project Details Section */}
			<div className="mb-16">
				<h1 className="text-3xl font-bold mb-8">Project Details</h1>

				{/* Project Overview */}
				<section className="mb-12">
					<ProjectOverview {...projectData} />
				</section>

				<Separator className="my-12" />

				{/* Business Model */}
				<section className="mb-12">
					<BusinessModel {...businessModelData} />
				</section>

				<Separator className="my-12" />

				{/* Market Opportunity */}
				<section className="mb-12">
					<MarketOpportunity {...marketOpportunityData} />
				</section>

				<Separator className="my-12" />

				{/* Technology and Competitive Advantages - Side by Side on larger screens */}
				<section className="mb-12">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<div>
							<Technology {...technologyData} />
						</div>
						<div>
							<CompetitiveAdvantages {...competitiveAdvantagesData} />
						</div>
					</div>
				</section>

				<Separator className="my-12" />

				{/* Traction & Milestones */}
				<section className="mb-12">
					<TractionMilestones {...tractionMilestonesData} />
				</section>

				<Separator className="my-12" />

				{/* Investment Details and Documents - Side by Side on larger screens */}
				<section className="mb-12">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<div>
							<InvestmentDetails {...investmentDetailsData} />
						</div>
						<div className="lg:mt-16">
							<ProjectDocuments {...projectDocumentsData} />
						</div>
					</div>
				</section>
			</div>

			<Separator className="my-12" />

			{/* Projects List Section */}
			<div>
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
							See all (50)
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
		</div>
	)
}
