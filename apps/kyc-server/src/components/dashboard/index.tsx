import { useEffect, useState } from 'react'

import {
	mockKycRecords,
	mockKycStats,
	mockSignupChartData,
} from '~/lib/mock-data/dashboard'
import { MetricsGrid } from './cards/metrics-grid'
import { SignupChart } from './charts/signup-chart'
import { DashboardSkeleton } from './skeletons/dashboard-skeleton'
import { KycTable } from './table/kyc-table'

export function Dashboard() {
	const [isLoading, setIsLoading] = useState(true)

	// Simulate loading state
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false)
		}, 2000) // 2 second loading simulation

		return () => clearTimeout(timer)
	}, [])

	return isLoading ? (
		<DashboardSkeleton />
	) : (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<MetricsGrid stats={mockKycStats} />
				<div className="px-4 lg:px-6">
					<SignupChart data={mockSignupChartData} />
				</div>
				<KycTable data={mockKycRecords} />
			</div>
		</div>
	)
}
