import { useCallback, useEffect, useState } from 'react'
import { UserMetricCard } from '~/components/dashboard/cards/user-metric-card'
import { metricsConfig } from '~/lib/constants/dashboard'
import { cn } from '~/lib/utils'

interface UserMetricsGridProps {
	className?: string
}

interface TrendData {
	value: number
	isPositive: boolean
}

interface UserMetrics {
	totalUsers: number
	pending: number
	approved: number
	rejected: number
	trends: {
		totalUsers: TrendData
		pending: TrendData
		approved: TrendData
		rejected: TrendData
	}
}

export function UserMetricsGrid({ className }: UserMetricsGridProps) {
	const [stats, setStats] = useState<UserMetrics | null>(null)
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
						type="button"
						onClick={fetchUserStats}
						className="text-sm text-red-700 underline"
					>
						Try again
					</button>
				</div>
			</div>
		)
	}

	if (isLoading || !stats) {
		return (
			<div className="grid grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 gap-4 px-4">
				{metricsConfig.map((metric) => (
					<div
						key={metric.key}
						className="h-32 rounded-lg border animate-pulse bg-gray-100"
					>
						<div className="p-4 space-y-3">
							<div className="h-4 bg-gray-200 rounded w-3/4"></div>
							<div className="h-8 bg-gray-200 rounded w-1/2"></div>
						</div>
					</div>
				))}
			</div>
		)
	}

	return (
		<div className={cn("grid grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 gap-4 px-4", className)}>
			{metricsConfig.map((metric) => {
				const metricKey = metric.key as keyof Omit<UserMetrics, 'trends'>
				const trend = stats.trends[metricKey]
				return (
					<UserMetricCard
						key={metric.key}
						title={metric.title}
						value={stats[metricKey]}
						trendValue={trend.value}
						isPositive={trend.isPositive}
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
