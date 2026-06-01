import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import type { AdminStats } from '~/lib/queries/admin/get-admin-stats'
import { formatPercent } from './formatters'

type AdminKeyInsightsProps = {
	stats: AdminStats
}

export function AdminKeyInsights({ stats }: AdminKeyInsightsProps) {
	return (
		<div>
			<h2 className="text-2xl font-bold mb-4 text-pretty">Key Insights</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<Card className="border-l-4 border-l-green-700">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold tabular-nums">
							{formatPercent(
								stats.recentActivity.projects > 0 && stats.totalProjects > 0
									? (stats.recentActivity.projects / stats.totalProjects) *
											100
									: 0,
							)}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							New projects this week
						</p>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-blue-500">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">
							User Growth Rate
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold tabular-nums">
							{formatPercent(
								stats.recentActivity.users > 0 && stats.totalUsers > 0
									? (stats.recentActivity.users / stats.totalUsers) * 100
									: 0,
							)}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							New users this week
						</p>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-purple-500">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">
							Engagement Rate
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold tabular-nums">
							{stats.totalUsers > 0 && stats.totalProjects > 0
								? (stats.totalProjects / stats.totalUsers).toFixed(2)
								: '0'}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Projects per user
						</p>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-orange-500">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">Active Rate</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold tabular-nums">
							{formatPercent(
								stats.totalProjects > 0
									? (stats.activeProjects / stats.totalProjects) * 100
									: 0,
							)}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Projects currently active
						</p>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-indigo-500">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">
							Creator Ratio
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold tabular-nums">
							{formatPercent(
								stats.totalUsers > 0
									? (stats.creatorUsers / stats.totalUsers) * 100
									: 0,
							)}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Users who are creators
						</p>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-red-500">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">Donor Ratio</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold tabular-nums">
							{formatPercent(
								stats.totalUsers > 0
									? (stats.donorUsers / stats.totalUsers) * 100
									: 0,
							)}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Users who are donors
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
