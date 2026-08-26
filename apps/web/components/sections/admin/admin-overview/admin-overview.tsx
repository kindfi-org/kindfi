'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { useReducedMotion } from 'framer-motion'
import { AdminSectionHeader } from '~/components/sections/admin/admin-section-header'
import { getAdminStats } from '~/lib/queries/admin/get-admin-stats'
import { AdminAverageMetrics } from './admin-average-metrics'
import { AdminDistributionCards } from './admin-distribution-cards'
import { AdminFundingStats } from './admin-funding-stats'
import { AdminKeyInsights } from './admin-key-insights'
import { AdminKeyMetrics } from './admin-key-metrics'
import { AdminMainStats } from './admin-main-stats'
import { AdminOverviewError } from './admin-overview-error'
import { AdminOverviewSkeleton } from './admin-overview-skeleton'
import { AdminProjectStats } from './admin-project-stats'
import { AdminRecentActivity } from './admin-recent-activity'
import { AdminUserStats } from './admin-user-stats'

export function AdminOverview() {
	const reducedMotion = useReducedMotion()
	const {
		data: stats,
		isLoading,
		error,
	} = useSupabaseQuery('admin-stats', (client) => getAdminStats(client))

	if (isLoading) {
		return <AdminOverviewSkeleton />
	}

	if (error || !stats) {
		return <AdminOverviewError />
	}

	return (
		<div className="space-y-8">
			<AdminSectionHeader
				title="Dashboard"
				description="Platform activity, statistics, and performance metrics"
			/>

			<AdminKeyMetrics stats={stats} />
			<AdminMainStats stats={stats} reducedMotion={reducedMotion} />
			<AdminProjectStats stats={stats} reducedMotion={reducedMotion} />
			<AdminUserStats stats={stats} reducedMotion={reducedMotion} />
			<AdminFundingStats stats={stats} reducedMotion={reducedMotion} />
			<AdminAverageMetrics stats={stats} />
			<AdminDistributionCards stats={stats} />
			<AdminRecentActivity stats={stats} />
			<AdminKeyInsights stats={stats} />
		</div>
	)
}
