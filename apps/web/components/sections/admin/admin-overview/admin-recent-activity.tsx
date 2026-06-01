import { Badge } from '~/components/base/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/base/card'
import type { AdminStats } from '~/lib/queries/admin/get-admin-stats'
import { formatCurrency } from './formatters'

type AdminRecentActivityProps = {
	stats: AdminStats
}

export function AdminRecentActivity({ stats }: AdminRecentActivityProps) {
	return (
		<div>
			<h2 className="text-2xl font-bold mb-4 text-pretty">Recent Activity (Last 7 Days)</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">New Projects</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold mb-4">{stats.recentActivity.projects}</div>
						<div className="space-y-2">
							{Object.keys(stats.recentActivity.projectsByStatus || {}).length > 0 ? (
								Object.entries(stats.recentActivity.projectsByStatus || {}).map(
									([status, count]) => (
										<div
											key={status}
											className="flex items-center justify-between text-sm gap-2 min-w-0"
										>
											<Badge variant="outline" className="capitalize truncate">
												{status}
											</Badge>
											<span className="font-medium tabular-nums shrink-0">{count}</span>
										</div>
									),
								)
							) : (
								<p className="text-sm text-muted-foreground">No projects created this week</p>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-lg">New Users</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold mb-4">{stats.recentActivity.users}</div>
						<div className="space-y-2">
							{Object.keys(stats.recentActivity.usersByRole || {}).length > 0 ? (
								Object.entries(stats.recentActivity.usersByRole || {}).map(([role, count]) => (
									<div
										key={role}
										className="flex items-center justify-between text-sm gap-2 min-w-0"
									>
										<Badge variant="outline" className="capitalize truncate">
											{role}
										</Badge>
										<span className="font-medium tabular-nums shrink-0">{count}</span>
									</div>
								))
							) : (
								<p className="text-sm text-muted-foreground">No users registered this week</p>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-lg">New Foundations</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{stats.recentActivity.foundations}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-lg">New Contributions</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold mb-2 tabular-nums">
							{stats.recentActivity.contributions}
						</div>
						<div className="text-sm text-muted-foreground">
							Total:{' '}
							{formatCurrency(stats.recentActivity.contributionsAmount, {
								maxFractionDigits: 2,
							})}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
