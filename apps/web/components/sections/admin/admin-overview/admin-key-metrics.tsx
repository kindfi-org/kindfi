import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import type { AdminStats } from '~/lib/queries/admin/get-admin-stats'
import { formatCurrency, formatPercent } from './formatters'

type AdminKeyMetricsProps = {
	stats: AdminStats
}

export function AdminKeyMetrics({ stats }: AdminKeyMetricsProps) {
	return (
		<div>
			<h2 className="text-2xl font-bold mb-4 text-pretty">
				Key Platform Metrics
			</h2>
			<p className="text-sm text-muted-foreground mb-4">
				Essential statistics for understanding platform health and growth
			</p>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="border-2 border-green-300 bg-green-100/60">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-green-900">
							Total Community
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-green-900 tabular-nums">
							{stats.totalUsers}
						</div>
						<p className="text-xs text-green-800 mt-1">
							{stats.creatorUsers} creators • {stats.donorUsers} donors
						</p>
					</CardContent>
				</Card>

				<Card className="border-2 border-blue-200 bg-blue-50/50">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-blue-900">
							Active Campaigns
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-blue-900 tabular-nums">
							{stats.activeProjects}
						</div>
						<p className="text-xs text-blue-700 mt-1">
							{stats.totalProjects} total projects
						</p>
					</CardContent>
				</Card>

				<Card className="border-2 border-purple-200 bg-purple-50/50">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-purple-900">
							Total Raised
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-purple-900 tabular-nums">
							{formatCurrency(stats.totalDonations)}
						</div>
						<p className="text-xs text-purple-700 mt-1">
							{formatPercent(stats.fundingProgress)} of total target
						</p>
					</CardContent>
				</Card>

				<Card className="border-2 border-orange-200 bg-orange-50/50">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-orange-900">
							Success Rate
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-orange-900 tabular-nums">
							{stats.totalProjects > 0
								? formatPercent(
										(stats.fundedProjects / stats.totalProjects) * 100,
									)
								: formatPercent(0)}
						</div>
						<p className="text-xs text-orange-700 mt-1">
							{stats.fundedProjects} funded projects
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
