import { MetricsGridContainer } from '~/components/dashboard/cards/metrics-grid-container'
import { SignupChartContainer } from '~/components/dashboard/charts/signup-chart-container'

export default function Dashboard() {
	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<MetricsGridContainer />
				<div className="px-4 lg:px-6">
					<SignupChartContainer />
				</div>
			</div>
		</div>
	)
}
