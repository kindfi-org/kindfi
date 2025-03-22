import {
	companyResources,
	financialOverview,
	highlightItems,
	highlightedUpdate,
	investors,
} from '~/lib/mock-data/project/mock-overview-section'
import { FeaturedUpdate } from './FeaturedUpdate'
import { FinancialSummary } from './FinancialSummary'
import { InvestmentTerms } from './InvestmentTerms'
import { KeyHighlights } from './KeyHighlights'
import { LeadInvestors } from './LeadInvestors'

export function OverviewSection() {
	return (
		<section
			className="w-full max-w-5xl mx-auto py-10 px-4"
			aria-labelledby="overview-section-title"
		>
			<h1 id="overview-section-title" className="sr-only">
				Project Overview
			</h1>
			<KeyHighlights items={highlightItems} />
			<FinancialSummary data={financialOverview} />
			<InvestmentTerms data={companyResources} />
			<FeaturedUpdate data={highlightedUpdate} />
			<LeadInvestors investors={investors} />
		</section>
	)
}
