import { useCallback, useEffect, useState } from 'react'
import { MetricsGrid } from '~/components/dashboard/cards/metrics-grid'
import { MetricCardSkeleton } from '~/components/dashboard/skeletons/metric-card-skeleton'
import type { KycStats } from '~/lib/types/dashboard'
import { cn } from '~/lib/utils'

interface MetricsGridContainerProps {
	className?: string
}

export function MetricsGridContainer({ className }: MetricsGridContainerProps) {
	const [stats, setStats] = useState<KycStats | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchUserStats = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)

			const response = await fetch('/api/users/stats')
			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch stats')
			}

			if (result.success) {
				setStats(result.data)
			} else {
				throw new Error('Invalid response')
			}
		} catch (err: unknown) {
			console.error('Stats fetch error:', err)
			const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
			setError(errorMessage)
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchUserStats()
		// Auto-refresh every 30 seconds
		const interval = setInterval(fetchUserStats, 30000)

		return () => clearInterval(interval)
	}, [fetchUserStats])

	if (error) {
		return (
			<div className="flex items-center justify-center h-32 px-4 rounded-lg border border-red-200 bg-red-50" role="alert">
				<div className="text-center">
					<p className="text-red-600">Failed to load stats</p>
					<p className="text-red-500 text-sm">{error}</p>
					<button
						onClick={fetchUserStats}
						className="mt-2 px-3 py-1 text-xs text-red-600 hover:text-red-700 underline"
						type="button"
					>
						Try again
					</button>
				</div>
			</div>
		)
	}

	if (isLoading || !stats) {
		return (
			<div className={cn(
				'*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6',
				className,
			)}>
				{Array.from({ length: 4 }).map((_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: safe for static skeleton rendering
					<MetricCardSkeleton key={index} />
				))}
			</div>
		)
	}

	return <MetricsGrid stats={stats} className={className} />
}