import { KycTableSkeleton } from '~/components/dashboard/skeletons/kyc-table-skeleton'
import { MetricsGridSkeleton } from '~/components/dashboard/skeletons/metrics-grid-skeleton'
import { SignupChartSkeleton } from '~/components/dashboard/skeletons/signup-chart-skeleton'

export function DashboardSkeleton() {
	return (
		<div
			className="@container/main flex flex-1 flex-col gap-2"
			aria-busy="true"
		>
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<MetricsGridSkeleton />
				<SignupChartSkeleton />
				<KycTableSkeleton />
			</div>
		</div>
	)
}
