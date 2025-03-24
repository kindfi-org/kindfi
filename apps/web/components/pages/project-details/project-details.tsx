import { Separator } from '~/components/base/separator'
import BusinessModel from '~/components/sections/projects/BusinessModel'
import CompetitiveAdvantages from '~/components/sections/projects/CompetitiveAdvantages'
import InvestmentDetails from '~/components/sections/projects/InvestmentDetails'
import MarketOpportunity from '~/components/sections/projects/MarketOpportunity'
import ProjectDocuments from '~/components/sections/projects/ProjectDocuments'
import ProjectOverview from '~/components/sections/projects/ProjectOverview'
import Technology from '~/components/sections/projects/Technology'
import TractionMilestones from '~/components/sections/projects/TractionMilestones'
import { businessModelData } from '~/lib/mock-data/mock-business-model'
import { competitiveAdvantagesData } from '~/lib/mock-data/mock-competitive-adventage'
import { investmentDetailsData } from '~/lib/mock-data/mock-investment-details'
import { marketOpportunityData } from '~/lib/mock-data/mock-market-opportunity'
import { projectDocumentsData } from '~/lib/mock-data/mock-project-documents'
import { projectData } from '~/lib/mock-data/mock-project-overview'
import { technologyData } from '~/lib/mock-data/mock-technology'
import { tractionMilestonesData } from '~/lib/mock-data/mock-traction-milestones'

export default function ProjectDetails() {
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
		</div>
	)
}
