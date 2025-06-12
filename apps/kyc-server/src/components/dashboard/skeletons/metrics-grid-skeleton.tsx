import { MetricCardSkeleton } from '~/components/dashboard/skeletons/metric-card-skeleton'

export function MetricsGridSkeleton() {
	return (
		<div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
			{[...Array(4)].map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: safe to use index for static skeletons
				<MetricCardSkeleton key={i} />
			))}
		</div>
	)
}
