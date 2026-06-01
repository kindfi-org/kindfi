import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import type { AdminStats } from './types'
import { formatCurrency } from './utils'

type AverageMetricsProps = {
	stats: AdminStats
}

export const AverageMetrics = ({ stats }: AverageMetricsProps) => (
	<div>
		<h2 className="text-2xl font-bold mb-4 text-pretty">Average Metrics</h2>
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium">Avg Project Goal</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold tabular-nums">
						{stats.totalProjects > 0
							? formatCurrency(stats.totalTarget / stats.totalProjects)
							: formatCurrency(0)}
					</div>
					<p className="text-xs text-muted-foreground mt-1">Per project target</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium">Avg Project Raised</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold tabular-nums">
						{stats.totalProjects > 0
							? formatCurrency(stats.totalDonations / stats.totalProjects)
							: formatCurrency(0)}
					</div>
					<p className="text-xs text-muted-foreground mt-1">Per project average</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium">Avg Contribution</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold tabular-nums">
						{stats.recentActivity.contributions > 0
							? formatCurrency(
									stats.recentActivity.contributionsAmount /
										stats.recentActivity.contributions,
									{ maxFractionDigits: 2 },
								)
							: formatCurrency(0, { maxFractionDigits: 2 })}
					</div>
					<p className="text-xs text-muted-foreground mt-1">
						Last 7 days average
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium">
						Projects per Foundation
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold tabular-nums">
						{stats.totalFoundations > 0
							? (stats.totalProjects / stats.totalFoundations).toFixed(1)
							: '0'}
					</div>
					<p className="text-xs text-muted-foreground mt-1">Average campaigns</p>
				</CardContent>
			</Card>
		</div>
	</div>
)
