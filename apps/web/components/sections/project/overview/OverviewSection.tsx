import { FeaturedUpdate } from './FeaturedUpdate'
import { FinancialSummary } from './FinancialSummary'
import { InvestmentTerms } from './InvestmentTerms'
import { KeyHighlights } from './KeyHighlights'

export function OverviewSection() {
	return (
		<section className="w-full max-w-5xl mx-auto py-10 px-4">
			<KeyHighlights />
			<FinancialSummary />
			<InvestmentTerms />
			<FeaturedUpdate />
		</section>
	)
}
