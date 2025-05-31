import dynamic from 'next/dynamic'
import { SummaryCard } from '~/components/cards/summary-card'

const SignUpTrendsBarChart = dynamic(
	() =>
		import('./signup-trends-barchat').then((mod) => mod.SignUpTrendsBarChart),
	{
		ssr: true,
		loading: () => <div>Loading sign‐up chart…</div>,
	},
)

const KycStatusPieChart = dynamic(
	() => import('./kyc-metrics-piechart').then((mod) => mod.KycStatusPieChart),
	{
		ssr: true,
		loading: () => <div>Loading KYC pie chart…</div>,
	},
)

const KycStatusTable = dynamic(() => import('./kyc-status-table'), {
	ssr: true,
	loading: () => <div>Loading table…</div>,
})

import { AlertTriangle, ClipboardList, DollarSign, Users } from 'lucide-react'

export default function KycMetricsGrid() {
	return (
		<div className="space-y-4 container mx-auto">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
				<SummaryCard
					title="Total Revenue"
					value="$45,231"
					description="Total revenue this month"
					icon={<DollarSign className="w-4 h-4" />}
					variant="primary"
					trend="up"
					trendValue="+12%"
				/>

				<SummaryCard
					title="Active Users"
					value="2,350"
					description="Currently active users"
					icon={<Users className="w-4 h-4" />}
					variant="secondary"
					trend="up"
					trendValue="+5.2%"
				/>

				<SummaryCard
					title="Error Rate"
					value="0.05%"
					description="System error rate"
					icon={<AlertTriangle className="w-4 h-4" />}
					variant="destructive"
					trend="down"
					trendValue="-0.02%"
				/>

				<SummaryCard
					title="Pending Tasks"
					value="42"
					description="Tasks awaiting review"
					icon={<ClipboardList className="w-4 h-4" />}
					trend="neutral"
					trendValue="±0"
				/>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
				<SignUpTrendsBarChart />
				<KycStatusPieChart />
			</div>
			<KycStatusTable />
		</div>
	)
}
