import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import type { AdminStats } from '~/lib/queries/admin/get-admin-stats'
import { formatPercent } from './formatters'

type AdminDistributionCardsProps = {
	stats: AdminStats
}

export function AdminDistributionCards({ stats }: AdminDistributionCardsProps) {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-pretty">Projects Distribution</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{Object.entries(stats.projectsByStatus || {})
							.toSorted(([, a], [, b]) => b - a)
							.map(([status, count]) => {
								const percentage =
									stats.totalProjects > 0
										? (count / stats.totalProjects) * 100
										: 0
								return (
									<div key={status} className="space-y-1 min-w-0">
										<div className="flex items-center justify-between text-sm gap-2">
											<span className="capitalize font-medium truncate">
												{status}
											</span>
											<span className="text-muted-foreground tabular-nums shrink-0">
												{count} ({formatPercent(percentage)})
											</span>
										</div>
										<div className="w-full bg-muted rounded-full h-2">
											<div
												className="bg-primary h-2 rounded-full transition-[width] duration-300 ease-out"
												style={{ width: `${percentage}%` }}
											/>
										</div>
									</div>
								)
							})}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-pretty">Users Distribution</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{Object.entries(stats.usersByRole || {})
							.toSorted(([, a], [, b]) => b - a)
							.map(([role, count]) => {
								const percentage =
									stats.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0
								return (
									<div key={role} className="space-y-1 min-w-0">
										<div className="flex items-center justify-between text-sm gap-2">
											<span className="capitalize font-medium truncate">
												{role}
											</span>
											<span className="text-muted-foreground tabular-nums shrink-0">
												{count} ({formatPercent(percentage)})
											</span>
										</div>
										<div className="w-full bg-muted rounded-full h-2">
											<div
												className="bg-primary h-2 rounded-full transition-[width] duration-300 ease-out"
												style={{ width: `${percentage}%` }}
											/>
										</div>
									</div>
								)
							})}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
