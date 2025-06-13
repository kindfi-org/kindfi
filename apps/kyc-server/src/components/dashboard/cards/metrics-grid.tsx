import { MetricCard } from '~/components/dashboard/cards/metric-card'
import { metricsConfig } from '~/lib/constants/metrics'
import type { KycStats } from '~/lib/types/dashboard'
import { cn } from '~/lib/utils'

interface MetricsGridProps {
	stats: KycStats
	className?: string
}

export function MetricsGrid({ stats, className }: MetricsGridProps) {
	return (
		<div
			className={cn(
				'*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6',
				className,
			)}
		>
			{metricsConfig.map((metric) => {
				return (
					<MetricCard
						key={metric.key}
						title={metric.title}
						value={stats[metric.key]}
						trendValue={stats.trends[metric.key].value}
						isPositive={stats.trends[metric.key].isPositive}
						icon={metric.icon}
						iconColor={metric.iconColor}
						text={metric.text}
						description={metric.description}
					/>
				)
			})}
		</div>
	)
}
