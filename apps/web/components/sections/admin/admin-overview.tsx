'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { useReducedMotion } from 'framer-motion'
import { AdminSectionHeader } from '~/components/sections/admin/admin-section-header'
import { AdminOverviewError } from '~/components/sections/admin/admin-overview/admin-overview-error'
import { AdminOverviewSkeleton } from '~/components/sections/admin/admin-overview/admin-overview-skeleton'
import { AverageMetrics } from '~/components/sections/admin/admin-overview/average-metrics'
import { DistributionBreakdowns } from '~/components/sections/admin/admin-overview/distribution-breakdowns'
import { FundingStats } from '~/components/sections/admin/admin-overview/funding-stats'
import { KeyInsights } from '~/components/sections/admin/admin-overview/key-insights'
import { KeyPlatformMetrics } from '~/components/sections/admin/admin-overview/key-platform-metrics'
import { MainStatsGrid } from '~/components/sections/admin/admin-overview/main-stats-grid'
import { ProjectStatusGrid } from '~/components/sections/admin/admin-overview/project-status-grid'
import { RecentActivity } from '~/components/sections/admin/admin-overview/recent-activity'
import { UserRoleGrid } from '~/components/sections/admin/admin-overview/user-role-grid'
import { getAdminStats } from '~/lib/queries/admin/get-admin-stats'

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

			<KeyPlatformMetrics stats={stats} />
			<MainStatsGrid stats={stats} reducedMotion={reducedMotion} />
			<ProjectStatusGrid stats={stats} reducedMotion={reducedMotion} />
			<UserRoleGrid stats={stats} reducedMotion={reducedMotion} />
			<FundingStats stats={stats} reducedMotion={reducedMotion} />
			<AverageMetrics stats={stats} />
			<DistributionBreakdowns stats={stats} />
			<RecentActivity stats={stats} />
			<KeyInsights stats={stats} />
		</div>
	)
}
